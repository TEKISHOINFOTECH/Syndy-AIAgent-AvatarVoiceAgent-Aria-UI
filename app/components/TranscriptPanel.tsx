'use client';

import { useEffect, useRef } from 'react';
import { TranscriptMessage } from '../hooks/useTranscript';

interface TranscriptPanelProps {
  transcript: TranscriptMessage[];
  onClear: () => void;
}

export default function TranscriptPanel({ transcript, onClear }: TranscriptPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [transcript]);

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="transcript-side">
      <div className="transcript-side-header">
        <div className="transcript-side-title">
          <div className="transcript-title-bar" />
          Conversation Transcript
        </div>
        <button
          className="transcript-clear-btn"
          onClick={onClear}
          title="Clear transcript"
        >
          🗑
        </button>
      </div>

      <div className="transcript-messages" ref={contentRef}>
        {transcript.length === 0 ? (
          <div className="t-empty-state">
            <div className="t-empty-icon">💬</div>
            <p>Conversation will appear here...</p>
          </div>
        ) : (
          transcript.map((message, index) => (
            <div key={index} className={`t-msg ${message.type === 'avatar' ? 'aria' : message.type}`}>
              <div className="t-msg-meta">
                <span className={`t-msg-sender ${message.type === 'avatar' ? 'aria' : message.type}`}>
                  {message.sender}
                </span>
                <span className="t-msg-time">{formatTimestamp(message.timestamp)}</span>
              </div>
              <div className="t-msg-bubble">{message.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
