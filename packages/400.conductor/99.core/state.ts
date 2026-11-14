import Rx from 'rx-lite'
import { Action } from './interface/action.interface.js'

import UnitModel from '../BEE.js'
import * as Effect from '../BEE.js'

export default class State extends Rx.BehaviorSubject<any> {
    public hunt: any
    public value: any
    public pivot: any
    public bus: any

    private dispatcher: Rx.Subject<any> = new Rx.Subject()

    constructor(init: UnitModel = new UnitModel()) {
        super(init)

        this.dispatcher
            .scan((state, action) => this.reducedApp(state, action), init)
            .subscribe((state) => {
                super.onNext(state)
            })
    }

    reducedApp(nextState: any, key: any) {
        for (var k in Effect.reducer) {
            const updated = Effect.reducer[k](nextState[k], key, this)
            if (updated !== undefined) {
                if (
                    updated &&
                    typeof (updated as Promise<unknown>).then === 'function'
                ) {
                    ;(updated as Promise<unknown>)
                        .then((resolved) => {
                            if (resolved !== undefined) nextState[k] = resolved
                        })
                        .catch(() => {})
                } else {
                    nextState[k] = updated
                }
            }
        }
        return nextState
    }

    dispatch(value: Action) {
        var result = this.dispatcher.onNext(value)
        return result
    }

    pat(value: Action) {
        this.dispatch(value)
    }

    next(value: any) {
        this.dispatcher.onNext(value)
    }
}
