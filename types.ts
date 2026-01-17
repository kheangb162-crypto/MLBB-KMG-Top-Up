
export enum AppView {
  CHAT = 'chat',
  IMAGE = 'image',
  VIDEO = 'video',
  SPEECH = 'speech',
  LIVE = 'live'
}

export interface Message {
  role: 'user' | 'model' | 'system' | 'thinking';
  content: string;
  timestamp: number;
}

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  timestamp: number;
}
