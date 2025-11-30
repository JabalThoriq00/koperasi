import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  FileText,
  Eye,
  Search,
  Filter,
  TrendingDown,
  ShoppingBag,
  Image,
  AlertTriangle
} from 'lucide-react';

export function ApprovalPage() {
  // Subscribe to Zustand state
  const transactions = useStore(state => state.transactions);
  const loans = useStore(state => state.loans);
  const users = useStore(state => state.users);
  const updateTransactionStatus = useStore(state => state.updateTransactionStatus);
  const updateLoanStatus = useStore(state => state.updateLoanStatus);

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLoanDetailModal, setShowLoanDetailModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'simpanan' | 'penarikan' | 'loan'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // Get pending items
  const pendingTransactions = transactions
    .filter(t => t.status === 'pending')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const pendingLoans = loans
    .filter(l => l.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter items
  const filteredTransactions = pendingTransactions.filter(t => {
    const matchesType = filterType === 'all' || filterType === t.type;
    const matchesSearch = t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.transactionNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch && filterType !== 'loan';
  });

  const filteredLoans = filterType === 'all' || filterType === 'loan' 
    ? pendingLoans.filter(l => l.userName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const totalPending = (filterType === 'all' ? pendingTransactions.length + pendingLoans.length :
                       filterType === 'loan' ? pendingLoans.length : filteredTransactions.length);

  const handleApprove = () => {
    if (selectedTransaction) {
      updateTransactionStatus(selectedTransaction.id, 'approved');
      showSnackbar('Transaksi disetujui!', 'success');
      setShowApproveConfirm(false);
      setShowDetailModal(false);
      setSelectedTransaction(null);
    } else if (selectedLoan) {
      updateLoanStatus(selectedLoan.id, 'approved');
      showSnackbar('Pengajuan cicilan disetujui!', 'success');
      setShowApproveConfirm(false);
      setShowLoanDetailModal(false);
      setSelectedLoan(null);
    }
  };

  const handleReject = () => {
    if (selectedTransaction) {
      updateTransactionStatus(selectedTransaction.id, 'rejected');
      showSnackbar('Transaksi ditolak', 'warning');
      setShowRejectConfirm(false);
      setShowDetailModal(false);
      setSelectedTransaction(null);
    } else if (selectedLoan) {
      updateLoanStatus(selectedLoan.id, 'rejected');
      showSnackbar('Pengajuan cicilan ditolak', 'warning');
      setShowRejectConfirm(false);
      setShowLoanDetailModal(false);
      setSelectedLoan(null);
    }
  };

  const openTransactionDetail = (transaction: any) => {
    setSelectedTransaction(transaction);
    setSelectedLoan(null);
    setShowDetailModal(true);
  };

  const openLoanDetail = (loan: any) => {
    setSelectedLoan(loan);
    setSelectedTransaction(null);
    setShowLoanDetailModal(true);
  };

  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            Approval
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
            Kelola persetujuan transaksi
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: '14px',
            padding: '14px',
            textAlign: 'center'
          }}>
            <Clock style={{ width: '24px', height: '24px', color: '#d97706', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#92400e', margin: 0 }}>
              {pendingTransactions.length + pendingLoans.length}
            </p>
            <p style={{ fontSize: '11px', color: '#a16207', margin: '2px 0 0 0' }}>Total</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <DollarSign style={{ width: '24px', height: '24px', color: '#16a34a', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
              {pendingTransactions.filter(t => t.type === 'simpanan').length}
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>Setoran</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <ShoppingBag style={{ width: '24px', height: '24px', color: '#7c3aed', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
              {pendingLoans.length}
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>Cicilan</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Cari nama atau no. transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {[
              { value: 'all', label: 'Semua' },
              { value: 'simpanan', label: 'Setoran' },
              { value: 'penarikan', label: 'Penarikan' },
              { value: 'loan', label: 'Cicilan' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: filterType === filter.value ? 'linear-gradient(135deg, #198754, #20c997)' : '#f3f4f6',
                  color: filterType === filter.value ? 'white' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pending List */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Menunggu Approval ({totalPending})
          </h3>

          {totalPending === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <CheckCircle style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 4px 0' }}>Tidak ada pending</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Semua transaksi sudah diproses</p>
            </div>
          ) : (
            <div>
              {/* Transaction Items */}
              {filteredTransactions.map((t, index) => (
                <div key={t.id} style={{
                  padding: '14px 0',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: t.type === 'simpanan' ? '#dcfce7' : '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {t.type === 'simpanan' ? (
                          <DollarSign style={{ width: '22px', height: '22px', color: '#16a34a' }} />
                        ) : (
                          <TrendingDown style={{ width: '22px', height: '22px', color: '#dc2626' }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '14px' }}>
                          {t.userName}
                        </p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                          {t.type === 'simpanan' ? `Setoran ${t.savingsType || 'Sukarela'}` : 'Penarikan'} • {t.date}
                        </p>
                      </div>
                    </div>
                    <p style={{
                      fontWeight: '700',
                      color: t.type === 'simpanan' ? '#16a34a' : '#dc2626',
                      fontSize: '15px',
                      margin: 0
                    }}>
                      {t.type === 'simpanan' ? '+' : '-'}Rp {(t.amount/1000).toFixed(0)}rb
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => openTransactionDetail(t)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: '2px solid #e5e7eb',
                        background: 'white',
                        color: '#374151',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTransaction(t);
                        setSelectedLoan(null);
                        setShowApproveConfirm(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle style={{ width: '16px', height: '16px' }} />
                      Setuju
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTransaction(t);
                        setSelectedLoan(null);
                        setShowRejectConfirm(true);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <XCircle style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Loan Items */}
              {filteredLoans.map((loan, index) => (
                <div key={loan.id} style={{
                  padding: '14px 0',
                  borderBottom: index < filteredLoans.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#ede9fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ShoppingBag style={{ width: '22px', height: '22px', color: '#7c3aed' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '14px' }}>
                          {loan.userName}
                        </p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                          Leasing: {loan.purpose} • {loan.tenure} bulan
                        </p>
                      </div>
                    </div>
                    <p style={{ fontWeight: '700', color: '#7c3aed', fontSize: '15px', margin: 0 }}>
                      Rp {(loan.amount/1000000).toFixed(1)}jt
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => openLoanDetail(loan)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: '2px solid #e5e7eb',
                        background: 'white',
                        color: '#374151',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLoan(loan);
                        setSelectedTransaction(null);
                        setShowApproveConfirm(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle style={{ width: '16px', height: '16px' }} />
                      Setuju
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLoan(loan);
                        setSelectedTransaction(null);
                        setShowRejectConfirm(true);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <XCircle style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Transaksi" size="md">
        {selectedTransaction && (
          <div>
            {/* User Info */}
            <div style={{
              background: selectedTransaction.type === 'simpanan' 
                ? 'linear-gradient(135deg, #16a34a, #22c55e)' 
                : 'linear-gradient(135deg, #dc2626, #f87171)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '16px', margin: 0 }}>{selectedTransaction.userName}</p>
                  <p style={{ opacity: 0.9, fontSize: '13px', margin: '2px 0 0 0' }}>
                    {selectedTransaction.type === 'simpanan' ? `Setoran ${selectedTransaction.savingsType || 'Sukarela'}` : 'Penarikan'}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>
                Rp {selectedTransaction.amount.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Details */}
            <div style={{ marginBottom: '20px' }}>
              {[
                { icon: FileText, label: 'No. Transaksi', value: selectedTransaction.transactionNumber || '-' },
                { icon: Calendar, label: 'Tanggal', value: selectedTransaction.date },
                { icon: Clock, label: 'Status', value: 'Menunggu Approval' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                      <span style={{ color: '#6b7280', fontSize: '13px' }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>{item.value}</span>
                  </div>
                );
              })}
            </div>

            {/* Bukti Transfer */}
            {selectedTransaction.proofUrl && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                  Bukti Transfer
                </p>
                <img 
                  src={selectedTransaction.proofUrl} 
                  alt="Bukti Transfer" 
                  style={{ 
                    width: '100%', 
                    borderRadius: '12px', 
                    border: '2px solid #e5e7eb' 
                  }} 
                />
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRejectConfirm(true);
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #dc2626',
                  background: 'white',
                  color: '#dc2626',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <XCircle style={{ width: '18px', height: '18px' }} />
                Tolak
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowApproveConfirm(true);
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle style={{ width: '18px', height: '18px' }} />
                Setujui
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Loan Detail Modal */}
      <Modal isOpen={showLoanDetailModal} onClose={() => setShowLoanDetailModal(false)} title="Detail Pengajuan" size="md">
        {selectedLoan && (
          <div>
            {/* Loan Info */}
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '16px', margin: 0 }}>{selectedLoan.userName}</p>
                  <p style={{ opacity: 0.9, fontSize: '13px', margin: '2px 0 0 0' }}>
                    Leasing: {selectedLoan.purpose}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>
                Rp {selectedLoan.amount.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Details */}
            <div style={{ marginBottom: '20px' }}>
              {[
                { label: 'Tenor', value: `${selectedLoan.tenure} bulan` },
                { label: 'Bunga', value: `${selectedLoan.interestRate}% / bulan` },
                { label: 'Cicilan/bulan', value: `Rp ${selectedLoan.monthlyInstallment.toLocaleString('id-ID')}` },
                { label: 'Total Bayar', value: `Rp ${(selectedLoan.monthlyInstallment * selectedLoan.tenure).toLocaleString('id-ID')}` },
                { label: 'Tanggal Pengajuan', value: selectedLoan.createdAt },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>{item.label}</span>
                  <span style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowLoanDetailModal(false);
                  setShowRejectConfirm(true);
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #dc2626',
                  background: 'white',
                  color: '#dc2626',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <XCircle style={{ width: '18px', height: '18px' }} />
                Tolak
              </button>
              <button
                onClick={() => {
                  setShowLoanDetailModal(false);
                  setShowApproveConfirm(true);
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle style={{ width: '18px', height: '18px' }} />
                Setujui
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirm */}
      <ConfirmModal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="Setujui?"
        message={selectedTransaction 
          ? `Setujui ${selectedTransaction.type === 'simpanan' ? 'setoran' : 'penarikan'} Rp ${selectedTransaction?.amount.toLocaleString('id-ID')} dari ${selectedTransaction?.userName}?`
          : `Setujui pengajuan leasing ${selectedLoan?.purpose} sebesar Rp ${selectedLoan?.amount.toLocaleString('id-ID')} dari ${selectedLoan?.userName}?`
        }
        confirmText="Ya, Setujui"
        type="confirm"
      />

      {/* Reject Confirm */}
      <ConfirmModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        title="Tolak?"
        message={selectedTransaction 
          ? `Tolak ${selectedTransaction.type === 'simpanan' ? 'setoran' : 'penarikan'} dari ${selectedTransaction?.userName}?`
          : `Tolak pengajuan leasing dari ${selectedLoan?.userName}?`
        }
        confirmText="Ya, Tolak"
        type="danger"
      />

      <Snackbar {...snackbar} onClose={closeSnackbar} />
    </>
  );
}
