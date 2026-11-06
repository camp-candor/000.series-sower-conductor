import { describe, it, expect } from 'vitest'
import {
    calculateCanvasAnchorOrigin,
    synthesizeDeterministicJitterTrajectory,
    buildCameraKinematicsSpec,
    murmurHash3,
    createMulberry32,
} from '../35.remotion.unit/buz/kinematics.buzz.js'
import { generateShotComponentCode } from '../35.remotion.unit/buz/opticalStack.buzz.js'
import { ShotBakingInput } from '../35.remotion.unit/buz/literalBaking.buzz.js'

describe('packages/400.conductor 35.remotion.unit Affine Kinematics Coordinate Space Projector', () => {
    it('projects 1024x1024 sprite local anchor onto 1920x1080 canvas bounds accurately', () => {
        // Stage coordinates at center (960, 540), anchor at center (512, 512)
        const { originXPercent, originYPercent } = calculateCanvasAnchorOrigin(
            960,
            540,
            512,
            512,
            1.0,
        )
        expect(originXPercent).toBeCloseTo(75.0, 1)
        expect(originYPercent).toBeCloseTo(75.0, 1)

        // Assert lower and upper bounding clamps [0, 100]
        const clampedNegative = calculateCanvasAnchorOrigin(-5000, -5000, 0, 0)
        expect(clampedNegative.originXPercent).toBe(0.0)
        expect(clampedNegative.originYPercent).toBe(0.0)

        const clampedOverflow = calculateCanvasAnchorOrigin(
            10000,
            10000,
            1024,
            1024,
        )
        expect(clampedOverflow.originXPercent).toBe(100.0)
        expect(clampedOverflow.originYPercent).toBe(100.0)
    })

    it('generates deterministic Mulberry32 jitter trajectory that decays to zero', () => {
        const traj1 = synthesizeDeterministicJitterTrajectory(
            'ep01',
            'sh01',
            14,
            20.0,
        )
        const traj2 = synthesizeDeterministicJitterTrajectory(
            'ep01',
            'sh01',
            14,
            20.0,
        )
        const trajDifferent = synthesizeDeterministicJitterTrajectory(
            'ep01',
            'sh02',
            14,
            20.0,
        )

        // Deterministic match across identical seeds
        expect(traj1).toEqual(traj2)
        expect(traj1.length).toBe(14)

        // Initial frame has high displacement
        expect(
            Math.abs(traj1[0].deltaX) + Math.abs(traj1[0].deltaY),
        ).toBeGreaterThan(0)

        // Final frame decays to approximately zero
        const lastKeyframe = traj1[traj1.length - 1]
        expect(Math.abs(lastKeyframe.deltaX)).toBeLessThan(1.0)
        expect(Math.abs(lastKeyframe.deltaY)).toBeLessThan(1.0)

        // Different shot produces different trajectory
        expect(traj1).not.toEqual(trajDifferent)
    })

    it('builds CRASH_ZOOM camera specification with locked spring physics config', () => {
        const spec = buildCameraKinematicsSpec({
            sceneId: 'ep01_sc01',
            shotId: 'sh02',
            mode: 'CRASH_ZOOM',
        })

        expect(spec.mode).toBe('CRASH_ZOOM')
        expect(spec.startScale).toBe(1.0)
        expect(spec.targetScale).toBe(1.25)
        expect(spec.springConfig).toBeDefined()
        expect(spec.springConfig?.mass).toBe(0.5)
        expect(spec.springConfig?.stiffness).toBe(180)
        expect(spec.springConfig?.damping).toBe(12)
        expect(spec.springConfig?.overshootClamping).toBe(true)
    })

    it('stamps camera wrapper component with spring hook and unquoted parameters', () => {
        const mockShot: ShotBakingInput = {
            shotId: 'sh_zoom',
            characterId: 'char_torvin',
            dialogueText: 'Look out!',
            platePath: 'takes/torvin.mp4',
            backgroundPath: 'backgrounds/swamp.png',
            durationMs: 1000,
            deliveryFrames: 24,
            fromFrame: 0,
            diffusionAllocation: 25,
            trimEndFrames: 1,
            transformOriginX: 50.0,
            transformOriginY: 80.0,
            initialScale: 1.0,
            targetScale: 1.25,
        }

        const spec = buildCameraKinematicsSpec({
            sceneId: 'ep01_sc01',
            shotId: 'sh_zoom',
            mode: 'CRASH_ZOOM',
        })

        const code = generateShotComponentCode(mockShot, 0, spec)

        expect(code).toContain('const Shot01CameraWrapper: React.FC = () => {')
        expect(code).toContain('spring({')
        expect(code).toContain(
            'config: { mass: 0.5, damping: 12, stiffness: 180, overshootClamping: true }',
        )
        expect(code).toContain('from: 1')
        expect(code).toContain('to: 1.25')
        expect(code).toContain(
            'transform: `scale(${cameraScale}) translate(${shakeX}px, ${shakeY}px)`',
        )
    })
})
