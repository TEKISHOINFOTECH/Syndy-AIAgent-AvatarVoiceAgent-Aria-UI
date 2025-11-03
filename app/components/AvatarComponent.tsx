'use client';

import { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import LiveKitComponent from './LivekitComponent';
import { TranscriptMessage } from '../hooks/useTranscript';

export default function AvatarComponent() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartChat = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setTranscript([]); // Clear previous transcript
    setIsChatActive(true);
  };

  const handleEndChat = async () => {
    // Save transcript to database before ending chat
    if (transcript.length > 0) {
      try {
        setIsSaving(true);
        console.log('💾 Starting to save transcript...');
        
        // Format transcript for saving (only user and avatar messages)
        const formattedTranscript = transcript
          .filter(msg => msg.type !== 'system')
          .map(msg => ({
            timestamp: msg.timestamp.toISOString(),
            speaker: msg.sender,
            message: msg.message,
            type: msg.type,
          }));

        if (formattedTranscript.length === 0) {
          console.log('⚠️ No messages to save (only system messages)');
          setIsChatActive(false);
          setTranscript([]);
          setIsLoading(false);
          setIsSaving(false);
          return;
        }

        console.log(`📊 Saving ${formattedTranscript.length} messages...`);

        // Call API to save transcript with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch('/api/save-transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript: formattedTranscript }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (result.success) {
          console.log('✅ Transcript saved successfully');
          console.log(`💾 Saved for: ${result.name} from ${result.company}`);
          console.log(`📊 Messages saved: ${result.message_count}`);
        } else {
          console.error('❌ Failed to save transcript:', result.error);
          setErrorMessage(`Failed to save conversation: ${result.error}`);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('❌ Save timeout: Taking too long');
          setErrorMessage('Save is taking longer than expected. It may still complete in the background.');
        } else {
          console.error('❌ Error saving transcript:', error);
          setErrorMessage('Failed to save conversation. Please check the console for details.');
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      console.log('ℹ️ No transcript to save');
    }

    setIsChatActive(false);
    setTranscript([]);
    setIsLoading(false);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setIsChatActive(false);
    setIsLoading(false);
  };

  const handleTranscriptUpdate = (newTranscript: TranscriptMessage[]) => {
    setTranscript(newTranscript);
  };

  return (
    <div className="container">
      {!isChatActive ? (
        <WelcomeScreen 
          onStartChat={handleStartChat} 
          errorMessage={errorMessage}
          isLoading={isLoading}
        />
      ) : (
        <div className="chat-interface active" id="chatInterface">
          <div className="chat-header">
            <h2>
              <span className="status-indicator" />
              Aria - AI Assistant
            </h2>
            <button 
              className="end-button" 
              id="endChatBtn" 
              onClick={handleEndChat}
              disabled={isSaving}
            >
              {isSaving ? '💾 Saving...' : 'End Chat'}
            </button>
          </div>

          <div className="main-content">
            <LiveKitComponent 
              isActive={isChatActive} 
              onError={handleError}
              onTranscriptUpdate={handleTranscriptUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

