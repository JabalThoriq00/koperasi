import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Smartphone,
  Laptop,
  Tv,
  Bike,
  Sofa,
  Refrigerator,
  Package,
  Tag,
  CreditCard,
  Wallet,
  ArrowRight
} from 'lucide-react';

// Katalog Barang
const katalogBarang = [
  { id: 'hp1', name: 'iPhone 15', category: 'Smartphone', price: 15000000, image: '📱', icon: Smartphone },
  { id: 'hp2', name: 'Samsung Galaxy S24', category: 'Smartphone', price: 12000000, image: '📱', icon: Smartphone },
  { id: 'hp3', name: 'Xiaomi 14', category: 'Smartphone', price: 8000000, image: '📱', icon: Smartphone },
  { id: 'lp1', name: 'MacBook Air M3', category: 'Laptop', price: 18000000, image: '💻', icon: Laptop },
  { id: 'lp2', name: 'ASUS ROG', category: 'Laptop', price: 20000000, image: '💻', icon: Laptop },
  { id: 'lp3', name: 'Lenovo ThinkPad', category: 'Laptop', price: 14000000, image: '💻', icon: Laptop },
  { id: 'tv1', name: 'Samsung Smart TV 55"', category: 'TV', price: 9000000, image: '📺', icon: Tv },
  { id: 'tv2', name: 'LG OLED 55"', category: 'TV', price: 15000000, image: '📺', icon: Tv },
  { id: 'mt1', name: 'Honda Beat', category: 'Motor', price: 18000000, image: '🏍️', icon: Bike },
  { id: 'mt2', name: 'Yamaha NMAX', category: 'Motor', price: 30000000, image: '🏍️', icon: Bike },
  { id: 'sf1', name: 'Sofa Set Minimalis', category: 'Furniture', price: 8000000, image: '🛋️', icon: Sofa },
  { id: 'kl1', name: 'Kulkas 2 Pintu LG', category: 'Elektronik', price: 7000000, image: '🧊', icon: Refrigerator },
];

const categories = ['Semua', 'Smartphone', 'Laptop', 'TV', 'Motor', 'Furniture', 'Elektronik'];

export function PinjamanPage() {
  // Subscribe to Zustand state - ensures reactivity
  const currentUser = useStore(state => state.currentUser);
  const transactions = useStore(state => state.transactions);
  const loans = useStore(state => state.loans);
  
  // Get store functions
  const addLoan = useStore(state => state.addLoan);
  const calculateLoan = useStore(state => state.calculateLoan);
  const payInstallment = useStore(state => state.payInstallment);
  
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof katalogBarang[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedTenure, setSelectedTenure] = useState(12);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  if (!currentUser) return null;

  // Calculate balance from transactions (reactive)
  const userTransactions = transactions.filter(t => t.userId === currentUser.id && t.status === 'approved');
  const deposits = userTransactions.filter(t => t.type === 'simpanan').reduce((sum, t) => sum + t.amount, 0);
  const withdrawals = userTransactions.filter(t => t.type === 'penarikan').reduce((sum, t) => sum + t.amount, 0);
  const balance = deposits - withdrawals;
  
  // Calculate sukarela balance for payment
  const sukarelaBruto = userTransactions
    .filter(t => t.type === 'simpanan' && t.savingsType === 'sukarela')
    .reduce((sum, t) => sum + t.amount, 0);
  const sukarelaNetto = Math.max(0, sukarelaBruto - withdrawals);
  
  // Get user's loans (reactive)
  const userLoans = loans.filter(l => l.userId === currentUser.id);
  const allLoans = userLoans;
  
  const maxAmount = balance * 3;
  const interestRate = 1.5;

  const filteredItems = selectedCategory === 'Semua' 
    ? katalogBarang.filter(item => item.price <= maxAmount)
    : katalogBarang.filter(item => item.category === selectedCategory && item.price <= maxAmount);

  const handleSelectItem = (item: typeof katalogBarang[0]) => {
    setSelectedItem(item);
    setShowCatalogModal(false);
    setShowDetailModal(true);
  };

  const handleApply = () => {
    if (!selectedItem) return;

    const calc = calculateLoan(selectedItem.price, selectedTenure, interestRate);
    
    addLoan({
      userId: currentUser.id,
      amount: selectedItem.price,
      purpose: selectedItem.name,
      status: 'pending',
      tenure: selectedTenure,
      interestRate,
      monthlyInstallment: calc.monthlyInstallment,
      remainingAmount: selectedItem.price,
    });

    showSnackbar('Pengajuan berhasil!', 'success');
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const handlePayClick = (installment: any) => {
    setSelectedInstallment(installment);
    setShowInstallmentsModal(false);
    setShowPaymentModal(true);
  };

  const handleConfirmPay = () => {
    if (!activeLoan || !selectedInstallment) return;
    
    // Check if user has enough sukarela balance
    if (sukarelaNetto < selectedInstallment.amount) {
      showSnackbar('Saldo sukarela tidak cukup!', 'error');
      setShowPayConfirm(false);
      return;
    }

    const success = payInstallment(activeLoan.id, selectedInstallment.id);
    
    if (success) {
      showSnackbar('Pembayaran berhasil!', 'success');
      setShowPayConfirm(false);
      setShowPaymentModal(false);
      setSelectedInstallment(null);
    } else {
      showSnackbar('Pembayaran gagal!', 'error');
      setShowPayConfirm(false);
    }
  };

  const nextInstallment = activeLoan?.installments.find(i => i.status !== 'paid');
  const isOverdue = nextInstallment && new Date(nextInstallment.dueDate) < new Date();
  const paidCount = activeLoan?.installments.filter(i => i.status === 'paid').length || 0;
  const progressPercent = activeLoan ? (paidCount / activeLoan.tenure) * 100 : 0;

  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          gap: '8px'
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              Leasing Barang
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Cicilan barang impian Anda</p>
          </div>
          <button
            onClick={() => setShowCatalogModal(true)}
            disabled={!!activeLoan}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: activeLoan ? '#d1d5db' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: activeLoan ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              boxShadow: activeLoan ? 'none' : '0 4px 15px rgba(124, 58, 237, 0.3)'
            }}
          >
            <ShoppingBag style={{ width: '16px', height: '16px' }} />
            Katalog
          </button>
        </div>

        {/* Warning */}
        {activeLoan && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '2px solid #fcd34d',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#f59e0b',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#92400e', fontSize: '13px', fontWeight: '600' }}>
                Cicilan Aktif
              </p>
              <p style={{ margin: '2px 0 0 0', color: '#a16207', fontSize: '12px' }}>
                Lunasi dulu sebelum mengajukan baru
              </p>
            </div>
          </div>
        )}

        {/* Active Lease Card */}
        {activeLoan && (
          <div style={{
            background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a78bfa 100%)',
            borderRadius: '24px',
            padding: 'clamp(20px, 4vw, 28px)',
            marginBottom: '16px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '30%',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Item info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Package style={{ width: '16px', height: '16px', opacity: 0.9 }} />
                    <span style={{ fontSize: '12px', opacity: 0.9 }}>Cicilan Aktif</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: '800', margin: '0 0 4px 0' }}>
                    {activeLoan.purpose}
                  </h2>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: 0, opacity: 0.95 }}>
                    Rp {(activeLoan.remainingAmount/1000000).toFixed(1)}jt
                  </p>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  {katalogBarang.find(k => k.name === activeLoan.purpose)?.image || '📦'}
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>Progress Cicilan</span>
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>{progressPercent.toFixed(0)}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.25)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${progressPercent}%`, 
                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    borderRadius: '10px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <p style={{ fontSize: '11px', opacity: 0.8, margin: '6px 0 0 0' }}>
                  {paidCount} dari {activeLoan.tenure} cicilan terbayar
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ fontSize: '11px', opacity: 0.85, margin: '0 0 4px 0' }}>Cicilan/bulan</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Rp {(activeLoan.monthlyInstallment/1000).toFixed(0)}rb</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ fontSize: '11px', opacity: 0.85, margin: '0 0 4px 0' }}>Sisa Tenor</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{activeLoan.tenure - paidCount} bulan</p>
                </div>
              </div>

              {/* Next Installment with Pay Button */}
              {nextInstallment && (
                <div style={{
                  background: isOverdue ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.15)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: isOverdue ? '1px solid rgba(239, 68, 68, 0.5)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: isOverdue ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', opacity: 0.9, margin: 0 }}>Cicilan Ke-{nextInstallment.month}</p>
                      <p style={{ fontSize: '15px', fontWeight: '700', margin: '2px 0 0 0' }}>Rp {(nextInstallment.amount/1000).toFixed(0)}rb</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePayClick(nextInstallment)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#78350f',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
                    }}
                  >
                    Bayar
                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              )}

              {/* Action */}
              <button
                onClick={() => setShowInstallmentsModal(true)}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '14px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Calendar style={{ width: '18px', height: '18px' }} />
                Lihat Jadwal Cicilan
              </button>
            </div>
          </div>
        )}

        {/* Info Cards - Plafon & Balance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Tag style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0' }}>Limit Cicilan</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#7c3aed', margin: 0 }}>
                  Rp {(maxAmount/1000000).toFixed(0)}jt
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wallet style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0' }}>Saldo Sukarela</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a', margin: 0 }}>
                  Rp {(sukarelaNetto/1000).toFixed(0)}rb
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Items Preview */}
        {!activeLoan && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Rekomendasi Barang
              </h3>
              <button
                onClick={() => setShowCatalogModal(true)}
                style={{
                  fontSize: '13px',
                  color: '#7c3aed',
                  background: 'none',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Lihat Semua →
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
              {katalogBarang.slice(0, 4).filter(item => item.price <= maxAmount).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  style={{
                    minWidth: '140px',
                    background: '#f9fafb',
                    borderRadius: '14px',
                    padding: '14px',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>{item.image}</div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#7c3aed', margin: 0 }}>
                    Rp {(item.price/1000000).toFixed(0)}jt
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lease History */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Riwayat Pengajuan
          </h3>

          {allLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
              <ShoppingBag style={{ width: '40px', height: '40px', marginBottom: '10px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada pengajuan cicilan</p>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Yuk pilih barang impianmu!</p>
            </div>
          ) : (
            <div>
              {allLoans.map((loan, index) => (
                <div key={loan.id} style={{
                  padding: '14px 0',
                  borderBottom: index < allLoans.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: '#f3f4f6',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px'
                      }}>
                        {katalogBarang.find(k => k.name === loan.purpose)?.image || '📦'}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '14px' }}>{loan.purpose}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>{loan.createdAt}</p>
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: loan.status === 'approved' ? '#dcfce7' : loan.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: loan.status === 'approved' ? '#166534' : loan.status === 'rejected' ? '#991b1b' : '#92400e'
                    }}>
                      {loan.status === 'approved' && <CheckCircle style={{ width: '12px', height: '12px' }} />}
                      {loan.status === 'pending' && <Clock style={{ width: '12px', height: '12px' }} />}
                      {loan.status === 'rejected' && <XCircle style={{ width: '12px', height: '12px' }} />}
                      {loan.status === 'approved' ? 'Disetujui' : loan.status === 'rejected' ? 'Ditolak' : 'Proses'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
                    <span>Harga: Rp {loan.amount.toLocaleString('id-ID')}</span>
                    <span>{loan.tenure}x • Rp {(loan.monthlyInstallment/1000).toFixed(0)}rb/bln</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Catalog Modal */}
      <Modal isOpen={showCatalogModal} onClose={() => setShowCatalogModal(false)} title="Katalog Barang" size="lg">
        <div>
          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedCategory === cat ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : '#f3f4f6',
                  color: selectedCategory === cat ? 'white' : '#6b7280',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {filteredItems.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                <p>Tidak ada barang dalam limit Anda</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const calc = calculateLoan(item.price, 12, interestRate);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      border: '2px solid #e5e7eb',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '80px',
                      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                      fontSize: '40px'
                    }}>
                      {item.image}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: '#ede9fe',
                      color: '#7c3aed',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '600',
                      marginBottom: '6px'
                    }}>
                      {item.category}
                    </span>
                    <p style={{ fontWeight: '600', color: '#111827', margin: '0 0 4px 0', fontSize: '14px' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#7c3aed', margin: '0 0 4px 0' }}>
                      Rp {(item.price/1000000).toFixed(0)}jt
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                      ~Rp {(calc.monthlyInstallment/1000).toFixed(0)}rb/bln (12x)
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Item Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Barang" size="md">
        {selectedItem && (
          <div>
            {/* Item Card */}
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                fontSize: '44px'
              }}>
                {selectedItem.image}
              </div>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                fontSize: '12px',
                marginBottom: '8px'
              }}>
                {selectedItem.category}
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>{selectedItem.name}</h3>
              <p style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>
                Rp {selectedItem.price.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Tenure Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                Pilih Tenor Cicilan
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[6, 12, 24].map((t) => {
                  const calc = calculateLoan(selectedItem.price, t, interestRate);
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTenure(t)}
                      style={{
                        padding: '14px 10px',
                        borderRadius: '14px',
                        border: selectedTenure === t ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                        background: selectedTenure === t ? '#ede9fe' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <p style={{ fontWeight: '700', color: selectedTenure === t ? '#7c3aed' : '#374151', margin: '0 0 4px 0', fontSize: '18px' }}>
                        {t}x
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                        Rp {(calc.monthlyInstallment/1000).toFixed(0)}rb/bln
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>Harga Barang</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>Rp {selectedItem.price.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>Bunga ({selectedTenure} bulan)</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>Rp {calculateLoan(selectedItem.price, selectedTenure, interestRate).totalInterest.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ height: '1px', background: '#e5e7eb', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Total Bayar</span>
                <span style={{ fontWeight: '700', color: '#7c3aed', fontSize: '16px' }}>
                  Rp {calculateLoan(selectedItem.price, selectedTenure, interestRate).totalPayment.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleApply}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CreditCard style={{ width: '20px', height: '20px' }} />
              Ajukan Cicilan
            </button>
          </div>
        )}
      </Modal>

      {/* Installments Modal with Pay Button */}
      <Modal isOpen={showInstallmentsModal} onClose={() => setShowInstallmentsModal(false)} title="Jadwal Cicilan" size="md">
        {activeLoan && (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {activeLoan.installments.map((inst) => {
              const isPending = inst.status === 'pending' || inst.status === 'overdue';
              const isNext = inst.id === nextInstallment?.id;
              
              return (
                <div key={inst.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  marginBottom: '10px',
                  borderRadius: '14px',
                  background: inst.status === 'paid' ? '#f0fdf4' : inst.status === 'overdue' ? '#fef2f2' : isNext ? '#fefce8' : '#f9fafb',
                  border: inst.status === 'paid' ? '2px solid #bbf7d0' : inst.status === 'overdue' ? '2px solid #fecaca' : isNext ? '2px solid #fde047' : '2px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: inst.status === 'paid' ? '#16a34a' : inst.status === 'overdue' ? '#dc2626' : '#7c3aed',
                      fontWeight: '700',
                      fontSize: '14px',
                      color: 'white'
                    }}>
                      {inst.status === 'paid' ? <CheckCircle style={{ width: '20px', height: '20px' }} /> : inst.month}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '14px' }}>
                        Cicilan Ke-{inst.month}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                        {new Date(inst.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', color: '#111827', margin: 0, fontSize: '14px' }}>
                        Rp {(inst.amount/1000).toFixed(0)}rb
                      </p>
                      {inst.status === 'paid' ? (
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '500' }}>✓ Lunas</span>
                      ) : inst.status === 'overdue' ? (
                        <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '500' }}>⚠ Terlambat</span>
                      ) : isNext ? (
                        <span style={{ fontSize: '11px', color: '#ca8a04', fontWeight: '500' }}>Jatuh tempo</span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>Menunggu</span>
                      )}
                    </div>
                    {isPending && isNext && (
                      <button
                        onClick={() => handlePayClick(inst)}
                        style={{
                          padding: '8px 14px',
                          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                        }}
                      >
                        Bayar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Bayar Cicilan" size="md">
        {selectedInstallment && activeLoan && (
          <div>
            {/* Payment Summary Card */}
            <div style={{
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CreditCard style={{ width: '32px', height: '32px' }} />
              </div>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 4px 0' }}>
                Cicilan Ke-{selectedInstallment.month} • {activeLoan.purpose}
              </p>
              <p style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>
                Rp {selectedInstallment.amount.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Payment Method */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
                Sumber Dana
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                background: 'white',
                borderRadius: '12px',
                border: '2px solid #16a34a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Wallet style={{ width: '22px', height: '22px', color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '14px' }}>Simpanan Sukarela</p>
                    <p style={{ fontSize: '12px', color: '#16a34a', margin: '2px 0 0 0' }}>
                      Saldo: Rp {sukarelaNetto.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} />
              </div>

              {sukarelaNetto < selectedInstallment.amount && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#fef2f2',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle style={{ width: '18px', height: '18px', color: '#dc2626' }} />
                  <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>
                    Saldo tidak cukup! Kurang Rp {(selectedInstallment.amount - sukarelaNetto).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>Jumlah Bayar</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
                  Rp {selectedInstallment.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>Saldo Setelah Bayar</span>
                <span style={{ fontWeight: '600', color: sukarelaNetto >= selectedInstallment.amount ? '#16a34a' : '#dc2626', fontSize: '13px' }}>
                  Rp {Math.max(0, sukarelaNetto - selectedInstallment.amount).toLocaleString('id-ID')}
                </span>
              </div>
              <div style={{ height: '1px', background: '#e5e7eb', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>Sisa Cicilan</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
                  {activeLoan.tenure - paidCount - 1} bulan lagi
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={() => setShowPayConfirm(true)}
              disabled={sukarelaNetto < selectedInstallment.amount}
              style={{
                width: '100%',
                padding: '16px',
                background: sukarelaNetto < selectedInstallment.amount 
                  ? '#e5e7eb' 
                  : 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: sukarelaNetto < selectedInstallment.amount ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: sukarelaNetto < selectedInstallment.amount ? 'not-allowed' : 'pointer',
                boxShadow: sukarelaNetto < selectedInstallment.amount 
                  ? 'none' 
                  : '0 4px 15px rgba(22, 163, 74, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CreditCard style={{ width: '20px', height: '20px' }} />
              Bayar Sekarang
            </button>
          </div>
        )}
      </Modal>

      {/* Pay Confirmation */}
      <ConfirmModal
        isOpen={showPayConfirm}
        onClose={() => setShowPayConfirm(false)}
        onConfirm={handleConfirmPay}
        title="Konfirmasi Pembayaran"
        message={`Bayar cicilan ke-${selectedInstallment?.month} sebesar Rp ${selectedInstallment?.amount.toLocaleString('id-ID')} dari saldo sukarela?`}
        confirmText="Ya, Bayar"
        type="confirm"
      />

      <Snackbar {...snackbar} onClose={closeSnackbar} />
    </>
  );
}
