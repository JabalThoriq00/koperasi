import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  DollarSign,
  ArrowDownLeft,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  FileText
} from 'lucide-react';

export function RiwayatPage() {
  // Subscribe to Zustand state changes
  const currentUser = useStore(state => state.currentUser);
  const transactions = useStore(state => state.transactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  if (!currentUser) return null;

  // Get user's transactions from state
  const allTransactions = transactions
    .filter(t => t.userId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter(t => {
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        const matchesSearch = 
          t.transactionNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.date.includes(searchQuery) ||
          t.type.includes(searchQuery.toLowerCase());
        
        return matchesType && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [allTransactions, filterType, filterStatus, searchQuery, sortOrder]);

  const totalIn = allTransactions
    .filter(t => t.status === 'approved' && t.type === 'simpanan')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalOut = allTransactions
    .filter(t => t.status === 'approved' && t.type === 'penarikan')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const pendingCount = allTransactions.filter(t => t.status === 'pending').length;

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'simpanan': return { icon: DollarSign, color: '#16a34a', bg: '#dcfce7' };
      case 'penarikan': return { icon: ArrowDownLeft, color: '#dc2626', bg: '#fee2e2' };
      case 'angsuran': return { icon: CreditCard, color: '#2563eb', bg: '#dbeafe' };
      default: return { icon: FileText, color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
          Riwayat
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Semua transaksi Anda</p>
      </div>

      {/* Stats - Compact Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '28px', height: '28px', background: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: '14px', height: '14px', color: '#16a34a' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Masuk</span>
          </div>
          <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: '700', color: '#16a34a', margin: 0 }}>
            Rp {(totalIn / 1000000).toFixed(1)}jt
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '28px', height: '28px', background: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown style={{ width: '14px', height: '14px', color: '#dc2626' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Keluar</span>
          </div>
          <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: '700', color: '#dc2626', margin: 0 }}>
            Rp {(totalOut / 1000000).toFixed(1)}jt
          </p>
        </div>
      </div>

      {/* Compact Stats Row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Pending</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#d97706' }}>{pendingCount}</span>
        </div>
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Total</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#4f46e5' }}>{allTransactions.length}</span>
        </div>
      </div>

      {/* Filters & List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        {/* Search & Filter Toggle */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: showFilters ? '10px' : '0' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Cari..."
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 14px',
                background: showFilters ? '#dcfce7' : '#f3f4f6',
                border: 'none',
                borderRadius: '10px',
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

          {/* Filter Options */}
          {showFilters && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: 'white'
                }}
              >
                <option value="all">Semua Jenis</option>
                <option value="simpanan">Simpanan</option>
                <option value="penarikan">Penarikan</option>
                <option value="angsuran">Angsuran</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: 'white'
                }}
              >
                <option value="all">Semua Status</option>
                <option value="approved">Disetujui</option>
                <option value="pending">Pending</option>
                <option value="rejected">Ditolak</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                style={{
                  flex: 1,
                  minWidth: '80px',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: 'white'
                }}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          )}
        </div>

        {/* Count */}
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
            {filteredTransactions.length} Transaksi
          </span>
        </div>

        {/* Transaction List - Mobile Optimized Cards */}
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
            <p style={{ fontSize: '14px' }}>Tidak ada transaksi</p>
          </div>
        ) : (
          <div>
            {filteredTransactions.map((t, index) => {
              const config = getTypeConfig(t.type);
              const Icon = config.icon;
              return (
                <div key={t.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: index < filteredTransactions.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: config.bg,
                      flexShrink: 0
                    }}>
                      <Icon style={{ width: '18px', height: '18px', color: config.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: '500', fontSize: '13px', color: '#111827' }}>
                          {t.type === 'simpanan' ? (t.savingsType || 'Sukarela') : t.type === 'penarikan' ? 'Penarikan' : 'Angsuran'}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '1px 4px',
                          borderRadius: '4px',
                          fontSize: '9px',
                          fontWeight: '500',
                          background: t.status === 'approved' ? '#dcfce7' : t.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                          color: t.status === 'approved' ? '#166534' : t.status === 'rejected' ? '#991b1b' : '#92400e'
                        }}>
                          {t.status === 'approved' && <CheckCircle style={{ width: '8px', height: '8px', marginRight: '2px' }} />}
                          {t.status === 'pending' && <Clock style={{ width: '8px', height: '8px', marginRight: '2px' }} />}
                          {t.status === 'rejected' && <XCircle style={{ width: '8px', height: '8px', marginRight: '2px' }} />}
                          {t.status === 'approved' ? '✓' : t.status === 'rejected' ? '✗' : '⏳'}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{t.date}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: t.type === 'penarikan' ? '#dc2626' : '#16a34a',
                      margin: 0
                    }}>
                      {t.type === 'penarikan' ? '-' : '+'}Rp {(t.amount/1000).toFixed(0)}rb
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
