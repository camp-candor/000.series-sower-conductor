import clone from 'clone-deep'
import * as Act from './receipt.action.js'
import { ReceiptModel } from './receipt.model.js'
import * as Buzz from './receipt.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: ReceiptModel = new ReceiptModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_RECEIPT:
            return Buzz.updateReceipt(clone(model), act.bale, state)

        case Act.INIT_RECEIPT:
            return Buzz.initReceipt(clone(model), act.bale, state)

        default:
            return model
    }
}
