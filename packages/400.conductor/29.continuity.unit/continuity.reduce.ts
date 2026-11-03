import clone from 'clone-deep';
import * as Act from './continuity.action.js';
import { ContinuityModel } from './continuity.model.js';
import * as Buzz from './continuity.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
    model: ContinuityModel = new ContinuityModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CONTINUITY:
            return Buzz.updateContinuity(clone(model), act.bale, state);

        case Act.INIT_CONTINUITY:
            return Buzz.initContinuity(clone(model), act.bale, state);

        case Act.EVALUATE_CONTINUITY_GATE:
            return Buzz.evaluateContinuityGate(clone(model), act.bale, state);

        default:
            return model;
    }
}
