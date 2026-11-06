import Edgebridge, { HardwareLeaseReceipt } from './fce/edgebridge.interface.js'

export class EdgebridgeModel implements Edgebridge {
    idx: string = '36.edgebridge.unit'
    activeLease: HardwareLeaseReceipt | any = null
    targetEndpoint: string =
        process.env.EDGE_COORDINATOR_URL || 'http://127.0.0.1:8787'
    isHeartbeatActive: boolean = false
    activeTargetUrl: string =
        process.env.EDGE_COORDINATOR_URL || 'http://127.0.0.1:8787'
    connectionStatus: any = 'DISCONNECTED'
    currentEpoch: number = 0
    lastReceiptAck: string | null = null
    lastHeartbeatMs: number = 0
}

export { EdgebridgeModel as EdgeBridgeModel }
