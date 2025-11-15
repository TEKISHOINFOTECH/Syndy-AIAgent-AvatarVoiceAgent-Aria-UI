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
  const [room, setRoom] = useState<any>(null);

  const handleStartChat = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setTranscript([]); // Clear previous transcript
    setIsChatActive(true);
  };

  const handleRoomUpdate = (roomObject: any) => {
    setRoom(roomObject);
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
          // Close tab/window immediately if no messages
          closeOrNavigateBack();
          return;
        }

        console.log(`📊 Saving ${formattedTranscript.length} messages...`);

        // Get room name from LiveKit room if available
        const roomName = (room as any)?.name;
        console.log(`🏠 Room name: ${roomName || 'not available'}`);

        // Call API to save transcript with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch('/api/save-transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            transcript: formattedTranscript,
            room_name: roomName  // Pass room name to backend
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (result.success) {
          console.log('✅ Transcript saved successfully');
          console.log(`💾 Saved for: ${result.name} from ${result.company}`);
          console.log(`📊 Messages saved: ${result.message_count}`);
          
          // Show brief success message then close/navigate
          alert(`✅ Chat saved successfully for ${result.name} from ${result.company}!`);
        } else {
          console.error('❌ Failed to save transcript:', result.error);
          alert(`⚠️ Failed to save: ${result.error}`);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('❌ Save timeout: Taking too long');
          alert('⚠️ Save timeout. It may complete in background.');
        } else {
          console.error('❌ Error saving transcript:', error);
          alert('❌ Failed to save conversation.');
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      console.log('ℹ️ No transcript to save');
    }

    // Always navigate back after save attempt (success or failure)
    closeOrNavigateBack();
  };

  // Helper function to close tab or navigate back
  const closeOrNavigateBack = () => {
    console.log('🔒 Closing chat interface and checking for return URL...');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    const step = urlParams.get('step');
    const source = urlParams.get('source');
    
    console.log('Return URL:', returnUrl);
    console.log('Next Step:', step);
    console.log('Source:', source);
    
    // ✅ Navigate back to the card scanning app
    if (returnUrl) {
      console.log('🔄 Returning to:', returnUrl);
      window.location.href = decodeURIComponent(returnUrl);
    } else {
      // Fallback: Try to close the window/tab (works if opened via window.open)
      if (window.opener) {
        console.log('🔒 Closing tab (opened by another window)');
        window.close();
      } else if (window.history.length > 1) {
        console.log('⬅️ Going back in history');
        window.history.back();
      } else {
        console.log('⚠️ No return URL or history, trying to close tab');
        window.close();
        
        // If close is blocked, show message
        setTimeout(() => {
          if (!window.closed) {
            alert('✅ Chat saved! You can close this tab now.');
          }
        }, 100);
      }
    }
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
              onRoomUpdate={handleRoomUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

