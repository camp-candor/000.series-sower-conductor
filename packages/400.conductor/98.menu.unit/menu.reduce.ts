import clone from 'clone-deep'
import * as Act from './menu.action.js'
import * as Buzz from './menu.buzzer.js'
import { MenuModel } from './menu.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new MenuModel(),
    act: Act.Actions,
    state: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_MENU:
            return Buzz.initMenu(cpy, act.bale, state)
        case Act.UPDATE_MENU:
            return Buzz.updateMenu(cpy, act.bale, state)
        default:
            return cpy
    }
}
