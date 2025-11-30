import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import { 
  DollarSign, 
  PiggyBank,
  Wallet,
  Landmark,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Image,
  ChevronDown,
  Upload,
  Banknote,
  TrendingUp
} from 'lucide-react';

export function SimpananPage() {
  // Subscribe to state changes from Zustand
  const currentUser = useStore(state => state.currentUser);
  const transactions = useStore(state => state.transactions);
  
  // Get store functions
  const getUserBalance = useStore(state => state.getUserBalance);
  const getUserSavingsDetail = useStore(state => state.getUserSavingsDetail);
  const addSimpanan = useStore(state => state.addSimpanan);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'sukarela' as 'pokok' | 'wajib' | 'sukarela',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  if (!currentUser) return null;

  // Calculate values - will update when transactions change
  const balance = getUserBalance(currentUser.id);
  const savingsDetail = getUserSavingsDetail(currentUser.id);
  
  // Get user's simpanan transactions
  const allTransactions = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'simpanan')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate pending amount
  const pendingAmount = allTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const matchesType = filterType === 'all' || t.savingsType === filterType;
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesSearch = t.transactionNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.date.includes(searchQuery);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [allTransactions, filterType, filterStatus, searchQuery]);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.amount || !proofFile) {
      showSnackbar('Harap isi nominal dan upload bukti transfer', 'error');
      return;
    }

    const amount = parseInt(formData.amount);
    if (amount < 10000) {
      showSnackbar('Minimal setoran Rp 10.000', 'error');
      return;
    }

    addSimpanan(currentUser.id, amount, formData.type, proofPreview);
    showSnackbar('Setoran berhasil diajukan! Menunggu approval admin.', 'success');
    setShowModal(false);
    setFormData({ amount: '', type: 'sukarela' });
    setProofFile(null);
    setProofPreview('');
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

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
              Simpanan
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Kelola simpanan Anda</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #198754, #20c997)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(25, 135, 84, 0.3)'
            }}
          >
            <DollarSign style={{ width: '16px', height: '16px' }} />
            Setor
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
              <span style={{ fontWeight: '600' }}>Rp {pendingAmount.toLocaleString('id-ID')}</span> menunggu approval admin
            </p>
          </div>
        )}

        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f5132 0%, #198754 50%, #20c997 100%)',
          borderRadius: '20px',
          padding: 'clamp(16px, 4vw, 28px)',
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
              <span style={{ fontSize: '12px', opacity: 0.9 }}>Total Simpanan (Approved)</span>
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: '800', margin: '0 0 16px 0' }}>
              Rp {balance.toLocaleString('id-ID')}
            </h1>
            
            {/* Savings breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { icon: Landmark, label: 'Pokok', value: savingsDetail.pokok, note: 'Tetap' },
                { icon: PiggyBank, label: 'Wajib', value: savingsDetail.wajib, note: 'Bulanan' },
                { icon: Wallet, label: 'Sukarela', value: savingsDetail.sukarela, note: 'Fleksibel' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Icon style={{ width: '12px', height: '12px' }} />
                      <span style={{ fontSize: '10px', opacity: 0.85 }}>{item.label}</span>
                    </div>
                    <p style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: '700', margin: 0 }}>
                      Rp {(item.value / 1000).toFixed(0)}rb
                    </p>
                  </div>
                );
              })}
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
              {allTransactions.filter(t => t.status === 'approved').length}
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
              {allTransactions.filter(t => t.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* History Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Riwayat Setoran
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  background: showFilters ? '#dcfce7' : '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: showFilters ? '#166534' : '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Filter
                <ChevronDown style={{ width: '14px', height: '14px', transform: showFilters ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: showFilters ? '10px' : '0' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 34px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filters */}
            {showFilters && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: 'white'
                  }}
                >
                  <option value="all">Semua Jenis</option>
                  <option value="pokok">Pokok</option>
                  <option value="wajib">Wajib</option>
                  <option value="sukarela">Sukarela</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: 'white'
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="approved">Disetujui</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            )}
          </div>

          {/* Transaction List */}
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
              <DollarSign style={{ width: '36px', height: '36px', marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada setoran</p>
            </div>
          ) : (
            <div>
              {filteredTransactions.map((t, index) => (
                <div key={t.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: index < filteredTransactions.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: t.savingsType === 'pokok' ? '#e0e7ff' : t.savingsType === 'wajib' ? '#dcfce7' : '#fef3c7',
                        color: t.savingsType === 'pokok' ? '#3730a3' : t.savingsType === 'wajib' ? '#166534' : '#92400e'
                      }}>
                        {t.savingsType === 'pokok' ? 'Pokok' : t.savingsType === 'wajib' ? 'Wajib' : 'Sukarela'}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '10px',
                        fontWeight: '500',
                        color: t.status === 'approved' ? '#16a34a' : t.status === 'rejected' ? '#dc2626' : '#d97706'
                      }}>
                        {t.status === 'approved' && <CheckCircle style={{ width: '12px', height: '12px' }} />}
                        {t.status === 'pending' && <Clock style={{ width: '12px', height: '12px' }} />}
                        {t.status === 'rejected' && <XCircle style={{ width: '12px', height: '12px' }} />}
                        {t.status === 'approved' ? 'OK' : t.status === 'pending' ? 'Pending' : 'Ditolak'}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{t.date}</p>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: t.status === 'approved' ? '#16a34a' : '#6b7280', margin: 0 }}>
                    +Rp {t.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px', textAlign: 'center' }}>
            {filteredTransactions.length} dari {allTransactions.length} transaksi
          </p>
        </div>
      </div>

      {/* Modal - Redesigned */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Setor Simpanan" size="md">
        <div>
          {/* Type Selection - Redesigned */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '12px' 
            }}>
              Jenis Simpanan
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { value: 'pokok', label: 'Pokok', icon: Landmark, desc: 'Satu kali', color: '#4f46e5' },
                { value: 'wajib', label: 'Wajib', icon: PiggyBank, desc: 'Bulanan', color: '#16a34a' },
                { value: 'sukarela', label: 'Sukarela', icon: Wallet, desc: 'Bebas', color: '#d97706' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formData.type === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setFormData({ ...formData, type: item.value as any })}
                    style={{
                      flex: 1,
                      padding: '14px 10px',
                      borderRadius: '16px',
                      border: isSelected ? `2px solid ${item.color}` : '2px solid #e5e7eb',
                      background: isSelected ? `${item.color}10` : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: isSelected ? item.color : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto'
                    }}>
                      <Icon style={{ width: '20px', height: '20px', color: isSelected ? 'white' : '#9ca3af' }} />
                    </div>
                    <p style={{ fontWeight: '600', color: isSelected ? item.color : '#374151', margin: '0 0 2px 0', fontSize: '13px' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input - Redesigned */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '10px' 
            }}>
              Nominal Setoran
            </label>
            <div style={{
              position: 'relative',
              background: '#f9fafb',
              borderRadius: '16px',
              border: '2px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
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
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
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
            
            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setFormData({ ...formData, amount: String(amt) })}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: formData.amount === String(amt) ? '2px solid #16a34a' : '2px solid #e5e7eb',
                    background: formData.amount === String(amt) ? '#dcfce7' : 'white',
                    color: formData.amount === String(amt) ? '#166534' : '#374151',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {(amt / 1000)}rb
                </button>
              ))}
            </div>
          </div>

          {/* Upload Proof - Redesigned */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '10px' 
            }}>
              Bukti Transfer
            </label>
            {proofPreview ? (
              <div style={{ 
                position: 'relative', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                border: '2px solid #16a34a',
                background: '#f0fdf4'
              }}>
                <img src={proofPreview} alt="Bukti" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '12px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: '500' }}>
                    ✓ Foto terupload
                  </span>
                  <button
                    onClick={() => { setProofFile(null); setProofPreview(''); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Ganti
                  </button>
                </div>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                border: '2px dashed #d1d5db',
                borderRadius: '16px',
                cursor: 'pointer',
                background: '#f9fafb',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <Upload style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Upload bukti transfer</span>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>PNG, JPG maksimal 5MB</span>
                <input type="file" accept="image/*" onChange={handleProofUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Info */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px'
          }}>
            <TrendingUp style={{ width: '18px', height: '18px', color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#0369a1' }}>
              Setoran akan masuk ke saldo setelah disetujui admin. Cek status di riwayat transaksi.
            </p>
          </div>

          {/* Submit Button - Redesigned */}
          <button
            onClick={handleSubmit}
            disabled={!formData.amount || !proofFile}
            style={{
              width: '100%',
              padding: '16px',
              background: !formData.amount || !proofFile 
                ? '#e5e7eb' 
                : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              color: !formData.amount || !proofFile ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: !formData.amount || !proofFile ? 'not-allowed' : 'pointer',
              boxShadow: !formData.amount || !proofFile 
                ? 'none' 
                : '0 4px 15px rgba(22, 163, 74, 0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <DollarSign style={{ width: '20px', height: '20px' }} />
            Ajukan Setoran
          </button>
        </div>
      </Modal>

      <Snackbar {...snackbar} onClose={closeSnackbar} />
    </>
  );
}
