import { Model } from '../../99.core/interface/model.interface.js';

export default interface Menu extends Model {
  idx: string;
  activeSelection: string;
  lastActionTimestamp: number;
  statusMessage: string;
  lastRemotionReceipt: string | null;
  lastEdgeReceipt: string | null;
}
