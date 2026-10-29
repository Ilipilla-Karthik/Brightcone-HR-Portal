import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface ToastProps {
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
  message?: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  toasts,
  onDismiss,
  message,
  type = 'info',
  onClose,
}) => {
  // If single toast format is used
  if (message && onClose) {
    return (
      <div className={styles.toastContainer} aria-live="polite" data-testid="toast-container">
        <ToastItem
          toast={{ id: 'single', type, text: message }}
          onDismiss={onClose}
        />
      </div>
    );
  }

  // Multi-toast format
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer} aria-live="polite" data-testid="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss?.(t.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getStyleAndIcon = () => {
    switch (toast.type) {
      case 'success':
        return {
          cls: styles.toastSuccess,
          icon: <CheckCircle2 size={18} style={{ color: '#15A36B' }} />,
        };
      case 'error':
        return {
          cls: styles.toastError,
          icon: <AlertCircle size={18} style={{ color: '#D93D4A' }} />,
        };
      default:
        return {
          cls: styles.toastInfo,
          icon: <Info size={18} style={{ color: '#0B6FDB' }} />,
        };
    }
  };

  const { cls, icon } = getStyleAndIcon();

  return (
    <div className={`${styles.toast} ${cls}`} role="status">
      <div className={styles.toastIcon}>{icon}</div>
      <div className={styles.toastText}>{toast.text}</div>
      <button
        type="button"
        className={styles.toastClose}
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
