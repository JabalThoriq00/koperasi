import React from 'react';
import type { TransactionStatus } from '../store/useStore';

interface StatusBadgeProps {
  status: TransactionStatus | 'active' | 'pending' | 'suspended' | 'paid' | 'unpaid' | 'overdue';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    approved: { label: 'Disetujui', bg: 'bg-[#27AE60]', text: 'text-white' },
    pending: { label: 'Menunggu', bg: 'bg-[#F1C40F]', text: 'text-gray-900' },
    rejected: { label: 'Ditolak', bg: 'bg-[#E74C3C]', text: 'text-white' },
    active: { label: 'Aktif', bg: 'bg-[#27AE60]', text: 'text-white' },
    suspended: { label: 'Ditangguhkan', bg: 'bg-gray-400', text: 'text-white' },
    paid: { label: 'Lunas', bg: 'bg-[#27AE60]', text: 'text-white' },
    unpaid: { label: 'Belum Lunas', bg: 'bg-gray-400', text: 'text-white' },
    overdue: { label: 'Terlambat', bg: 'bg-[#E74C3C]', text: 'text-white' },
  };

  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center justify-center rounded-full ${config.bg} ${config.text} ${sizeClass}`}>
      {config.label}
    </span>
  );
}
