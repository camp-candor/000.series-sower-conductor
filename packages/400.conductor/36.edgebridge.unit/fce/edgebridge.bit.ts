import {
    AcquireLeasePayload,
    HardwareLeaseReceipt,
} from './edgebridge.interface.js'

export default interface EdgeBridgeBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        jobId?: string
        sceneId?: string
        lockfilePath?: string
        activeTargetUrl?: string
        leasePayload?: AcquireLeasePayload
        leaseReceipt?: HardwareLeaseReceipt
        [key: string]: any
    }
    slv?: Function
}
