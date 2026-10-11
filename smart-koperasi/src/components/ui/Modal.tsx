import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onClose?: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, size = 'md', onClose }) => {
  const sizeClass = size !== 'md' ? `modal-${size}` : '';

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose?.();
    }}>
      <div className={`modal-content ${sizeClass}`.trim()}>
        {onClose && (
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Memuat data...' }) => (
  <div className="loading-container">
    <div className="spinner" />
    <span className="loading-text">{text}</span>
  </div>
);
