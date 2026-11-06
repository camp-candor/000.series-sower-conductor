export interface GridCoordinates {
  x: number;
  y: number;
  xSpan: number;
  ySpan: number;
}

export interface MenuChoiceItem {
  id: string;
  label: string;
  tooltip: string;
  actionType: string;
}

export interface CockpitTelemetryPacket {
  timestamp: string;
  subsystem: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}

export default interface Menu {
  idx: string;
  activeSelection: string;
  lastActionTimestamp: number;
  statusMessage: string;
  gridLeft: GridCoordinates;
  gridRight: GridCoordinates;
  menuChoices: MenuChoiceItem[];
}
