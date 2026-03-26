'use client';

import { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useLiveKit } from '../hooks/useLiveKit';
import { useTranscript, TranscriptMessage } from '../hooks/useTranscript';
import TranscriptPanel from './TranscriptPanel';

interface LiveKitComponentProps {
  isActive: boolean;
  onError: (error: string) => void;
  onTranscriptUpdate?: (transcript: TranscriptMessage[]) => void;
  onSendDataReady?: (sendDataFn: (payload: object) => Promise<void>) => void;
  onARIASpeakingChanged?: (isSpeaking: boolean) => void;
}

export interface LiveKitComponentHandle {
  activateConversation: () => void;
  muteARIA: () => void;
}

const LiveKitComponent = forwardRef<LiveKitComponentHandle, LiveKitComponentProps>(
  ({ isActive, onError, onTranscriptUpdate, onSendDataReady, onARIASpeakingChanged }, ref) => {
  const { room, connectionStatus, connectToRoom, disconnectRoom, toggleMicrophone, enableMicrophone, sendData, isRemoteSpeaking } = useLiveKit();
  const { transcript, clearTranscript } = useTranscript({ room });
  const [isMicMuted, setIsMicMuted] = useState(false);
  const isConnectedRef = useRef(false);

  // Forward transcript to parent
  useEffect(() => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript);
    }
  }, [transcript, onTranscriptUpdate]);

  // Expose sendData to parent once connected
  useEffect(() => {
    if (onSendDataReady && isConnectedRef.current) {
      onSendDataReady(sendData);
    }
  }, [onSendDataReady, sendData]);

  // Notify parent when ARIA speaking state changes
  useEffect(() => {
    onARIASpeakingChanged?.(isRemoteSpeaking);
  }, [isRemoteSpeaking, onARIASpeakingChanged]);

  useEffect(() => {
    if (isActive) {
      initializeConnection();
    } else {
      isConnectedRef.current = false;
      disconnectRoom();
      clearTranscript();
    }
  }, [isActive]);

  const initializeConnection = async () => {
    try {
      const response = await fetch(`/api/get-token`);
      if (!response.ok) throw new Error('Failed to get access token');
      const data = await response.json();
      if (!data.token) throw new Error('No token received');

      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) throw new Error('LiveKit URL not configured');

      await connectToRoom({ url: livekitUrl, token: data.token });
      isConnectedRef.current = true;
      if (onSendDataReady) onSendDataReady(sendData);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Connection failed';
      console.error('Connection error:', msg);
      onError(msg);
    }
  };

  const handleMicToggle = async () => {
    const newState = await toggleMicrophone();
    setIsMicMuted(!newState);
  };

  const muteARIA = useCallback(() => {
    const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
    if (audioElement) {
      audioElement.muted = true;
    }
  }, []);

  const activateConversation = useCallback(() => {
    const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
    if (audioElement) {
      audioElement.muted = false;
    }
    enableMicrophone();
  }, [enableMicrophone]);

  useImperativeHandle(ref, () => ({
    activateConversation,
    muteARIA,
  }));

  const isConnecting = connectionStatus.status === 'connecting';
  const isConnected = connectionStatus.status === 'connected';

  return (
    <>
      {/* Left: Avatar Video Area */}
      <div className="avatar-panel">
        <video id="remoteVideo" autoPlay playsInline />
        <audio id="remoteAudio" autoPlay />

        {/* Loading / placeholder while connecting */}
        {isConnecting && (
          <div className="avatar-loading">
            <div className="aria-ring">
              <div className="aria-ring-inner">🤖</div>
            </div>
            <div className="avatar-loading-text">Connecting to ARIA...</div>
            <div className="avatar-loading-sub">Please wait a moment</div>
          </div>
        )}

        {/* Mic control bottom-right */}
        <div className="mic-overlay">
          <button
            className={`mic-btn ${isMicMuted ? 'muted' : ''}`}
            onClick={handleMicToggle}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            style={{
              background: isMicMuted ? 'rgba(239,68,68,0.85)' : 'rgba(16,185,129,0.85)',
              border: isMicMuted ? '2px solid #ef4444' : '2px solid #10b981',
              boxShadow: isMicMuted ? '0 0 10px rgba(239,68,68,0.5)' : '0 0 10px rgba(16,185,129,0.5)',
              transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
            }}
          >
            {isMicMuted ? (
              // Red mic with slash — clearly muted
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              // Green mic — active
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
        </div>

        {/* Connection status chip bottom-left */}
        {isConnected && (
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
            Live
          </div>
        )}
      </div>

      {/* Right: Transcript Panel */}
      <TranscriptPanel
        transcript={transcript}
        onClear={clearTranscript}
      />
    </>
  );
});

export default LiveKitComponent;

