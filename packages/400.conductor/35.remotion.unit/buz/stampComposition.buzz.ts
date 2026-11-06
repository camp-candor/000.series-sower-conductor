import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {
    SceneShotPlan,
    StampCompositionOptions,
    StampCompositionReceipt,
} from '../fce/remotion.interface.js'
import { generateShotCameraWrapper } from './hookIsolation.buzz.js'
import { generateOpticalStackJsx } from './opticalStack.buzz.js'

export function calculateDuckVolumeExpression(shots: SceneShotPlan[]): string {
    if (shots.length === 0) return '(f) => 1.0'

    const conditions = shots.map(
        (s) =>
            `(f >= ${s.fromFrame} && f <= ${s.fromFrame + s.durationFrames - 1})`,
    )
    return `(f) => (${conditions.join(' || ')} ? 0.20 : 1.0)`
}

export async function stampStaticComposition(
    sceneId: string,
    shots: SceneShotPlan[] = [],
    options: StampCompositionOptions = {},
): Promise<StampCompositionReceipt> {
    const packageRoot = process.cwd().endsWith('400.conductor')
        ? process.cwd()
        : path.resolve(process.cwd(), 'packages/400.conductor')
    const outputDir =
        options.outputDirectory ||
        path.resolve(packageRoot, '35.remotion.unit/drafts')
    const targetPath = path.join(outputDir, `Master_${sceneId}.tsx`)
    const candidatePath = path.join(
        outputDir,
        `Master_${sceneId}.candidate.tsx`,
    )

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    // Check if active file is locked
    let isLocked = false
    if (fs.existsSync(targetPath)) {
        const existingContent = fs.readFileSync(targetPath, 'utf8')
        if (existingContent.includes('@lifecycle: locked')) {
            isLocked = true
        }
    }

    const destinationPath = isLocked ? candidatePath : targetPath
    const upstreamAstHash =
        options.upstreamAstHash ||
        '0000000000000000000000000000000000000000000000000000000000000000'
    const ambientPath =
        options.ambientLoopPath || 'assets/audio/beds/bunker_hum_loop.wav'

    const totalFrames = shots.reduce(
        (acc, s) => Math.max(acc, s.fromFrame + s.durationFrames),
        0,
    )
    const duckExpression = calculateDuckVolumeExpression(shots)

    let wrapperComponents = ''
    let sequenceNodes = ''

    if (options.audioOnly) {
        const dialogueSequences = shots.map(s => {
            const clipPath = s.audioWavPath || `audio/dialogue/${s.shotIndex}.wav`;
            return `          {/* Track 1: Dialogue */}
          <Sequence from={${s.fromFrame}} durationInFrames={${s.durationFrames}}>
            <Audio src={staticFile('${clipPath}')} />
          </Sequence>`;
        }).join('\n');


        const foleySequences = (options.foleyClips || []).map(f => {
            return `          {/* Track 2: Foley */}
          <Sequence from={${f.fromFrame}} durationInFrames={${f.durationInFrames}}>
            <Audio src={staticFile('${f.foleyPath}')} volume={${f.volumeLinear}} />
          </Sequence>`;
        }).join('\n');


        sequenceNodes = `
${dialogueSequences}
${foleySequences}`;

    } else {
        wrapperComponents = shots.map((s, idx) => generateShotCameraWrapper(idx + 1, s)).join('\n\n');
        sequenceNodes = shots.map((s, idx) => generateOpticalStackJsx(idx + 1, s)).join('\n\n');
    }

    // Construct raw TSX body with raw unquoted numeric literals
    const bodyContent = `
import React from 'react';
import { Composition, Sequence, Audio, Img, Video, staticFile, useCurrentFrame, interpolate } from 'remotion';

${wrapperComponents}

export const Master_${sceneId}: React.FC = () => {
  return (
    <Composition
      id="${sceneId}"
      durationInFrames={${totalFrames}}
      fps={24}
      width={1920}
      height={1080}
      component={() => (
        <>
          {/* Track 3: Ambient Bed with Automatic Speech Ducking (-14.0 dB) */}
          <Audio
            src={staticFile('${ambientPath}')}
            volume={${duckExpression}}
          />

${sequenceNodes}
        </>
      )}
    />
  );
};
`.trim()

    // Normalize LF line endings and compute SHA-256 body checksum
    const normalizedBody = bodyContent.replace(/\r\n/g, '\n')


    const checksumSha256 = crypto
        .createHash('sha256')
        .update(normalizedBody)
        .digest('hex')

    const lifecycleTag = isLocked ? 'candidate' : 'generated'
    const fileHeader = `
// @lifecycle: ${lifecycleTag}
// @checksum: ${checksumSha256}
// @upstream_ast: sha256:${upstreamAstHash}
`.trim()

    const fullFileText = `${fileHeader}

${normalizedBody}
`

    // Atomic POSIX write via temporary file
    const tmpPath = `${destinationPath}.tmp_${crypto.randomUUID()}`
    fs.writeFileSync(tmpPath, fullFileText, 'utf8')
    fs.renameSync(tmpPath, destinationPath)

    if (isLocked) {
        process.stdout.write(
            `>> [LOCKED-REFUSAL] Destination Master_${sceneId}.tsx is @locked. Stamped candidate Master_${sceneId}.candidate.tsx.
`,
        )
    } else {
        process.stdout.write(
            `>> [METAPROGRAM] [OK] Stamped drafts/Master_${sceneId}.tsx (${totalFrames} frames across ${shots.length} shots).
`,
        )
    }

    return {
        ok: true,
        sceneId,
        destinationPath,
        totalFrames,
        shotCount: shots.length,
        checksumSha256,
        wasClobberRefused: isLocked,
        lifecycleStatus: lifecycleTag,
        t0Spend: '$0.00',
    }
}
