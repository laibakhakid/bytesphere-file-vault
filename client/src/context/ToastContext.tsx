import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Copy } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'copy';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  copied: (title?: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast('success', title, message),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast('error', title, message, 6000),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast('info', title, message),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast('warning', title, message, 5000),
    [showToast]
  );
  const copied = useCallback(
    (title: string = 'Copied to clipboard', message?: string) =>
      showToast('copy', title, message, 2500),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, copied }}>
      {children}
      {/* Toast Notification Layer */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          let borderClass = 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200';
          let glowClass = 'shadow-emerald-500/10';

          if (toast.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            borderClass = 'border-rose-500/30 bg-rose-950/40 text-rose-200';
            glowClass = 'shadow-rose-500/10';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            borderClass = 'border-amber-500/30 bg-amber-950/40 text-amber-200';
            glowClass = 'shadow-amber-500/10';
          } else if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
            borderClass = 'border-blue-500/30 bg-blue-950/40 text-blue-200';
            glowClass = 'shadow-blue-500/10';
          } else if (toast.type === 'copy') {
            icon = <Copy className="w-5 h-5 text-cyan-400 shrink-0" />;
            borderClass = 'border-cyan-500/30 bg-cyan-950/40 text-cyan-200';
            glowClass = 'shadow-cyan-500/10';
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start space-x-3 transition-all duration-300 transform translate-y-0 ${borderClass} ${glowClass}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-100">{toast.title}</p>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
