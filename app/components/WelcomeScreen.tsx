'use client';

interface WelcomeScreenProps {
  onStartChat: () => void;
  errorMessage?: string;
  isLoading?: boolean;
}

export default function WelcomeScreen({ onStartChat, errorMessage, isLoading }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <div className="company-logo">T</div>
      <h1>Tekisho Infotech</h1>
      <p className="subtitle">Meet Aria, Your AI Business Representative</p>
      <button 
        className="start-button" 
        onClick={onStartChat}
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : 'Chat with AI Assistant'}
      </button>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
}
