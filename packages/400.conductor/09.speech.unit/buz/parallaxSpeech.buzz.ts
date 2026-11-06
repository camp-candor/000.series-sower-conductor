import { SceneAST } from '../../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'
import { SpeechGenerationRequest, DialogueSynthesisItem } from '../fce/speech.interface.js'
import { SpeechModel } from '../speech.model.js'
import SpeechBit from '../fce/speech.bit.js'
import State from '../../../995.library/995.library/99.core/state.js'
import { executeSceneSpeech } from './speech.buzz.js'
import * as fs from 'node:fs'
import * as path from 'node:path'

export const buildParallaxSpeechRequest = (ast: SceneAST, outputDir = 'outputs/ep01_sc01/stems'): SpeechGenerationRequest => {
    const items: DialogueSynthesisItem[] = ast.lines.map(line => ({
        line_id: line.line_id,
        speaker_id: line.speaker_id,
        dialogue_text: line.dialogue_clean_ascii,
        emotion_tag: line.emotional_tag,
        dsp_modifiers: {
            effective_pitch_semitones: line.somatic_dsp.pitch_shift_cents / 100,
            effective_formant_warping: 1.0,
            effective_breathiness_multiplier: 1.0,
            pause_frequency_multiplier: 1.0,
            effective_vocal_fry_density: 0.0,
            target_lufs: -16.0,
            peak_dbtp: -1.0,
            banned_cadences: []
        },
        output_filename: `${ast.scene_id}_${line.line_id}.wav`
    }))

    return {
        series_id: 'parallax_dinner',
        scene_id: ast.scene_id,
        engine: 'styletts2',
        items,
        output_directory: outputDir
    }
}

export const executeParallaxSceneSpeech = async (cpy: SpeechModel, bal: SpeechBit, ste: State) => {
    let ast: SceneAST
    if ((bal.dat as any)?.ast) {
        ast = (bal.dat as any).ast as SceneAST
    } else {
        const draftsPath = path.resolve('drafts/dialogue_ast.json')
        if (fs.existsSync(draftsPath)) {
            ast = JSON.parse(fs.readFileSync(draftsPath, 'utf8')) as SceneAST
        } else {
            throw new Error('SceneAST not provided in bal.dat.ast and drafts/dialogue_ast.json not found')
        }
    }

    const request = buildParallaxSpeechRequest(ast)

    // Inject the request for executeSceneSpeech
    bal.dat = bal.dat || {}
    bal.dat.request = request

    return await executeSceneSpeech(cpy, bal, ste)
}
