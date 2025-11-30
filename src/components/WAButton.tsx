import React from 'react';
import { MessageCircle, Check, Clock } from 'lucide-react';

interface WAButtonProps {
  sent?: boolean;
  sentAt?: string;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function WAButton({ sent = false, sentAt, onClick, size = 'md' }: WAButtonProps) {
  if (sent) {
    return (
      <div className={`inline-flex items-center gap-2 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-[#27AE60]`}>
        <Check className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>Terkirim {sentAt ? `(${sentAt})` : ''}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 ${
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      } bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors`}
    >
      <MessageCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>Kirim WA</span>
    </button>
  );
}

export function WAStatusIcon({ sent }: { sent: boolean }) {
  if (sent) {
    return (
      <div className="w-8 h-8 bg-[#27AE60] rounded-full flex items-center justify-center">
        <Check className="w-4 h-4 text-white" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
      <Clock className="w-4 h-4 text-gray-600" />
    </div>
  );
}
