import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsExiting(false);
      setIsVisible(true);
      const duration = toast.duration ?? 3000;
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsExiting(false);
    }
  }, [toast]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 200);
  };

  if (!toast || !isVisible) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-400',
      icon: <CheckCircle size={20} className="text-white" />,
    },
    error: {
      bg: 'bg-red-500',
      border: 'border-red-400',
      icon: <XCircle size={20} className="text-white" />,
    },
    info: {
      bg: 'bg-blue-500',
      border: 'border-blue-400',
      icon: <AlertCircle size={20} className="text-white" />,
    },
  };

  const config = typeConfig[toast.type];

  return (
    <div className="fixed top-4 right-4 z-50 flex animate-in fade-in slide-in-from-right-4 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${config.bg} ${config.border} text-white min-w-[240px] max-w-[400px] transition-all duration-200 ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
      >
        {config.icon}
        <span className="flex-1 text-sm font-medium">{toast.message}</span>
        <button
          onClick={handleClose}
          className="p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

let toastCallback: ((toast: ToastMessage) => void) | null = null;

export function showToast(type: ToastType, message: string, duration?: number) {
  if (toastCallback) {
    toastCallback({
      id: Date.now().toString(),
      type,
      message,
      duration,
    });
  }
}

export function setToastCallback(callback: ((toast: ToastMessage) => void) | null) {
  toastCallback = callback;
}
