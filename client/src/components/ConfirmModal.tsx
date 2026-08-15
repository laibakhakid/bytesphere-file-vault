import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  let icon = <Trash2 className="w-5 h-5 text-[#DC2626]" />;
  let iconBg = 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]';
  let confirmBtnBg = 'bg-[#DC2626] hover:bg-[#B91C1C] text-white';

  if (variant === 'warning') {
    icon = <AlertTriangle className="w-5 h-5 text-[#D97706]" />;
    iconBg = 'bg-[#FEF3C7] border-[#FDE047] text-[#D97706]';
    confirmBtnBg = 'bg-[#D97706] hover:bg-[#B45309] text-white';
  } else if (variant === 'info') {
    icon = <AlertTriangle className="w-5 h-5 text-[#7C3AED]" />;
    iconBg = 'bg-[#EDE9FE] border-[#C4B5FD] text-[#7C3AED]';
    confirmBtnBg = 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-serif"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#C4B5FD] shadow-xl relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#1E1B4B] p-1 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5 mb-4">
          <div className={`p-2.5 rounded-xl border ${iconBg} shrink-0`}>
            {icon}
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-lg font-bold text-[#1E1B4B]">
              {title}
            </h3>
            <p className="text-sm text-[#4B5563] mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-[#E5E7EB] mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#FAF8F5] cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center space-x-1.5 cursor-pointer ${confirmBtnBg}`}
          >
            <span>{isLoading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
