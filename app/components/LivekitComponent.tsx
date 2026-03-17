'use client';

import { useEffect, useState, useRef } from 'react';
import { useLiveKit } from '../hooks/useLiveKit';
import { useTranscript, TranscriptMessage } from '../hooks/useTranscript';
import TranscriptPanel from './TranscriptPanel';

interface LiveKitComponentProps {
  isActive: boolean;
  selectedProduct: string;
  onError: (error: string) => void;
  onTranscriptUpdate?: (transcript: TranscriptMessage[]) => void;
}

export default function LiveKitComponent({ isActive, selectedProduct, onError, onTranscriptUpdate }: LiveKitComponentProps) {
  const { room, connectionStatus, connectToRoom, disconnectRoom, toggleMicrophone, sendData } = useLiveKit();
  const { transcript, clearTranscript } = useTranscript({ room });
  const [isMicMuted, setIsMicMuted] = useState(false);
  const isConnectedRef = useRef(false);
  const prevProductRef = useRef(selectedProduct);

  // Forward transcript to parent
  useEffect(() => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript);
    }
  }, [transcript, onTranscriptUpdate]);

  useEffect(() => {
    if (isActive) {
      initializeConnection();
    } else {
      isConnectedRef.current = false;
      disconnectRoom();
      clearTranscript();
    }
  }, [isActive]);

  // When product changes AFTER initial connection, send data message — no reconnect
  useEffect(() => {
    if (prevProductRef.current !== selectedProduct && isConnectedRef.current) {
      sendData({ type: 'product_selected', product: selectedProduct });
      console.log('Sent product_selected:', selectedProduct);
    }
    prevProductRef.current = selectedProduct;
  }, [selectedProduct, sendData]);

  const initializeConnection = async () => {
    try {
      const response = await fetch(`/api/get-token?product=${encodeURIComponent(selectedProduct)}`);
      if (!response.ok) throw new Error('Failed to get access token');
      const data = await response.json();
      if (!data.token) throw new Error('No token received');

      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) throw new Error('LiveKit URL not configured');

      await connectToRoom({ url: livekitUrl, token: data.token });
      isConnectedRef.current = true;
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
          >
            {isMicMuted ? '🎤' : '🎙️'}
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
}

