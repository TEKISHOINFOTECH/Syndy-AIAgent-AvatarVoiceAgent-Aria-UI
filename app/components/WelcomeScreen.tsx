'use client';

interface WelcomeScreenProps {
  onStartChat: () => void;
  errorMessage?: string;
  isLoading?: boolean;
}

const LeadQIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const VocalQIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.09a16 16 0 0 0 6 6l.62-.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const EmailQIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const AriaRobotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M9 11V8a3 3 0 0 1 6 0v3" />
    <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none" />
    <path d="M12 2v3" />
    <path d="M8 21v1" />
    <path d="M16 21v1" />
  </svg>
);

const products = [
  {
    name: 'LeadQ.ai',
    description: 'AI-powered lead discovery platform that identifies high-quality prospects and automates lead qualification.',
    Icon: LeadQIcon,
  },
  {
    name: 'VocalQ.ai',
    description: 'Conversational AI calling system designed for discovery calls, reminders, and follow-up engagement.',
    Icon: VocalQIcon,
  },
  {
    name: 'EmailQ.ai',
    description: 'AI-driven email automation platform that powers intelligent outreach and personalized communication.',
    Icon: EmailQIcon,
  },
];

export default function WelcomeScreen({ onStartChat, errorMessage, isLoading }: WelcomeScreenProps) {
  return (
    <div className="welcome-page">
      {/* Header */}
      <header className="welcome-header">
        <div className="welcome-header-logo">T</div>
        <div className="welcome-header-info">
          <span className="welcome-header-name">Tekisho</span>
          <span className="welcome-header-tagline">The Right Place for Innovative Solutions</span>
        </div>
      </header>

      {/* Main Body */}
      <div className="welcome-body">
        <h1 className="welcome-main-title">
          Welcome to the <span className="blue-highlight">Tekisho</span> AI Growth Forum
        </h1>
        <p className="welcome-subtitle">
          Introducing our next generation AI solutions designed to transform modern business workflows.
        </p>

        {/* Product Cards */}
        <div className="welcome-products-row">
          {products.map((product) => (
            <div key={product.name} className="welcome-product-card">
              <div className="welcome-product-icon">
                <product.Icon />
              </div>
              <div className="welcome-product-name">{product.name}</div>
              <div className="welcome-product-desc">{product.description}</div>
            </div>
          ))}
        </div>

        {/* Meet ARIA Section */}
        <div className="welcome-aria-section">
          <div className="welcome-aria-icon">
            <AriaRobotIcon />
          </div>
          <div className="welcome-aria-title">Meet ARIA — Your Interactive AI Host</div>
          <div className="welcome-aria-desc">
            ARIA will guide you through Tekisho&rsquo;s latest AI innovations and help you explore each product during this launch event.
          </div>
          <button
            className="welcome-start-btn"
            onClick={onStartChat}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Start Conversation'}
          </button>
          {errorMessage && <div className="error-banner">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
}

