'use client';

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

const products = [
  {
    id: 'LeadQ',
    name: 'LeadQ.ai',
    description: 'AI-powered platform that discovers high-quality leads and automates lead qualification.',
    Icon: LeadQIcon,
  },
  {
    id: 'VocalQ',
    name: 'VocalQ.ai',
    description: 'Conversational voice AI system designed for discovery calls, reminders, and follow-ups.',
    Icon: VocalQIcon,
  },
  {
    id: 'EmailQ',
    name: 'EmailQ.ai',
    description: 'AI email assistant that automates outreach and intelligent communication.',
    Icon: EmailQIcon,
  },
];

interface ProductSelectionModalProps {
  onProductSelected: (product: string) => void;
  onClose: () => void;
}

export default function ProductSelectionModal({ onProductSelected, onClose }: ProductSelectionModalProps) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="product-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &#x2715;
        </button>

        <h2 className="modal-title">What would you like to explore today?</h2>
        <p className="modal-subtitle">Select a product and ARIA will introduce it to you.</p>

        <div className="modal-products-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className="modal-product-card"
              onClick={() => onProductSelected(product.id)}
            >
              <div className="modal-icon-box">
                <product.Icon />
              </div>
              <div className="modal-product-name">{product.name}</div>
              <div className="modal-product-desc">{product.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
