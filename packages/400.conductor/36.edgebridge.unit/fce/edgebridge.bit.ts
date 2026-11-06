import {
    HardwareLeaseReceipt,
    TelemetryIngressPayload,
} from './edgebridge.interface.js'

export default interface EdgebridgeBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        receipt?: HardwareLeaseReceipt
        telemetry?: TelemetryIngressPayload
        endpoint?: string
        [key: string]: any
    }
    slv?: Function
}

export type EdgeBridgeBit = EdgebridgeBit
