import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import {
  ArrowDownLeft,
  Wallet,
  Clock,
  CheckCircle,
  Info,
  XCircle,
  Shield,
  Zap,
  Banknote,
  TrendingDown
} from 'lucide-react';

export function PenarikanPage() {
  // Subscribe to Zustand state - ensures reactivity
  const currentUser = useStore(state => state.currentUser);
  const transactions = useStore(state => state.transactions);
  const addPenarikan = useStore(state => state.addPenarikan);
  
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  if (!currentUser) return null;

  // Calculate savings from transactions directly (reactive)
  const userTransactions = transactions.filter(t => t.userId === currentUser.id);
  
  const deposits = userTransactions
    .filter(t => t.type === 'simpanan' && t.status === 'approved');
  
  const approvedWithdrawals = userTransactions
    .filter(t => t.type === 'penarikan' && t.status === 'approved');
  
  // Calculate sukarela balance
  const sukarelaBruto = deposits
    .filter(t => t.savingsType === 'sukarela')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawn = approvedWithdrawals.reduce((sum, t) => sum + t.amount, 0);
  const sukarelaNetto = Math.max(0, sukarelaBruto - totalWithdrawn);

  // Get all withdrawal transactions for history
  const withdrawals = userTransactions
    .filter(t => t.type === 'penarikan')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate pending
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const actualAvailable = Math.max(0, sukarelaNetto - pendingAmount);

  const handleWithdrawClick = () => {
    if (!amount) {
      showSnackbar('Masukkan nominal', 'error');
      return;
    }

    const withdrawAmount = parseInt(amount);
    if (withdrawAmount < 10000) {
      showSnackbar('Minimal Rp 10.000', 'error');
      return;
    }

    if (withdrawAmount > actualAvailable) {
      showSnackbar('Saldo tidak cukup', 'error');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmWithdraw = () => {
    const result = addPenarikan(currentUser.id, parseInt(amount), notes || undefined);
    
    if (result) {
      showSnackbar('Penarikan diajukan! Menunggu approval.', 'success');
      setShowModal(false);
      setShowConfirm(false);
      setAmount('');
      setNotes('');
    } else {
      showSnackbar('Gagal - saldo tidak cukup', 'error');
      setShowConfirm(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000].filter(a => a <= actualAvailable);

  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          gap: '12px'
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              Penarikan
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Tarik simpanan sukarela</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={actualAvailable < 10000}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: actualAvailable < 10000 ? '#d1d5db' : 'linear-gradient(135deg, #dc2626, #f87171)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: actualAvailable < 10000 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              boxShadow: actualAvailable < 10000 ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            <ArrowDownLeft style={{ width: '16px', height: '16px' }} />
            Tarik
          </button>
        </div>

        {/* Pending Alert */}
        {pendingAmount > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '2px solid #fcd34d',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Clock style={{ width: '18px', height: '18px', color: '#d97706', flexShrink: 0 }} />
            <p style={{ margin: 0, color: '#92400e', fontSize: '13px' }}>
              <span style={{ fontWeight: '600' }}>Rp {pendingAmount.toLocaleString('id-ID')}</span> menunggu approval
            </p>
          </div>
        )}

        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f5132 0%, #198754 50%, #20c997 100%)',
          borderRadius: '20px',
          padding: 'clamp(20px, 4vw, 32px)',
          marginBottom: '16px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Wallet style={{ width: '18px', height: '18px', opacity: 0.9 }} />
              <span style={{ fontSize: '12px', opacity: 0.9 }}>Saldo Dapat Ditarik</span>
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 7vw, 36px)', fontWeight: '800', margin: '0 0 8px 0' }}>
              Rp {actualAvailable.toLocaleString('id-ID')}
            </h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px' }}>
                <p style={{ fontSize: '10px', opacity: 0.85, margin: '0 0 2px 0' }}>Sukarela Total</p>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Rp {sukarelaNetto.toLocaleString('id-ID')}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px' }}>
                <p style={{ fontSize: '10px', opacity: 0.85, margin: '0 0 2px 0' }}>Dalam Proses</p>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Rp {pendingAmount.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', background: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Approved</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a', margin: 0 }}>
              {withdrawals.filter(w => w.status === 'approved').length}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock style={{ width: '16px', height: '16px', color: '#d97706' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Pending</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#d97706', margin: 0 }}>
              {pendingWithdrawals.length}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#e0f2fe',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Info style={{ width: '16px', height: '16px', color: '#0284c7' }} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>Info Penarikan</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0, fontSize: '12px' }}>Sukarela</p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Dapat ditarik</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <XCircle style={{ width: '16px', height: '16px', color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0, fontSize: '12px' }}>Pokok & Wajib</p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Tidak dapat ditarik</p>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '11px' }}>
              <Shield style={{ width: '12px', height: '12px' }} />
              Min: Rp 10rb
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '11px' }}>
              <Zap style={{ width: '12px', height: '12px' }} />
              1-2 hari kerja
            </div>
          </div>
        </div>

        {/* History */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Riwayat Penarikan
          </h3>

          {withdrawals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
              <TrendingDown style={{ width: '36px', height: '36px', marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada penarikan</p>
            </div>
          ) : (
            <div>
              {withdrawals.map((t, index) => (
                <div key={t.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: index < withdrawals.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <p style={{ fontWeight: '500', color: '#111827', margin: 0, fontSize: '14px' }}>
                        Penarikan
                      </p>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '10px',
                        fontWeight: '500',
                        color: t.status === 'approved' ? '#16a34a' : t.status === 'rejected' ? '#dc2626' : '#d97706'
                      }}>
                        {t.status === 'approved' && <CheckCircle style={{ width: '10px', height: '10px' }} />}
                        {t.status === 'pending' && <Clock style={{ width: '10px', height: '10px' }} />}
                        {t.status === 'rejected' && <XCircle style={{ width: '10px', height: '10px' }} />}
                        {t.status === 'approved' ? 'OK' : t.status === 'pending' ? 'Pending' : 'Ditolak'}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{t.date}</p>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: t.status === 'approved' ? '#dc2626' : '#6b7280', margin: 0 }}>
                    -Rp {t.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tarik Dana" size="md">
        <div>
          {/* Saldo Card */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '0 0 6px 0', fontWeight: '500' }}>
                    Saldo Tersedia
                  </p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                    Rp {actualAvailable.toLocaleString('id-ID')}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wallet style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '10px' 
            }}>
              Nominal Penarikan
            </label>
            <div style={{
              position: 'relative',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '2px solid #e5e7eb',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #dc2626, #f87171)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <Banknote style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>Rupiah</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    max={actualAvailable}
                    style={{
                      width: '100%',
                      padding: '0',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#111827',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Amounts */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginTop: '12px',
              flexWrap: 'wrap'
            }}>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(String(amt))}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: amount === String(amt) ? '2px solid #dc2626' : '2px solid #e5e7eb',
                    background: amount === String(amt) ? '#fee2e2' : 'white',
                    color: amount === String(amt) ? '#dc2626' : '#374151',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {(amt / 1000)}rb
                </button>
              ))}
              {actualAvailable >= 10000 && (
                <button
                  onClick={() => setAmount(String(actualAvailable))}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '2px solid #dc2626',
                    background: amount === String(actualAvailable) ? '#dc2626' : 'white',
                    color: amount === String(actualAvailable) ? 'white' : '#dc2626',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Semua
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '10px' 
            }}>
              Catatan <span style={{ color: '#9ca3af', fontWeight: '400' }}>(opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keperluan penarikan dana..."
              rows={3}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '14px',
                color: '#374151',
                outline: 'none',
                resize: 'none',
                background: '#f9fafb',
                transition: 'all 0.2s'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleWithdrawClick}
            disabled={!amount || parseInt(amount) < 10000 || parseInt(amount) > actualAvailable}
            style={{
              width: '100%',
              padding: '16px',
              background: !amount || parseInt(amount) < 10000 || parseInt(amount) > actualAvailable 
                ? '#e5e7eb' 
                : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              color: !amount || parseInt(amount) < 10000 || parseInt(amount) > actualAvailable 
                ? '#9ca3af' 
                : 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: !amount || parseInt(amount) < 10000 || parseInt(amount) > actualAvailable ? 'not-allowed' : 'pointer',
              boxShadow: !amount || parseInt(amount) < 10000 || parseInt(amount) > actualAvailable 
                ? 'none' 
                : '0 4px 15px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ArrowDownLeft style={{ width: '20px', height: '20px' }} />
            Tarik Dana
          </button>

          <p style={{ 
            textAlign: 'center', 
            fontSize: '12px', 
            color: '#9ca3af', 
            marginTop: '16px' 
          }}>
            Dana akan ditransfer setelah disetujui admin (1-2 hari kerja)
          </p>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmWithdraw}
        title="Konfirmasi"
        message={`Tarik Rp ${parseInt(amount || '0').toLocaleString('id-ID')}? Dana akan ditransfer setelah disetujui admin.`}
        confirmText="Ya, Tarik"
        type="confirm"
      />

      <Snackbar {...snackbar} onClose={closeSnackbar} />
    </>
  );
}
