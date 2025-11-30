import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'danger';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'confirm',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '28px',
          textAlign: 'center',
          animation: 'confirmScale 0.3s ease-out',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: isDanger 
            ? 'linear-gradient(135deg, #dc2626, #f87171)' 
            : 'linear-gradient(135deg, #16a34a, #22c55e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: isDanger 
            ? '0 8px 20px rgba(220, 38, 38, 0.3)' 
            : '0 8px 20px rgba(22, 163, 74, 0.3)',
        }}>
          {isDanger ? (
            <AlertTriangle style={{ width: '32px', height: '32px', color: 'white' }} />
          ) : (
            <CheckCircle style={{ width: '32px', height: '32px', color: 'white' }} />
          )}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#111827',
          margin: '0 0 12px 0',
        }}>
          {title}
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 24px 0',
          lineHeight: '1.5',
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              border: '2px solid #e5e7eb',
              background: 'white',
              color: '#374151',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: isDanger 
                ? 'linear-gradient(135deg, #dc2626, #ef4444)' 
                : 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: isDanger 
                ? '0 4px 12px rgba(220, 38, 38, 0.3)' 
                : '0 4px 12px rgba(22, 163, 74, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confirmScale {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
