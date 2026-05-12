'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: number;
  children: React.ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = 800,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* Focus trap — move focus into modal when it opens */
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable[0]?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      {/* Panel */}
      <div
        ref={dialogRef}
        className="animate-fade-in-scale relative flex flex-col w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth,
          maxHeight: '90vh',
          background: '#FFFFFF',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div
            className="flex items-start justify-between px-6 pt-6 pb-4 flex-shrink-0"
            style={{ borderBottom: '1px solid #E5E5E5' }}
          >
            <div>
              {title && (
                <h2 className="font-bold" style={{ fontSize: 20, color: '#111111' }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1" style={{ fontSize: 13, color: '#555555' }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ml-4"
              style={{ width: 32, height: 32, color: '#555555' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
                e.currentTarget.style.color = '#111111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#555555';
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Close button when no header */}
        {!title && !subtitle && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 32, height: 32, color: '#555555', background: '#F3F4F6' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E5E5E5';
              e.currentTarget.style.color = '#111111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.color = '#555555';
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
