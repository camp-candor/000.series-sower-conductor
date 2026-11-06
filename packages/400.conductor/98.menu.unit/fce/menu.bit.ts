import { MenuChoiceItem, CockpitTelemetryPacket } from './menu.interface.js'

export default interface MenuBit {
    idx: string
    src?: string
    val?: number
    lst?: string[]
    dat?: {
        choice?: MenuChoiceItem
        telemetry?: CockpitTelemetryPacket
        remotePivotResponse?: any
    }
    slv?: Function
}
