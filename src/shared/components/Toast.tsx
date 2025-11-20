import React, { useEffect } from 'react';
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
  useEffect(() => {
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: '#F0FDF4',
          border: '#10B981',
          text: '#065F46'
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#EF4444',
          text: '#991B1B'
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#F59E0B',
          text: '#92400E'
        };
      case 'info':
        return {
          bg: '#EFF6FF',
          border: '#3B82F6',
          text: '#1E40AF'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-lg min-w-[300px] max-w-[500px]"
      style={{
        animation: 'slideInRight 0.3s ease-out',
        background: styles.bg,
        borderColor: styles.border,
        color: styles.text
      }}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded hover:bg-black/10 transition-colors"
      >
        <X size={16} />
      </button>
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

