import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}) => {
  const closedByPopstateRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    closedByPopstateRef.current = false;
    const stateObj = { modal: title || 'dialog', timestamp: Date.now() };
    window.history.pushState(stateObj, '', window.location.href);

    const handlePopState = () => {
      closedByPopstateRef.current = true;
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;

      if (!closedByPopstateRef.current && window.history.state?.modal) {
        window.history.back();
      }
    };
  }, [isOpen, onClose, title]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className={`relative w-full ${maxWidth} bg-cream-50 rounded-[10px] shadow-2xl border border-sand-300 z-10 overflow-hidden transform transition-all max-h-[90dvh] flex flex-col text-ink`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-dialog-title' : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-300 bg-cream-50">
          <h3 id="modal-dialog-title" className="text-xl font-serif font-bold text-navy-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate hover:text-navy-800 hover:bg-sand-200 transition-colors btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto overscroll-contain flex-1">{children}</div>
      </div>
    </div>
  );
};
