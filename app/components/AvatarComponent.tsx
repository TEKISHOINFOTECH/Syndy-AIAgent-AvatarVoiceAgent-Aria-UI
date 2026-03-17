'use client';

import { useState, useEffect, useCallback } from 'react';
import WelcomeScreen from './WelcomeScreen';
import ProductSelectionModal from './ProductSelectionScreen';
import LiveKitComponent from './LivekitComponent';
import ThankYouScreen from './ThankYouScreen';
import { TranscriptMessage } from '../hooks/useTranscript';

type Screen = 'welcome' | 'chat' | 'thankyou';

// Keywords in ARIA's speech that trigger the product selection modal
const PRODUCT_TRIGGER_PHRASES = [
  'select from the options',
  'choose from the options',
  'which product',
  'select a product',
  'choose a product',
  'interested in learning',
  'would you like to explore',
  'select the product',
  'pick a product',
  'shown to talk about',
];

export default function AvatarComponent() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selectedProduct, setSelectedProduct] = useState('General');
  const [connectionKey, setConnectionKey] = useState(0);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productModalShown, setProductModalShown] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Detect ARIA asking user to select a product
  useEffect(() => {
    if (screen !== 'chat' || productModalShown || showProductModal) return;

    const ariaMessages = transcript.filter((m) => m.type === 'avatar');
    if (ariaMessages.length === 0) return;

    const lastMsg = ariaMessages[ariaMessages.length - 1].message.toLowerCase();
    const triggered = PRODUCT_TRIGGER_PHRASES.some((phrase) => lastMsg.includes(phrase));

    if (triggered) {
      // Small delay so ARIA finishes the sentence first
      setTimeout(() => {
        setShowProductModal(true);
        setProductModalShown(true);
      }, 800);
    }
  }, [transcript, screen, productModalShown, showProductModal]);

  // ── Handlers ──────────────────────────────────────────────

  const handleStartConversation = useCallback(() => {
    setErrorMessage('');
    setTranscript([]);
    setProductModalShown(false);
    setShowProductModal(false);
    setSelectedProduct('General');
    setConnectionKey((k) => k + 1);
    setScreen('chat');
  }, []);

  const handleProductSelected = useCallback((product: string) => {
    setShowProductModal(false);
    setSelectedProduct(product);
    // No reconnect — LiveKitComponent sends a data message to the live room
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowProductModal(false);
  }, []);

  const handleEndConversation = useCallback(() => {
    setScreen('thankyou');
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('welcome');
    setSelectedProduct('General');
    setTranscript([]);
    setProductModalShown(false);
    setShowProductModal(false);
    setErrorMessage('');
    setIsLoading(false);
  }, []);

  const handleExplore = useCallback(() => {
    // Return to welcome to let them see the product info
    setScreen('welcome');
    setSelectedProduct('General');
    setTranscript([]);
    setProductModalShown(false);
    setShowProductModal(false);
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
    <div className="chat-page">
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
          key={connectionKey}
          isActive={true}
          selectedProduct={selectedProduct}
          onError={handleError}
          onTranscriptUpdate={handleTranscriptUpdate}
        />
      </div>

      {/* Product Selection Modal (triggered by ARIA) */}
      {showProductModal && (
        <ProductSelectionModal
          onProductSelected={handleProductSelected}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}


