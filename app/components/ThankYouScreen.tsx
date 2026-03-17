'use client';

interface ThankYouScreenProps {
  onRestart: () => void;
  onExplore: () => void;
}

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

export default function ThankYouScreen({ onRestart, onExplore }: ThankYouScreenProps) {
  return (
    <div className="thankyou-page">
      <div className="thankyou-avatar-wrap">
        <div className="thankyou-avatar-circle">
          <AriaRobotIcon />
        </div>
      </div>

      <h1 className="thankyou-title">
        Thank You for Joining the Tekisho AI Growth Forum
      </h1>

      <p className="thankyou-desc">
        We appreciate your time exploring Tekisho&rsquo;s AI innovations. We look forward to helping you transform your business with intelligent solutions.
      </p>

      <div className="thankyou-actions">
        <button className="btn-outline" onClick={onExplore}>
          Explore Tekisho Products
        </button>
        <button className="btn-primary" onClick={onRestart}>
          Restart Conversation
        </button>
      </div>
    </div>
  );
}
