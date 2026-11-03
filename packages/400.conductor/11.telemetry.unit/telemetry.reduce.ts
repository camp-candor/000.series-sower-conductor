import clone from 'clone-deep'
import * as Act from './telemetry.action.js'
import { TelemetryModel } from './telemetry.model.js'
import * as Buzz from './telemetry.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: TelemetryModel = new TelemetryModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_TELEMETRY:
            return Buzz.updateTelemetry(clone(model), act.bale, state)

        case Act.INIT_TELEMETRY:
            return Buzz.initTelemetry(clone(model), act.bale, state)

        default:
            return model
    }
}
