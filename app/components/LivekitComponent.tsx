'use client';

import { useEffect, useState } from 'react';
import { useLiveKit } from '../hooks/useLiveKit';
import { useTranscript, TranscriptMessage } from '../hooks/useTranscript';
import VideoPlayer from './VideoPlayer';
import TranscriptPanel from './TranscriptPanel';

interface LiveKitComponentProps {
  isActive: boolean;
  onError: (error: string) => void;
  onTranscriptUpdate?: (transcript: TranscriptMessage[]) => void;
}

export default function LiveKitComponent({ isActive, onError, onTranscriptUpdate }: LiveKitComponentProps) {
  const { room, connectionStatus, connectToRoom, disconnectRoom, toggleMicrophone } = useLiveKit();
  const { transcript, isVisible, toggleVisibility, clearTranscript } = useTranscript({ room });
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Update parent component with transcript changes
  useEffect(() => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript);
    }
  }, [transcript, onTranscriptUpdate]);

  useEffect(() => {
    if (isActive) {
      initializeConnection();
    } else {
      disconnectRoom();
      clearTranscript();
    }
  }, [isActive]);

  const initializeConnection = async () => {
    try {
      // Fetch token from API
      const response = await fetch('/api/get-token');
      
      if (!response.ok) {
        throw new Error('Failed to get access token');
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token received');
      }

      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) {
        throw new Error('LiveKit URL not configured');
      }

      await connectToRoom({
        url: livekitUrl,
        token: data.token,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      console.error('Connection error:', errorMessage);
      onError(errorMessage);
    }
  };

  const handleMicToggle = async () => {
    const newState = await toggleMicrophone();
    setIsMicMuted(!newState);
  };

  return (
    <>
      <div className="video-section">
        <VideoPlayer 
          connectionStatus={connectionStatus}
          isLoading={connectionStatus.status === 'connecting'}
        />
        <div className="controls">
          <button 
            className={`control-button mic ${isMicMuted ? 'muted' : ''}`}
            id="micButton"
            onClick={handleMicToggle}
            title="Toggle Microphone"
          >
            {isMicMuted ? '🎤❌' : '🎤'}
          </button>
          <button 
            className="control-button transcript-toggle" 
            id="transcriptToggle"
            onClick={toggleVisibility}
            title="Toggle Transcript"
          >
            📝
          </button>
        </div>
      </div>

      <TranscriptPanel
        transcript={transcript}
        isVisible={isVisible}
        onClear={clearTranscript}
      />
    </>
  );
}
