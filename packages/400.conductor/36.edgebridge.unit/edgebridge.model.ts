import EdgeBridge, {
  EdgeConnectionStatus,
  HardwareLeaseToken,
} from './fce/edgebridge.interface.js';

export class EdgeBridgeModel implements EdgeBridge {
  idx: string = '36.edgebridge.unit';
  activeTargetUrl: string = 'http://127.0.0.1:8787';
  connectionStatus: EdgeConnectionStatus = 'DISCONNECTED';
  currentEpoch: number = 0;
  activeLease: HardwareLeaseToken | null = null;
  lastReceiptAck: string | null = null;
  lastHeartbeatMs: number = 0;
}
