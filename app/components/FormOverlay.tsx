'use client';

import { useState, useCallback, useEffect } from 'react';
import { VisitorData } from '@/types';

interface FormOverlayProps {
  isVisible: boolean;
  onSubmit: (data: VisitorData) => void;
}

export default function FormOverlay({ isVisible, onSubmit }: FormOverlayProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof VisitorData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);

  // Animate in after mount
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof VisitorData, string>> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Contact number is required';
    } else if (!/^[+]?[\d\s\-()]{7,20}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, company, email, phone]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit, name, company, email, phone]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  if (!isVisible) return null;

  // ── Styles ──────────────────────────────────────────────────

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    opacity: show ? 1 : 0,
    transition: 'opacity 0.4s ease',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.88)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: '36px 32px 28px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
    transform: show ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)',
    opacity: show ? 1 : 0,
    transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: '-0.01em',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 1.5,
  };

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: 18,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: '0.92rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  };

  const inputFocusRing = '0 0 0 2px rgba(59, 130, 246, 0.35)';

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#f87171',
    marginTop: 4,
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 0',
    background: isSubmitting
      ? 'rgba(59, 130, 246, 0.4)'
      : 'linear-gradient(135deg, #3b82f6, #6366f1)',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    marginTop: 8,
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s ease, transform 0.15s ease',
    opacity: isSubmitting ? 0.7 : 1,
  };

  const ariaHintStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
    padding: '8px 16px',
    background: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    borderRadius: 10,
    fontSize: '0.78rem',
    color: '#93c5fd',
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        {/* ARIA context hint */}
        <div style={ariaHintStyle}>
          <span>🤖</span>
          <span>ARIA is waiting — fill this in to continue the conversation</span>
        </div>

        <div style={titleStyle}>Welcome to Tekisho Conclave</div>
        <div style={subtitleStyle}>
          Tell us a bit about yourself so ARIA can personalise your experience.
        </div>

        {/* Full Name */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Full Name</label>
          <input
            style={{
              ...inputStyle,
              borderColor: errors.name ? '#f87171' : 'rgba(255,255,255,0.12)',
            }}
            type="text"
            placeholder="e.g. Priya Sharma"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = inputFocusRing; e.currentTarget.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.name ? '#f87171' : 'rgba(255,255,255,0.12)'; }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {errors.name && <div style={errorStyle}>{errors.name}</div>}
        </div>

        {/* Company Name */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Company Name</label>
          <input
            style={{
              ...inputStyle,
              borderColor: errors.company ? '#f87171' : 'rgba(255,255,255,0.12)',
            }}
            type="text"
            placeholder="e.g. Acme Inc."
            value={company}
            onChange={(e) => { setCompany(e.target.value); setErrors((p) => ({ ...p, company: undefined })); }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = inputFocusRing; e.currentTarget.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.company ? '#f87171' : 'rgba(255,255,255,0.12)'; }}
            onKeyDown={handleKeyDown}
          />
          {errors.company && <div style={errorStyle}>{errors.company}</div>}
        </div>

        {/* Email Address */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Email Address</label>
          <input
            style={{
              ...inputStyle,
              borderColor: errors.email ? '#f87171' : 'rgba(255,255,255,0.12)',
            }}
            type="email"
            placeholder="e.g. priya@acme.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = inputFocusRing; e.currentTarget.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.email ? '#f87171' : 'rgba(255,255,255,0.12)'; }}
            onKeyDown={handleKeyDown}
          />
          {errors.email && <div style={errorStyle}>{errors.email}</div>}
        </div>

        {/* Contact Number */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Contact Number</label>
          <input
            style={{
              ...inputStyle,
              borderColor: errors.phone ? '#f87171' : 'rgba(255,255,255,0.12)',
            }}
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = inputFocusRing; e.currentTarget.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.phone ? '#f87171' : 'rgba(255,255,255,0.12)'; }}
            onKeyDown={handleKeyDown}
          />
          {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
        </div>

        {/* Submit Button */}
        <button
          style={btnStyle}
          onClick={handleSubmit}
          disabled={isSubmitting}
          onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isSubmitting ? 'Submitting...' : 'Continue with ARIA →'}
        </button>
      </div>
    </div>
  );
}
