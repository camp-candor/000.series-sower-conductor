import clone from 'clone-deep'
import * as Act from './telemetry.action'
import { TelemetryModel } from './telemetry.model'
import * as Buzz from './telemetry.buzzer'
import State from '../99.core/state'

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
