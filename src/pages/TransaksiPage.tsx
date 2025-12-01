import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
  Calendar
} from 'lucide-react';

export function TransaksiPage() {
  // Subscribe to Zustand state
  const transactions = useStore(state => state.transactions);
  const users = useStore(state => state.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'simpanan' | 'penarikan' | 'angsuran'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Date range filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sort transactions by date
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter(t => {
      const matchesSearch = t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.transactionNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      
      // Date range filter
      let matchesDate = true;
      if (startDate && endDate) {
        const txDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = txDate >= start && txDate <= end;
      } else if (startDate) {
        const txDate = new Date(t.date);
        const start = new Date(startDate);
        matchesDate = txDate >= start;
      } else if (endDate) {
        const txDate = new Date(t.date);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = txDate <= end;
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [sortedTransactions, searchQuery, filterType, filterStatus, startDate, endDate]);

  // Stats
  const totalAmount = transactions
    .filter(t => t.status === 'approved' && t.type === 'simpanan')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayTransactions = transactions.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.date === today || t.date.includes(new Date().toLocaleDateString('id-ID'));
  });

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'simpanan':
        return { icon: DollarSign, color: '#16a34a', bg: '#dcfce7', label: 'Setoran' };
      case 'penarikan':
        return { icon: TrendingDown, color: '#dc2626', bg: '#fee2e2', label: 'Penarikan' };
      case 'angsuran':
        return { icon: ShoppingBag, color: '#7c3aed', bg: '#ede9fe', label: 'Cicilan' };
      default:
        return { icon: DollarSign, color: '#6b7280', bg: '#f3f4f6', label: type };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, color: '#16a34a', bg: '#dcfce7', label: 'Disetujui' };
      case 'pending':
        return { icon: Clock, color: '#d97706', bg: '#fef3c7', label: 'Pending' };
      case 'rejected':
        return { icon: XCircle, color: '#dc2626', bg: '#fee2e2', label: 'Ditolak' };
      default:
        return { icon: Clock, color: '#6b7280', bg: '#f3f4f6', label: status };
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
          Transaksi
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
          Semua riwayat transaksi nasabah
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #198754, #20c997)',
          borderRadius: '16px',
          padding: '16px',
          color: 'white'
        }}>
          <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 4px 0' }}>Total Simpanan</p>
          <p style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>
            Rp {(totalAmount/1000000).toFixed(1)}jt
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Calendar style={{ width: '14px', height: '14px', color: '#6b7280' }} />
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Hari Ini</p>
          </div>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
            {todayTransactions.length}
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
        {[
          { label: 'Total', value: transactions.length, color: '#374151' },
          { label: 'Setoran', value: transactions.filter(t => t.type === 'simpanan').length, color: '#16a34a' },
          { label: 'Penarikan', value: transactions.filter(t => t.type === 'penarikan').length, color: '#dc2626' },
          { label: 'Cicilan', value: transactions.filter(t => t.type === 'angsuran').length, color: '#7c3aed' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            minWidth: '80px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '18px', fontWeight: '700', color: stat.color, margin: 0 }}>{stat.value}</p>
            <p style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 0 0' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: showFilters ? '12px' : '0' }}>
          <div style={{ flex: 1, position: 'relative' }}>
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: showFilters ? '#dcfce7' : '#f3f4f6',
              color: showFilters ? '#166534' : '#6b7280',
              cursor: 'pointer'
            }}
          >
            <Filter style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {showFilters && (
          <div>
            {/* Type Filter - Chips */}
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', fontWeight: '600' }}>Jenis Transaksi</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { value: 'all', label: 'Semua' },
                  { value: 'simpanan', label: 'Setoran' },
                  { value: 'penarikan', label: 'Penarikan' },
                  { value: 'angsuran', label: 'Cicilan' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterType(opt.value as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      background: filterType === opt.value ? '#198754' : '#f3f4f6',
                      color: filterType === opt.value ? 'white' : '#6b7280',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter - Chips */}
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', fontWeight: '600' }}>Status</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { value: 'all', label: 'Semua' },
                  { value: 'approved', label: 'Disetujui' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'rejected', label: 'Ditolak' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterStatus(opt.value as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      background: filterStatus === opt.value ? '#198754' : '#f3f4f6',
                      color: filterStatus === opt.value ? 'white' : '#6b7280',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Date Range Filter */}
            <div style={{ 
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar style={{ width: '14px', height: '14px', color: '#198754' }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Filter Periode</span>
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#fee2e2',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
              
              {/* Date inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Dari</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      background: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Sampai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      background: 'white'
                    }}
                  />
                </div>
              </div>
              
              {(startDate || endDate) && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 10px',
                  background: '#dcfce7',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#166534',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  ✓ {startDate ? new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '...'} — {endDate ? new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sekarang'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Daftar Transaksi ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <DollarSign style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px', margin: 0 }}>Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          <div>
            {filteredTransactions.map((t, index) => {
              const typeConfig = getTypeConfig(t.type);
              const statusConfig = getStatusConfig(t.status);
              const TypeIcon = typeConfig.icon;
              const StatusIcon = statusConfig.icon;
              const user = users.find(u => u.id === t.userId);
              
              return (
                <div key={t.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: index < filteredTransactions.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={user?.photo || 'https://via.placeholder.com/40'}
                        alt=""
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        background: typeConfig.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white'
                      }}>
                        <TypeIcon style={{ width: '10px', height: '10px', color: typeConfig.color }} />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '14px' }}>
                        {t.userName}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          background: typeConfig.bg,
                          color: typeConfig.color
                        }}>
                          {typeConfig.label}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: '700',
                      color: t.type === 'penarikan' || t.type === 'angsuran' ? '#dc2626' : '#16a34a',
                      fontSize: '14px',
                      margin: '0 0 4px 0'
                    }}>
                      {t.type === 'penarikan' || t.type === 'angsuran' ? '-' : '+'}Rp {(t.amount/1000).toFixed(0)}rb
                    </p>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '600',
                      background: statusConfig.bg,
                      color: statusConfig.color
                    }}>
                      <StatusIcon style={{ width: '10px', height: '10px' }} />
                      {statusConfig.label}
                    </span>
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
