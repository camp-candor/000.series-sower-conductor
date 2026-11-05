export type ClientRole = 'artist' | 'broker' | 'operator';

export interface SocketAttachment {
  clientId: string;
  role: ClientRole;
  connectedAtMs: number;
}

export interface SensoryPacket {
  type: string;
  source: string;
  timestampMs: number;
  payload: any;
  ascii?: string;
}

export interface TelemetryEnvelope extends SensoryPacket {
  seq: number;
}

export interface HistoricalReplayEnvelope {
  type: 'TELEMETRY_HISTORY';
  seq: number;
  payload: {
    items: TelemetryEnvelope[];
  };
}

export const MAX_RING_BUFFER_SIZE = 50;
export const WATCHDOG_TIMEOUT_MS = 30000;
export const MAX_JOB_ATTEMPTS = 3;
