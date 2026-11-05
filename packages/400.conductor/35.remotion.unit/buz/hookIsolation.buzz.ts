import { SceneShotPlan } from '../fce/remotion.interface.js'

export function generateShotCameraWrapper(
    shotIndex: number,
    plan: SceneShotPlan,
): string {
    const padIndex = String(shotIndex).padStart(2, '0')
    const componentName = `Shot${padIndex}CameraWrapper`

    const scaleStart = plan.cameraZoom?.scaleStart ?? 1.0
    const scaleEnd = plan.cameraZoom?.scaleEnd ?? 1.05
    const targetX = plan.cameraZoom?.x ?? 960
    const targetY = plan.cameraZoom?.y ?? 540

    return `
const ${componentName}: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, ${plan.durationFrames}], [${scaleStart.toFixed(2)}, ${scaleEnd.toFixed(2)}], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transformOrigin: '${targetX}px ${targetY}px',
        transform: \`scale(\${scale})\`,
      }}
    >
      {children}
    </div>
  );
};
`.trim()
}
