import React from 'react';
import { 
  Inbox, 
  Search, 
  CreditCard, 
  DollarSign, 
  Users, 
  Bell,
  History,
  FileText
} from 'lucide-react';

type EmptyStateType = 
  | 'no-data' 
  | 'no-results' 
  | 'no-transactions' 
  | 'no-loans' 
  | 'no-savings'
  | 'no-members'
  | 'no-notifications'
  | 'no-history';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  compact?: boolean;
}

const defaultConfig: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  'no-data': {
    icon: <Inbox style={{ width: '64px', height: '64px', color: '#d1d5db' }} />,
    title: 'Tidak Ada Data',
    description: 'Belum ada data yang tersedia saat ini.',
  },
  'no-results': {
    icon: <Search style={{ width: '64px', height: '64px', color: '#d1d5db' }} />,
    title: 'Tidak Ditemukan',
    description: 'Tidak ada hasil yang cocok dengan pencarian Anda.',
  },
  'no-transactions': {
    icon: <FileText style={{ width: '64px', height: '64px', color: '#d1d5db' }} />,
    title: 'Belum Ada Transaksi',
    description: 'Anda belum memiliki riwayat transaksi.',
  },
  'no-loans': {
    icon: <CreditCard style={{ width: '64px', height: '64px', color: '#d1d5db' }} />,
    title: 'Belum Ada Pinjaman',
    description: 'Anda belum mengajukan pinjaman.',
  },
  'no-savings': {
    icon: <DollarSign style={{ width: '64px', height: '64px', color: '#d1d5db' }} />,
    title: 'Belum Ada Simpanan',
    description: 'Mulai menabung untuk masa depan Anda.',
  },
  'no-members': {
    icon: <Users style={{ width: '64px', height: '64px', color: '#d1d5db' }} />,
    title: 'Belum Ada Nasabah',
    description: 'Belum ada nasabah yang terdaftar.',
  },
  'no-notifications': {
    icon: <Bell style={{ width: '64px', height: '64px', color: '#d1d5db' }} />,
    title: 'Tidak Ada Notifikasi',
    description: 'Anda tidak memiliki notifikasi baru.',
  },
  'no-history': {
    icon: <History style={{ width: '64px', height: '64px', color: '#d1d5db' }} />,
    title: 'Belum Ada Riwayat',
    description: 'Riwayat aktivitas Anda akan muncul di sini.',
  },
};

export function EmptyState({ 
  type = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  icon,
  compact = false
}: EmptyStateProps) {
  const config = defaultConfig[type];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: compact ? '32px 16px' : '64px 16px'
    }}>
      <div style={{ 
        marginBottom: '16px',
        transform: compact ? 'scale(0.75)' : 'scale(1)'
      }}>
        {icon || config.icon}
      </div>
      <h3 style={{
        fontSize: compact ? '16px' : '18px',
        fontWeight: '600',
        color: '#111827',
        margin: '0 0 8px 0'
      }}>
        {title || config.title}
      </h3>
      <p style={{
        fontSize: compact ? '14px' : '15px',
        color: '#6b7280',
        maxWidth: '320px',
        margin: 0
      }}>
        {description || config.description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: compact ? '16px' : '24px',
            padding: compact ? '10px 20px' : '12px 24px',
            background: 'linear-gradient(135deg, #198754, #20c997)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: compact ? '14px' : '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(25, 135, 84, 0.3)'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function InlineEmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '32px 16px',
      color: '#9ca3af'
    }}>
      {icon || <Inbox style={{ width: '20px', height: '20px' }} />}
      <span>{message}</span>
    </div>
  );
}
