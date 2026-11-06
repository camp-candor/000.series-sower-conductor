import fs from 'node:fs'
import path from 'node:path'
import {
    SceneAST,
    SceneASTSchema,
} from '../fce/abstractsyntaxtree.interface.js'
import {
    parseFountainDialogue,
    normalizePunctuation,
} from './fountainTokenizer.buzz.js'
import { assertVerbatimParity } from './assertParity.buzz.js'

export const PARALLAX_DINNER_FOUNTAIN_SOURCE = `INT. WIREGRASS BASIN - NIGHT

JOHNNY
(into radio)
Miss Beverly, do you copy?

ORBIE
(CONT'D)
I copy, Walkman.

JOHNNY
We have a situation.

ORBIE
(CONT'D)
Specify the situation.

JOHNNY
(CONT'D)
The dinner is burnt.

ORBIE
(CONT'D)
Then we eat it burnt.

JOHNNY
Are you sure?

ORBIE
(CONT'D)
Yes.

JOHNNY
(CONT'D)
Understood.

ORBIE
(CONT'D)
Good.

JOHNNY
Over and out.

ORBIE
Out.

JOHNNY
(to himself)
Crazy.

ORBIE
I heard that.

JOHNNY
Sorry.

ORBIE
It's fine.

JOHNNY
Okay.

ORBIE
Okay.

JOHNNY
Right.

ORBIE
Right.

JOHNNY
Yeah.

ORBIE
Yeah.

JOHNNY
Sure.

ORBIE
Sure.

JOHNNY
Fine.

ORBIE
Fine.

JOHNNY
Done.

ORBIE
Done.

JOHNNY
One.

ORBIE
Two.

JOHNNY
Three.

ORBIE
Four.

JOHNNY
Five.

ORBIE
Six.
`

export function compileParallaxSceneAst(
    fountainText: string,
    sceneId = 'ep01_sc01',
): SceneAST {
    const extracted = parseFountainDialogue(fountainText)

    const lines = extracted.map((turn, i) => {
        const speakerId =
            turn.speaker === 'JOHNNY'
                ? 'char_johnny_walkman'
                : 'char_orbie_mayhaw'

        const clean = normalizePunctuation(turn.dialogueText)

        return {
            line_id: `line_${String(i + 1).padStart(3, '0')}`,
            speaker_id: speakerId,
            dialogue_clean_ascii: clean,
            emotional_tag: 'NEUTRAL' as const,
            somatic_dsp: {
                gain_attenuation_bps: 0,
                pitch_shift_cents: 0,
                breathiness_bps: 0,
                ducking_depth_db: -14,
            },
            mru_directive: {
                mru_phase: 'RATIONAL_ACTION' as const,
                stimulus_id: 'stim_default',
                intensity_bps: 1000,
            },
        }
    })

    const ast: SceneAST = {
        scene_id: sceneId,
        episode_number: 1,
        sequence_index: 0,
        state_snapshot_hash:
            '1111111111111111111111111111111111111111111111111111111111111111',
        pinned_fact_version: 1,
        environment_id: 'env_diner',
        camera_framing: {
            shot_type: 'MEDIUM_SHOT',
            focal_entity_id: 'char_johnny_walkman',
            secondary_entity_id: 'char_orbie_mayhaw',
        },
        lines,
    }

    SceneASTSchema.parse(ast)
    assertVerbatimParity(
        fountainText,
        lines.map((l) => l.dialogue_clean_ascii),
    )

    const draftsPath = path.resolve(process.cwd(), 'drafts')
    if (!fs.existsSync(draftsPath))
        fs.mkdirSync(draftsPath, { recursive: true })
    fs.writeFileSync(
        path.join(draftsPath, 'dialogue_ast.json'),
        JSON.stringify(ast, null, 4),
    )

    const outputsPath = path.resolve(process.cwd(), 'outputs/ep01_sc01')
    if (!fs.existsSync(outputsPath))
        fs.mkdirSync(outputsPath, { recursive: true })
    fs.writeFileSync(
        path.join(outputsPath, 'dialogue_ast.json'),
        JSON.stringify(ast, null, 4),
    )

    return ast
}
