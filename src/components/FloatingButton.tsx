import React, { useState } from 'react';
import { Plus, DollarSign, ShoppingBag, X } from 'lucide-react';

interface FloatingButtonProps {
  onSimpanan: () => void;
  onLeasing: () => void;
}

export function FloatingButton({ onSimpanan, onLeasing }: FloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '96px',
      right: '16px',
      zIndex: 40
    }}>
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '64px',
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <button
            onClick={() => {
              onSimpanan();
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'white',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              borderRadius: '50px',
              padding: '12px 18px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Setor Simpanan</span>
          </button>
          <button
            onClick={() => {
              onLeasing();
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'white',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              borderRadius: '50px',
              padding: '12px 18px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Leasing Barang</span>
          </button>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          background: isOpen 
            ? 'linear-gradient(135deg, #dc2626, #f87171)' 
            : 'linear-gradient(135deg, #16a34a, #22c55e)',
          color: 'white',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(22, 163, 74, 0.4)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)'
        }}
      >
        {isOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Plus style={{ width: '24px', height: '24px' }} />}
      </button>
    </div>
  );
}
