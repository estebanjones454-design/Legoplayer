import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-300 bg-white text-slate-800',
    error: 'border-red-300 bg-white text-slate-800',
    info: 'border-blue-300 bg-white text-slate-800',
  };

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-bottom duration-200 ${borders[toast.type]}`}
    >
      <div className="flex items-center gap-2.5">
        {icons[toast.type]}
        <span>{toast.text}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
