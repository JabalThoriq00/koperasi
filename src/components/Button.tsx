import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: disabled ? '#9ca3af' : 'linear-gradient(135deg, #198754, #20c997)',
          color: 'white',
          border: 'none',
          boxShadow: disabled ? 'none' : '0 4px 12px rgba(25, 135, 84, 0.3)'
        };
      case 'secondary':
        return {
          background: 'white',
          color: '#198754',
          border: '2px solid #198754'
        };
      case 'danger':
        return {
          background: disabled ? '#9ca3af' : 'linear-gradient(135deg, #dc2626, #ef4444)',
          color: 'white',
          border: 'none',
          boxShadow: disabled ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.3)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#4b5563',
          border: 'none'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '8px 16px', fontSize: '13px' };
      case 'md':
        return { padding: '12px 24px', fontSize: '15px' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '16px' };
      default:
        return {};
    }
  };

  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: disabled ? 0.7 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      onMouseOver={(e) => {
        if (!disabled && variant === 'secondary') {
          e.currentTarget.style.background = '#f0fdf4';
        } else if (!disabled && variant === 'ghost') {
          e.currentTarget.style.background = '#f3f4f6';
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && variant === 'secondary') {
          e.currentTarget.style.background = 'white';
        } else if (!disabled && variant === 'ghost') {
          e.currentTarget.style.background = 'transparent';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
