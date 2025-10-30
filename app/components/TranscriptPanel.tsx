'use client';

import { useEffect, useRef } from 'react';
import { TranscriptMessage } from '../hooks/useTranscript';

interface TranscriptPanelProps {
  transcript: TranscriptMessage[];
  isVisible: boolean;
  onClear: () => void;
}

export default function TranscriptPanel({ transcript, isVisible, onClear }: TranscriptPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [transcript]);

  if (!isVisible) return null;

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="transcript-section" id="transcriptSection">
      <div className="transcript-header">
        <h3>Conversation Transcript</h3>
        <button 
          className="clear-transcript" 
          id="clearTranscript"
          onClick={onClear} 
          title="Clear Transcript"
        >
          🗑️
        </button>
      </div>
      <div className="transcript-content" id="transcriptContent" ref={contentRef}>
        {transcript.length === 0 ? (
          <div className="empty-transcript">
            <p>No messages yet. Start speaking...</p>
          </div>
        ) : (
          transcript.map((message, index) => (
            <div key={index} className={`transcript-message ${message.type}`}>
              <div className="message-meta">
                <span className="speaker">{message.sender}</span>
                <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
              </div>
              <div className="message-text">{message.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}