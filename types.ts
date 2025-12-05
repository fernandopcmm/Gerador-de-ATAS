export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MinutesData {
  htmlContent: string;
  lastUpdated: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  READING_FILE = 'READING_FILE',
  GENERATING = 'GENERATING',
  REFINING = 'REFINING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface GenerationConfig {
  transcript: string;
  model: string;
}
