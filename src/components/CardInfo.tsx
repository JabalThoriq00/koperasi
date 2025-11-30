import React from 'react';

interface CardInfoProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  onClick?: () => void;
}

export function CardInfo({ title, value, icon, iconBg = '#dcfce7', trend, onClick }: CardInfoProps) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s',
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid #f3f4f6'
      }}
      onClick={onClick}
      onMouseOver={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>{title}</p>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>{value}</h3>
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              color: trend.positive ? '#16a34a' : '#dc2626'
            }}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            background: iconBg,
            padding: '14px',
            borderRadius: '14px'
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
