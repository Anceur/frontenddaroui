import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastComponent({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 3000;

  useEffect(() => {
    // Progress bar animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 16); // ~60fps

    // Auto-dismiss timer
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [toast.id, duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    const iconProps = { size: 22, strokeWidth: 2.5 };
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="text-emerald-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="text-rose-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-amber-500" />;
      case 'info':
        return <Info {...iconProps} className="text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
          border: 'rgba(16, 185, 129, 0.3)',
          progressBg: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
          shadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
          iconBg: 'rgba(16, 185, 129, 0.1)'
        };
      case 'error':
        return {
          gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
          border: 'rgba(239, 68, 68, 0.3)',
          progressBg: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
          shadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
          iconBg: 'rgba(239, 68, 68, 0.1)'
        };
      case 'warning':
        return {
          gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
          border: 'rgba(245, 158, 11, 0.3)',
          progressBg: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
          shadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
          iconBg: 'rgba(245, 158, 11, 0.1)'
        };
      case 'info':
        return {
          gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
          border: 'rgba(59, 130, 246, 0.3)',
          progressBg: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
          shadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
          iconBg: 'rgba(59, 130, 246, 0.1)'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="relative overflow-hidden rounded-xl border backdrop-blur-xl min-w-[320px] max-w-[420px]"
      style={{
        animation: isExiting 
          ? 'toastSlideOut 0.3s ease-in forwards' 
          : 'toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        background: styles.gradient,
        borderColor: styles.border,
        boxShadow: styles.shadow,
      }}
    >
      {/* Progress bar */}
      <div 
        className="absolute top-0 left-0 h-1 transition-all ease-linear"
        style={{
          width: `${progress}%`,
          background: styles.progressBg,
          transitionDuration: '16ms'
        }}
      />
      
      {/* Content */}
      <div className="flex items-start gap-3 px-4 py-3.5 pt-4">
        {/* Icon with background */}
        <div 
          className="flex-shrink-0 p-1.5 rounded-lg"
          style={{ background: styles.iconBg }}
        >
          {getIcon()}
        </div>
        
        {/* Message */}
        <p className="flex-1 text-sm font-medium text-gray-800 leading-relaxed pt-0.5">
          {toast.message}
        </p>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-black/5 active:bg-black/10 transition-all duration-200 text-gray-600 hover:text-gray-800"
          aria-label="Close notification"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      style={{ zIndex: 9999 }}
    >
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Toast hook for easy usage
let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) => showToast(message, 'success', duration);
  const error = (message: string, duration?: number) => showToast(message, 'error', duration);
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration);
  const info = (message: string, duration?: number) => showToast(message, 'info', duration);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />
  };
}

