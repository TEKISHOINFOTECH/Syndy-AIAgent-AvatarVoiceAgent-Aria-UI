'use client';

import { useState, useCallback, useEffect } from 'react';
import { Room } from 'livekit-client';

export interface TranscriptMessage {
  type: 'system' | 'avatar' | 'user';
  sender: string;
  message: string;
  timestamp: Date;
}

interface UseTranscriptProps {
  room: Room | null;
}

export function useTranscript({ room }: UseTranscriptProps) {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const addMessage = useCallback(
    (type: TranscriptMessage['type'], sender: string, message: string) => {
      const newMessage: TranscriptMessage = {
        type,
        sender,
        message,
        timestamp: new Date(),
      };
      setTranscript((prev) => [...prev, newMessage]);
    },
    []
  );

  const addSystemMessage = useCallback(
    (message: string) => {
      addMessage('system', 'System', message);
    },
    [addMessage]
  );

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
    addSystemMessage('Transcript cleared');
  }, [addSystemMessage]);

  // Listen to LiveKit room events for transcripts
  useEffect(() => {
    if (!room) return;

    const handleConnected = () => {
      addSystemMessage('Conversation started. Waiting for Aria to connect...');
    };

    const handleParticipantConnected = (participant: any) => {
      const identity = participant.identity || 'Unknown';

      if (identity.includes('agent') || identity.includes('tavus') || identity.toLowerCase().includes('aria')) {
        addSystemMessage(`${identity} has joined the conversation`);
      }
    };

    const handleParticipantDisconnected = (participant: any) => {
      const identity = participant.identity || 'Unknown';
      if (!identity.includes('user-')) {
        addSystemMessage(`${identity} has left the conversation`);
      }
    };

    // Handle LiveKit transcriptions (built-in transcription feature)
    const handleTranscriptionReceived = (segments: any[], participant: any) => {
      try {
        // Process final transcription segments only
        const finalSegments = segments.filter(seg => seg.final);
        if (finalSegments.length === 0) return;

        const fullText = finalSegments.map(seg => seg.text).join(' ').trim();
        if (!fullText) return;

        const participantIdentity = participant?.identity || 'Unknown';
        
        // Determine message type based on participant identity
        if (participantIdentity.includes('agent') || 
            participantIdentity.includes('tavus') || 
            participantIdentity.toLowerCase().includes('aria')) {
          addMessage('avatar', 'Aria', fullText);
        } else if (participantIdentity.includes('user-')) {
          addMessage('user', 'You', fullText);
        } else {
          addMessage('user', participantIdentity, fullText);
        }
      } catch (error) {
        console.error('Error processing transcription:', error);
      }
    };

    // MAIN TRANSCRIPT HANDLER - Receives transcripts from backend via Data Channel      
    const handleDataReceived = (payload: Uint8Array, participant?: any) => {
      try {
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);
        const data = JSON.parse(text);

        // Agent transcript from backend
        if (data.type === 'transcript' && data.speaker && data.message) {
          addMessage('avatar', data.speaker, data.message);
        }

        // User transcript from backend
        else if (data.type === 'user_transcript' && data.message) {
          addMessage('user', data.speaker || 'You', data.message);
        }
      } catch (error) {
        // Not JSON data, ignore
        console.debug('Non-transcript data received');
      }
    };

    // Register event listeners
    room.on('connected', handleConnected);
    room.on('participantConnected', handleParticipantConnected);
    room.on('participantDisconnected', handleParticipantDisconnected);
    room.on('dataReceived', handleDataReceived);
    
    // Listen for LiveKit transcriptions if available
    if (room.on && typeof room.on === 'function') {
      try {
        room.on('transcriptionReceived', handleTranscriptionReceived);
      } catch (e) {
        console.warn('transcriptionReceived event not available:', e);
      }
    }

    // Initial message if already connected
    if (room.state === 'connected') {
      addSystemMessage('Conversation started. Waiting for Aria to connect...');
    }

    // Cleanup
    return () => {
      room.off('connected', handleConnected);
      room.off('participantConnected', handleParticipantConnected);
      room.off('participantDisconnected', handleParticipantDisconnected);
      room.off('dataReceived', handleDataReceived);
      try {
        room.off('transcriptionReceived', handleTranscriptionReceived);
      } catch (e) {
        // Ignore if event doesn't exist
      }
    };
  }, [room, addMessage, addSystemMessage]);

  return {
    transcript,
    isVisible,
    toggleVisibility,
    clearTranscript,
  };
}