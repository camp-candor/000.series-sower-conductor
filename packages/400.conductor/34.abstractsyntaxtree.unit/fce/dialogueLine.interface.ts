export type SwainMRUBeatType =
  | 'MOTIVATION_STIMULUS'
  | 'SOMATIC_REACTION'
  | 'INTERNAL_PROCESSING'
  | 'MOTOR_ACTION_DIALOGUE'
  | 'VISCERAL_STING';

export interface CameraIntent {
  framing: 'EXTREME_CLOSE_UP' | 'CLOSE_UP' | 'MEDIUM' | 'WIDE';
  motion: 'STATIC' | 'SLOW_PUSH' | 'WHIP_PAN' | 'DUTCH_TILT';
  focus_target: string;
}

export interface DialogueLine {
  line_id: string;
  speaker_id: string;
  dialogue_text: string;
  camera_parenthetical: string;
  observable_parenthetical: string;
  emotion_tag: string;
  swain_mru_phase: SwainMRUBeatType;
  tonePacing: number;
  extracted_motor_actions: string[];
  foley_cues: string[];
  camera_intent?: CameraIntent;
  pacing_scalar?: number;
}
