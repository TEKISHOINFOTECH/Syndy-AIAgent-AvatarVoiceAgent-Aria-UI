'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import WelcomeScreen from './WelcomeScreen';
import LiveKitComponent, { LiveKitComponentHandle } from './LivekitComponent';
import ThankYouScreen from './ThankYouScreen';
import FormOverlay from './FormOverlay';
import { TranscriptMessage } from '../hooks/useTranscript';
import { VisitorData, ChatPhase } from '@/types';

type Screen = 'welcome' | 'chat' | 'thankyou';

export default function AvatarComponent() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [connectionKey, setConnectionKey] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Form orchestration state ─────────────────────────────
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [chatPhase, setChatPhase] = useState<ChatPhase>('form');
  const [showFormOverlay, setShowFormOverlay] = useState(false);
  const formShownRef = useRef(false);

  // Reference to the sendData function exposed by LiveKitComponent
  const sendDataRef = useRef<((payload: object) => Promise<void>) | null>(null);
  const liveKitRef = useRef<LiveKitComponentHandle>(null);

  // ── ARIA speaking state for form-show timing ──────────────
  const [ariaSpeaking, setAriaSpeaking] = useState(false);
  const ariaHasSpokenRef = useRef(false);

  // ── Show form overlay after ARIA finishes her intro ───────
  useEffect(() => {
    // Only trigger during form phase, only once
    if (screen !== 'chat' || chatPhase !== 'form' || formShownRef.current) return;

    // Wait for ARIA to have started AND then stopped speaking
    if (!ariaHasSpokenRef.current) return;  // ARIA hasn't started yet
    if (ariaSpeaking) return;               // ARIA is still talking — wait

    // ARIA has finished speaking — show form after 800ms natural pause
    const timer = setTimeout(() => {
      if (formShownRef.current) return;     // double-guard against double fire
      setShowFormOverlay(true);
      formShownRef.current = true;
      liveKitRef.current?.muteARIA();
    }, 800);

    return () => clearTimeout(timer);
  }, [ariaSpeaking, screen, chatPhase]);

  // ── Handlers ──────────────────────────────────────────────

  const handleStartConversation = useCallback(() => {
    setErrorMessage('');
    setTranscript([]);
    setVisitorData(null);
    setChatPhase('form');
    setShowFormOverlay(false);
    formShownRef.current = false;
    ariaHasSpokenRef.current = false;
    setAriaSpeaking(false);
    setConnectionKey((k) => k + 1);
    setScreen('chat');
  }, []);

  const handleARIASpeakingChanged = useCallback((isSpeaking: boolean) => {
    setAriaSpeaking(isSpeaking);
    if (isSpeaking) ariaHasSpokenRef.current = true;
  }, []);

  const handleFormSubmit = useCallback(async (data: VisitorData) => {
    setVisitorData(data);

    // POST to save-visitor API (non-blocking)
    try {
      await fetch('/api/save-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // Non-blocking — don't fail on save error
    }

    // Close overlay and transition to exploring phase
    setShowFormOverlay(false);
    setChatPhase('exploring');

    // Wait briefly, then unmute ARIA and enable mic before notifying backend
    await new Promise((r) => setTimeout(r, 1500));
    liveKitRef.current?.activateConversation();

    // Notify backend via LiveKit data channel (with retry if sendData isn't ready yet)
    const sendVisitorData = async (retriesLeft: number) => {
      if (sendDataRef.current) {
        try {
          await sendDataRef.current({
            type: 'visitor_registered',
            name: data.name,
            company: data.company,
          });
          console.log('✅ visitor_registered sent via data channel');
        } catch (err) {
          console.warn('⚠ Failed to send visitor_registered:', err);
        }
      } else if (retriesLeft > 0) {
        // sendDataRef not ready yet — retry after a short delay
        console.log(`⏳ sendData not ready, retrying... (${retriesLeft} left)`);
        await new Promise((r) => setTimeout(r, 500));
        await sendVisitorData(retriesLeft - 1);
      } else {
        console.warn('⚠ sendData was never ready — visitor_registered not sent');
      }
    };
    sendVisitorData(5);  // up to 5 retries (2.5s total)
  }, []);

  const handleEndConversation = useCallback(() => {
    // Save transcript to backend (non-blocking)
    if (transcript.length > 0) {
      const saveName = visitorData?.name || '';
      const saveEmail = visitorData?.email || '';
      console.log(`🔚 Ending conversation — saving ${transcript.length} messages for ${saveName} (${saveEmail})`);

      fetch('/api/save-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          visitorName: saveName,
          visitorEmail: saveEmail,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log('✅ Transcript save response:', data))
        .catch((err) => console.error('❌ Transcript save failed:', err));
    } else {
      console.warn('⚠ No transcript messages to save');
    }
    setScreen('welcome');
    setTranscript([]);
    setVisitorData(null);
    setChatPhase('form');
    setShowFormOverlay(false);
    formShownRef.current = false;
    setErrorMessage('');
    setIsLoading(false);
  }, [transcript, visitorData]);

  const handleRestart = useCallback(() => {
    setScreen('welcome');
    setTranscript([]);
    setVisitorData(null);
    setChatPhase('form');
    setShowFormOverlay(false);
    formShownRef.current = false;
    setErrorMessage('');
    setIsLoading(false);
  }, []);

  const handleExplore = useCallback(() => {
    setScreen('welcome');
    setTranscript([]);
    setVisitorData(null);
    setChatPhase('form');
    setShowFormOverlay(false);
    formShownRef.current = false;
    setErrorMessage('');
    setIsLoading(false);
  }, []);

  const handleError = useCallback((error: string) => {
    setErrorMessage(error);
    setIsLoading(false);
  }, []);

  const handleTranscriptUpdate = useCallback((newTranscript: TranscriptMessage[]) => {
    setTranscript(newTranscript);
  }, []);

  const handleSendDataReady = useCallback((sendDataFn: (payload: object) => Promise<void>) => {
    sendDataRef.current = sendDataFn;
  }, []);

  // ── Render ─────────────────────────────────────────────────

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onStartChat={handleStartConversation}
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
    );
  }

  if (screen === 'thankyou') {
    return (
      <ThankYouScreen
        onRestart={handleRestart}
        onExplore={handleExplore}
      />
    );
  }

  // screen === 'chat'
  return (
    <div className="chat-page" style={{ position: 'relative' }}>
      {/* Top Navigation Bar */}
      <div className="chat-topbar">
        <div className="chat-topbar-left">
          <div className="chat-logo-box">T</div>
          <span className="chat-brand-name">Tekisho</span>
          <div className="chat-brand-sep" />
          <span className="chat-brand-sub">AI Growth Forum</span>
        </div>
        <div className="chat-topbar-right">
          <div className="chat-status-pill">
            <span className={`status-dot ${transcript.length > 0 ? 'connected' : 'connecting'}`} />
            {transcript.length > 0 ? 'Live' : 'Connecting...'}
          </div>
          <button className="end-conv-btn" onClick={handleEndConversation}>
            End Conversation
          </button>
        </div>
      </div>

      {/* Main Split: Avatar + Transcript */}
      <div className="chat-body">
        <LiveKitComponent
          ref={liveKitRef}
          key={connectionKey}
          isActive={true}
          onError={handleError}
          onTranscriptUpdate={handleTranscriptUpdate}
          onSendDataReady={handleSendDataReady}
          onARIASpeakingChanged={handleARIASpeakingChanged}
        />
      </div>

      {/* Form Overlay — rendered ON TOP of chat, avatar stays visible behind */}
      {showFormOverlay && (
        <FormOverlay isVisible={showFormOverlay} onSubmit={handleFormSubmit} />
      )}
    </div>
  );
}


