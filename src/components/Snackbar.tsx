import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface SnackbarProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Snackbar({ message, type, isOpen, onClose, duration = 3000 }: SnackbarProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bg: 'bg-[#27AE60]',
      text: 'text-white',
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-[#E74C3C]',
      text: 'text-white',
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      bg: 'bg-[#F1C40F]',
      text: 'text-gray-900',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bg: 'bg-blue-500',
      text: 'text-white',
    },
  };

  const { icon, bg, text } = config[type];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${bg} ${text} rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-md`}>
        {icon}
        <p className="flex-1">{message}</p>
        <button
          onClick={onClose}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Hook untuk menggunakan Snackbar
export function useSnackbar() {
  const [snackbar, setSnackbar] = React.useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbar({ isOpen: true, message, type });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  };

  return {
    snackbar,
    showSnackbar,
    closeSnackbar,
  };
}
