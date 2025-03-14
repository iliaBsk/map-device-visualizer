
export type DeviceType = 'anchor' | 'sensor';

export interface Device {
  id: string;
  mac: string;
  type: DeviceType;
  x: number;
  y: number;
  lastSeen: string;
  colorIndex?: number; // For sensors to get a unique color
}

export interface HistoricalPosition {
  deviceId: string;
  timestamp: string;
  x: number;
  y: number;
}

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}
