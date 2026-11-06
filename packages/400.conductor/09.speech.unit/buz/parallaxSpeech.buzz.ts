import { SceneAST } from '../../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'
import { DialogueSynthesisItem, SpeechGenerationRequest } from '../fce/speech.interface.js'
import { SpeechModel } from '../speech.model.js'
import SpeechBit from '../fce/speech.bit.js'
import State from '../../99.core/state.js'
import * as fs from 'node:fs'
import { executeSceneSpeech } from './speech.buzz.js'

export const buildParallaxSpeechRequest = (
    ast: SceneAST,
    outputDir = 'outputs/ep01_sc01/stems'
): SpeechGenerationRequest => {
    const items: DialogueSynthesisItem[] = ast.lines.map((line) => {
        return {
            line_id: line.line_id,
            speaker_id: line.speaker_id,
            dialogue_text: line.dialogue_clean_ascii,
            emotion_tag: line.emotional_tag,
            dsp_modifiers: {
                effective_pitch_semitones: (line.somatic_dsp.pitch_shift_cents || 0) / 100,
                effective_formant_warping: 1.0,
                effective_breathiness_multiplier: line.somatic_dsp.breathiness_bps ? line.somatic_dsp.breathiness_bps / 10000 : 0.0,
                pause_frequency_multiplier: 1.0,
                effective_vocal_fry_density: line.somatic_dsp.gain_attenuation_bps ? line.somatic_dsp.gain_attenuation_bps / 10000 : 0.0,
                target_lufs: -16.0,
                peak_dbtp: -1.0,
                banned_cadences: []
            },
        }
    })

    return {
        series_id: 'parallax',
        scene_id: ast.scene_id,
        engine: 'styletts2',
        items,
        output_directory: outputDir
    }
}

export const executeParallaxSceneSpeech = async (
    cpy: SpeechModel,
    bal: SpeechBit,
    ste: State
) => {
    try {
        let ast: SceneAST
        if ((bal.dat as any)?.ast) {
            ast = (bal.dat as any).ast as SceneAST
        } else {
            const raw = fs.readFileSync('drafts/dialogue_ast.json', 'utf-8')
            ast = JSON.parse(raw) as SceneAST
        }

        const request = buildParallaxSpeechRequest(ast)

        const executeBal = {
            ...bal,
            dat: { ...bal.dat, request }
        } as SpeechBit

        return await executeSceneSpeech(cpy, executeBal, ste)
    } catch (e) {
        console.error(e)
        return cpy
    }
}
