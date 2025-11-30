import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getMaxWidth = () => {
    switch (size) {
      case 'sm': return '360px';
      case 'md': return '440px';
      case 'lg': return '560px';
      case 'full': return '100%';
      default: return '440px';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
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
          maxWidth: getMaxWidth(),
          maxHeight: '90vh',
          background: 'white',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.3s ease-out',
        }}
      >
        {/* Handle bar for mobile */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            background: '#e5e7eb',
            borderRadius: '2px',
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px 20px',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '8px 20px 32px 20px',
          overflowY: 'auto',
          flex: 1,
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
