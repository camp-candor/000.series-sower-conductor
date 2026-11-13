import clone from 'clone-deep'
import * as Act from './frame.action.js'
import { FrameModel } from './frame.model.js'
import * as Buzz from './frame.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: FrameModel = new FrameModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.INIT_FRAME:
            return Buzz.initFrame(clone(model), act.bale, state!)

        case Act.UPDATE_FRAME:
            return Buzz.updateFrame(clone(model), act.bale, state!)

        case Act.QUANTIZE_ACOUSTIC_CLOCK:
            return Buzz.quantizeAcousticClock(clone(model), act.bale, state!)

        case Act.PROBE_STEM_DURATION:
            return Buzz.probeStemDuration(clone(model), act.bale as any, state!)

        case Act.TILE_TIMELINE_FRAMES:
            return Buzz.tileTimelineFrames(
                clone(model),
                act.bale as any,
                state!,
            )

        case Act.CONFORM_FRAME_LATTICE:
            return Buzz.conformFrameLattice(
                clone(model),
                act.bale as any,
                state!,
            )

        default:
            return model
    }
}
