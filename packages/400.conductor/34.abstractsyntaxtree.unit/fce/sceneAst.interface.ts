import { DialogueLine } from './dialogueLine.interface.js';

export interface SceneAST {
  schema_version: string;
  series_id: string;
  episode_id: string;
  scene_id: string;
  state_snapshot_hash: string;
  lines: DialogueLine[];
  pinned_version: number;
}

export interface AstValidationReceipt {
  ok: boolean;
  scene_id: string;
  line_count: number;
  speakers: string[];
  state_snapshot_hash: string;
  errors: string[];
}
