import { Room, Track, Participant } from 'livekit-client';

export interface TranscriptMessage {
  speaker: string;
  text: string;
  timestamp: string;
  type: 'user' | 'agent' | 'system';
}

export interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  message?: string;
}

export interface LiveKitConfig {
  url: string;
  token: string;
  roomName?: string;
}

export interface ChatState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
}
