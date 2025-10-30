'use client';

import { ConnectionStatus } from '@/types';

interface VideoPlayerProps {
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
}

export default function VideoPlayer({ connectionStatus, isLoading }: VideoPlayerProps) {
  return (
    <div className="video-container">
      <video id="remoteVideo" autoPlay playsInline />
      <audio id="remoteAudio" autoPlay />

      {isLoading && (
        <div className="loading-overlay" id="loadingOverlay">
          <div className="spinner" />
          <div className="loading-text">Connecting to Aria...</div>
          <div className="loading-subtext">Please wait a moment</div>
        </div>
      )}

      <div className="connection-status" id="connectionStatus">
        <span className={`status-indicator ${connectionStatus.status}`} />
        <span id="statusText">{connectionStatus.message || connectionStatus.status}</span>
      </div>
    </div>
  );
}
