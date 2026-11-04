import { ShotBakingInput, formatUnquotedLiteral } from './literalBaking.buzz.js';

export function generateDespillSvgFilter(): string {
  return `
      {/* Layer 3: Algorithmic Chroma Despill Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="greenscreen-despill">
          <feColorMatrix
            type="matrix"
            values="
              1.00 0.00 0.00 0.00 0.00
              0.00 0.85 0.00 0.00 0.00
              0.00 0.00 1.00 0.00 0.00
              0.00 0.00 0.00 1.00 0.00
            "
          />
        </filter>
      </svg>
  `.trim();
}

export function generateVectorTypographyComponent(dialogueText: string, characterId: string): string {
  const cleanText = dialogueText.replace(/[\\"]/g, '\\$&').replace(/\n/g, ' ');
  return `
        {/* Layer 2: Practical Atmosphere & Vector Typography (Zero-Diffusion Text Rule) */}
        <div style={{
          position: 'absolute',
          bottom: 48,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 20
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 18,
            letterSpacing: 2,
            color: '#A0AEC0',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            {${JSON.stringify(characterId)}}
          </span>
          <p style={{
            fontFamily: 'sans-serif',
            fontSize: 28,
            fontWeight: 600,
            color: '#FFFFFF',
            textAlign: 'center',
            maxWidth: 1400,
            lineHeight: 1.4,
            textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)',
            margin: 0,
            padding: '0 32px'
          }}>
            {${JSON.stringify(cleanText)}}
          </p>
        </div>
  `.trim();
}

export function generateShotComponentCode(shot: ShotBakingInput, index: number): string {
  const compName = `Shot${(index + 1).toString().padStart(2, '0')}CameraWrapper`;
  const dur = formatUnquotedLiteral(shot.deliveryFrames);
  const from = formatUnquotedLiteral(shot.fromFrame);
  const trim = formatUnquotedLiteral(shot.trimEndFrames);
  const origX = formatUnquotedLiteral(shot.transformOriginX);
  const origY = formatUnquotedLiteral(shot.transformOriginY);
  const initScale = formatUnquotedLiteral(shot.initialScale);
  const targetScale = formatUnquotedLiteral(shot.targetScale);

  return `
// Sequence-Relative Scoped Camera Rig for Shot ${shot.shotId}
const ${compName}: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, ${dur}], [0, 1], { extrapolateRight: 'clamp' });
  const cameraScale = interpolate(progress, [0, 1], [${initScale}, ${targetScale}]);

  return (
    <div style={{
      position: 'relative',
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      transformOrigin: \`\${${origX}}% \${${origY}}%\`,
      transform: \`scale(\${cameraScale})\`
    }}>
      {/* Layer 1: Static Environment Matte */}
      <Img
        src={staticFile(${JSON.stringify(shot.backgroundPath)})}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          objectFit: 'cover',
          zIndex: 1
        }}
      />

      ${generateVectorTypographyComponent(shot.dialogueText, shot.characterId)}

      {/* Layer 3: Grounded Character Plane */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30
      }}>
        <OffthreadVideo
          src={staticFile(${JSON.stringify(shot.platePath)})}
          trimEndFrames={${trim}}
          style={{
            width: 1920,
            height: 1080,
            objectFit: 'contain',
            filter: 'url(#greenscreen-despill) drop-shadow(0 20px 24px rgba(0,0,0,0.65))'
          }}
        />
      </div>

      {/* Layer 4: Optical Mastering Lens Simulation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.45)',
        zIndex: 40
      }} />
    </div>
  );
};
  `.trim();
}
