import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { PipelineModel } from '../pipeline.model.js'
import PipelineBit from '../fce/pipeline.bit.js'
import {
    EpisodeStackManifest,
    EpisodeStackManifestSchema,
    EpisodeStackSceneEntry,
} from '../fce/pipeline.interface.js'
import State from '../../99.core/state.js'
import {
    auditFountainSixCategories,
    parseFountainDialogue,
    sortStackedScreenplayFiles,
} from '../../34.abstractsyntaxtree.unit/buz/fountainTokenizer.buzz.js'
import { frameToSmpteTimecode24 } from '../../24.frame.unit/buz/frame.buzz.js'
import { canonicalJsonStringify } from '../../30.canon.unit/buz/canon.buzz.js'
import { reconcileEpisodeAgendaCompliance } from '../../25.episode.unit/buz/episode.buzz.js'
import { compileSceneAgendaTentpoleCue } from '../../12.scene.unit/buz/scene.buzz.js'

export const initPipeline = (
    cpy: PipelineModel,
    bal: PipelineBit,
    _ste: State,
) => {
    return cpy
}

export const updatePipeline = (
    cpy: PipelineModel,
    bal: PipelineBit,
    _ste: State,
) => {
    return cpy
}

export interface CompileAutoScriptOptions {
    manifestOutPath?: string
    writeManifest?: boolean
    allowIncomplete?: boolean
    diagnosticMode?: boolean
    expectedAgendaBeats?: Array<Record<string, any>>
    requireAllScheduledBeats?: boolean
}

export function compileAutoScriptDirectoryPipeline(
    inputDir: string,
    options: CompileAutoScriptOptions = {},
): EpisodeStackManifest {
    if (typeof inputDir !== 'string' || inputDir.length === 0) {
        throw new Error('[AUTO_SCRIPT_INPUT_DIR_MISSING] Empty inputDir')
    }
    if (inputDir.includes('..')) {
        throw new Error(
            `[AUTO_SCRIPT_PATH_TRAVERSAL] inputDir [${inputDir}] rejected`,
        )
    }
    if (
        options.manifestOutPath !== undefined &&
        options.manifestOutPath.includes('..')
    ) {
        throw new Error(
            `[AUTO_SCRIPT_PATH_TRAVERSAL] manifestOutPath [${options.manifestOutPath}] rejected`,
        )
    }
    const resolved = path.resolve(inputDir)
    if (!fs.existsSync(resolved)) {
        throw new Error(
            `[AUTO_SCRIPT_INPUT_DIR_MISSING] Path does not exist: ${inputDir}`,
        )
    }
    const stat = fs.statSync(resolved)
    if (!stat.isDirectory()) {
        throw new Error(
            `[AUTO_SCRIPT_INPUT_DIR_MISSING] Not a directory: ${inputDir}`,
        )
    }
    const dirFiles = fs.readdirSync(resolved)
    const sorted = sortStackedScreenplayFiles(dirFiles)
    const allowIncomplete = Boolean(
        options.allowIncomplete || options.diagnosticMode,
    )
    const scenes: EpisodeStackSceneEntry[] = []
    let cumulative = 0
    for (let i = 0; i < sorted.length; i++) {
        const fileName = sorted[i]!
        const fullPath = path.join(resolved, fileName)
        const text = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n')
        const siblingAst = fullPath.replace(/\.fountain$/, '.ast.json')
        if (fs.existsSync(siblingAst)) {
            try {
                fs.readFileSync(siblingAst, 'utf8')
            } catch {
                // sibling parse optional
            }
        }
        const report = auditFountainSixCategories(text)
        if (!report.allValid && !allowIncomplete) {
            throw new Error(
                `[AUTO_SCRIPT_SIX_CATEGORY_INCOMPLETE] File [${fileName}] failed six-category audit`,
            )
        }
        const turns = parseFountainDialogue(text)
        const turnCount = turns.length
        const frameCount = Math.max(48, turnCount * 48)
        const startDate =
            report.dateHeader ?? report.chronology.date ?? '2026-01-01'
        const startTimeHm =
            report.startTimeHm ?? report.chronology.startTimeHm ?? '00:00'
        const daypart = report.chronology.daypart ?? 'NIGHT'
        const baseName = fileName.replace(/\.fountain$/, '')
        const sceneId =
            report.chronology.scene ?? baseName.replace(/[^A-Za-z0-9_]/g, '_')
        const episodeFrom = cumulative
        const episodeTo = cumulative + frameCount - 1
        const episodeFromTimecode = frameToSmpteTimecode24(episodeFrom)
        const episodeToTimecode = frameToSmpteTimecode24(episodeTo)
        const sceneTimecode = frameToSmpteTimecode24(0, startTimeHm)
        const scriptSha256 = crypto
            .createHash('sha256')
            .update(text, 'utf8')
            .digest('hex')
        const agendaBeatIdForCue =
            report.chronology.agendaBeatId ?? report.chronology.agenda?.beatId
        const scheduledTimeForCue =
            report.chronology.scheduledTime ??
            report.chronology.agenda?.scheduledTime
        const reserveHeldTicksForCue =
            report.chronology.reserveHeldTicks ??
            report.chronology.agenda?.reserveHeldTicks ??
            0
        const tentpoleCue = compileSceneAgendaTentpoleCue({
            chronology:
                agendaBeatIdForCue !== undefined &&
                scheduledTimeForCue !== undefined
                    ? {
                          agenda: {
                              agenda_beat_id: agendaBeatIdForCue,
                              scheduled_time: scheduledTimeForCue,
                              reserve_held_ticks: reserveHeldTicksForCue,
                          },
                      }
                    : {},
        })
        scenes.push({
            sequence_index: i,
            file_name: fileName,
            scene_id: sceneId,
            start_date: startDate,
            start_time_hm: startTimeHm,
            daypart,
            turn_count: turnCount,
            frame_count: frameCount,
            episode_from_frame: episodeFrom,
            episode_to_frame: episodeTo,
            episode_from_timecode: episodeFromTimecode,
            episode_to_timecode: episodeToTimecode,
            scene_timecode: sceneTimecode,
            six_category_valid: report.allValid,
            script_sha256: scriptSha256,
            ...(report.chronology.agendaBeatId !== undefined ||
            report.chronology.agenda?.beatId !== undefined
                ? {
                      agenda_beat_id:
                          report.chronology.agendaBeatId ??
                          report.chronology.agenda?.beatId,
                  }
                : {}),
            ...(report.chronology.scheduledTime !== undefined ||
            report.chronology.agenda?.scheduledTime !== undefined
                ? {
                      scheduled_time:
                          report.chronology.scheduledTime ??
                          report.chronology.agenda?.scheduledTime,
                  }
                : {}),
            ...(report.chronology.reserveHeldTicks !== undefined ||
            report.chronology.agenda?.reserveHeldTicks !== undefined
                ? {
                      reserve_held_ticks:
                          report.chronology.reserveHeldTicks ??
                          report.chronology.agenda?.reserveHeldTicks,
                  }
                : {}),
            agendaTentpole: tentpoleCue.agendaTentpole,
            slateLeadPauseFrames: tentpoleCue.slateLeadPauseFrames,
        })
        cumulative += frameCount
    }
    const agendaCompliance = reconcileEpisodeAgendaCompliance(
        scenes as Array<Record<string, any>>,
        (options.expectedAgendaBeats ?? []) as Array<Record<string, any>>,
    )
    if (options.requireAllScheduledBeats && !agendaCompliance.compliant) {
        throw new Error(
            `[AGENDA_DEADLINE_MISSED] Missing beat(s): ${agendaCompliance.missingBeatIds.join(', ')}`,
        )
    }
    const manifest: EpisodeStackManifest = {
        schema_version: '1.0.0',
        scene_count: scenes.length,
        total_frames: cumulative,
        total_duration_ms: Math.round((cumulative / 24) * 1000),
        scenes,
        agendaCompliance,
    }
    EpisodeStackManifestSchema.parse(manifest)
    if (options.manifestOutPath !== undefined) {
        const outPath = path.resolve(options.manifestOutPath)
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8')
    } else if (options.writeManifest) {
        const outPath = path.join(resolved, 'episode_manifest.json')
        fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8')
    }
    return manifest
}

export const batchIngestAutoScripts = (
    cpy: PipelineModel,
    bal: PipelineBit,
    _ste: State,
) => {
    const inputDir = String(bal.dat?.inputDir ?? bal.src ?? '')
    const manifest = compileAutoScriptDirectoryPipeline(inputDir, {
        allowIncomplete: Boolean(bal.dat?.allowIncomplete),
        diagnosticMode: Boolean(bal.dat?.diagnosticMode),
        manifestOutPath: bal.dat?.manifestOutPath,
    })
    cpy.lastBatchManifest = manifest
    cpy.processedSceneCount = manifest.scene_count
    if (bal.slv)
        bal.slv({
            pipBit: {
                idx: 'batch-ingest-auto-scripts-success',
                val: 1,
                dat: { manifest },
            },
        })
    return cpy
}

export const compileEpisodeStack = (
    cpy: PipelineModel,
    bal: PipelineBit,
    _ste: State,
) => {
    const inputDir = String(bal.dat?.inputDir ?? bal.src ?? '')
    const manifest = compileAutoScriptDirectoryPipeline(inputDir, {
        allowIncomplete: Boolean(bal.dat?.allowIncomplete),
        diagnosticMode: Boolean(bal.dat?.diagnosticMode),
        manifestOutPath: bal.dat?.manifestOutPath,
    })
    cpy.lastBatchManifest = manifest
    cpy.processedSceneCount = manifest.scene_count
    if (bal.slv)
        bal.slv({
            pipBit: {
                idx: 'compile-episode-stack-success',
                val: 1,
                dat: { manifest },
            },
        })
    return cpy
}

export function verifyConductorStackReplayEquivalence(
    dirA: string,
    dirB: string,
): {
    equivalent: boolean
    digestA: string
    digestB: string
    mismatches: string[]
} {
    const manifestA = compileAutoScriptDirectoryPipeline(dirA)
    const manifestB = compileAutoScriptDirectoryPipeline(dirB)
    const digestA = crypto
        .createHash('sha256')
        .update(canonicalJsonStringify(manifestA), 'utf8')
        .digest('hex')
    const digestB = crypto
        .createHash('sha256')
        .update(canonicalJsonStringify(manifestB), 'utf8')
        .digest('hex')
    const mismatches: string[] = []
    if (manifestA.scene_count !== manifestB.scene_count) {
        mismatches.push(
            `scene_count ${manifestA.scene_count} != ${manifestB.scene_count}`,
        )
    }
    const maxLen = Math.max(manifestA.scenes.length, manifestB.scenes.length)
    for (let i = 0; i < maxLen; i++) {
        const a = manifestA.scenes[i]
        const b = manifestB.scenes[i]
        if (!a || !b) {
            mismatches.push(`scene index ${i} missing on one side`)
            continue
        }
        if (canonicalJsonStringify(a) !== canonicalJsonStringify(b)) {
            mismatches.push(`scene ${a.file_name} diverged`)
        }
    }
    return {
        equivalent: digestA === digestB && mismatches.length === 0,
        digestA,
        digestB,
        mismatches,
    }
}
