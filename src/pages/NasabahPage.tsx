import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Clock,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wallet,
  CreditCard,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';

export function NasabahPage() {
  // Subscribe to Zustand state
  const users = useStore(state => state.users);
  const transactions = useStore(state => state.transactions);
  const loans = useStore(state => state.loans);
  const toggleUserStatus = useStore(state => state.toggleUserStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'suspend'>('activate');
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // Get nasabah users only
  const nasabahUsers = users.filter(u => u.role === 'nasabah');

  // Filter users
  const filteredUsers = nasabahUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || user.accountStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalNasabah = nasabahUsers.length;
  const activeNasabah = nasabahUsers.filter(u => u.accountStatus === 'active').length;
  const pendingNasabah = nasabahUsers.filter(u => u.accountStatus === 'pending').length;
  const suspendedNasabah = nasabahUsers.filter(u => u.accountStatus === 'suspended').length;

  // Calculate user balance
  const getUserBalance = (userId: string) => {
    const userTx = transactions.filter(t => t.userId === userId && t.status === 'approved');
    const deposits = userTx.filter(t => t.type === 'simpanan').reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = userTx.filter(t => t.type === 'penarikan').reduce((sum, t) => sum + t.amount, 0);
    return deposits - withdrawals;
  };

  // Get user's active loan
  const getUserActiveLoan = (userId: string) => {
    return loans.find(l => l.userId === userId && l.status === 'approved' && l.remainingAmount > 0);
  };

  const handleStatusChange = (user: any, action: 'activate' | 'suspend') => {
    setSelectedUser(user);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const confirmStatusChange = () => {
    if (selectedUser) {
      toggleUserStatus(selectedUser.id);
      showSnackbar(
        confirmAction === 'activate' ? 'Member berhasil diaktifkan!' : 'Member berhasil ditangguhkan!',
        confirmAction === 'activate' ? 'success' : 'warning'
      );
      setShowConfirmModal(false);
      setSelectedUser(null);
    }
  };

  const openUserDetail = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#dcfce7', color: '#166534', label: 'Aktif', icon: CheckCircle };
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', label: 'Pending', icon: Clock };
      case 'suspended':
        return { bg: '#fee2e2', color: '#991b1b', label: 'Ditangguhkan', icon: XCircle };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', label: status, icon: AlertTriangle };
    }
  };

  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            Kelola Nasabah
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
            Manage data anggota koperasi
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'Total', value: totalNasabah, color: '#198754', bg: '#dcfce7' },
            { label: 'Aktif', value: activeNasabah, color: '#2563eb', bg: '#dbeafe' },
            { label: 'Pending', value: pendingNasabah, color: '#d97706', bg: '#fef3c7' },
            { label: 'Suspend', value: suspendedNasabah, color: '#dc2626', bg: '#fee2e2' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '12px 8px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color: stat.color, margin: 0 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0 0' }}>{stat.label}</p>
            </div>
          ))}
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
              placeholder="Cari nama, email, atau telepon..."
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
              { value: 'active', label: 'Aktif' },
              { value: 'pending', label: 'Pending' },
              { value: 'suspended', label: 'Suspend' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value as any)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: filterStatus === filter.value ? 'linear-gradient(135deg, #198754, #20c997)' : '#f3f4f6',
                  color: filterStatus === filter.value ? 'white' : '#6b7280',
                  fontSize: '12px',
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

        {/* User List */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Daftar Nasabah ({filteredUsers.length})
          </h3>

          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <Users style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>Tidak ada nasabah ditemukan</p>
            </div>
          ) : (
            <div>
              {filteredUsers.map((user, index) => {
                const statusBadge = getStatusBadge(user.accountStatus);
                const StatusIcon = statusBadge.icon;
                const balance = getUserBalance(user.id);
                const activeLoan = getUserActiveLoan(user.id);
                
                return (
                  <div key={user.id} style={{
                    padding: '14px 0',
                    borderBottom: index < filteredUsers.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={user.photo}
                          alt={user.name}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            objectFit: 'cover'
                          }}
                        />
                        <div>
                          <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '14px' }}>
                            {user.name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                            {user.phone}
                          </p>
                        </div>
                      </div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: statusBadge.bg,
                        color: statusBadge.color
                      }}>
                        <StatusIcon style={{ width: '12px', height: '12px' }} />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wallet style={{ width: '14px', height: '14px', color: '#16a34a' }} />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          Rp {(balance/1000).toFixed(0)}rb
                        </span>
                      </div>
                      {activeLoan && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShoppingBag style={{ width: '14px', height: '14px', color: '#7c3aed' }} />
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            Rp {(activeLoan.remainingAmount/1000).toFixed(0)}rb
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openUserDetail(user)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb',
                          background: 'white',
                          color: '#374151',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye style={{ width: '14px', height: '14px' }} />
                        Detail
                      </button>
                      {user.accountStatus === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(user, 'suspend')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#fee2e2',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserX style={{ width: '14px', height: '14px' }} />
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user, 'activate')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserCheck style={{ width: '14px', height: '14px' }} />
                          Aktifkan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Nasabah" size="md">
        {selectedUser && (() => {
          const balance = getUserBalance(selectedUser.id);
          const activeLoan = getUserActiveLoan(selectedUser.id);
          const userTxCount = transactions.filter(t => t.userId === selectedUser.id).length;
          const statusBadge = getStatusBadge(selectedUser.accountStatus);
          const StatusIcon = statusBadge.icon;
          
          return (
            <div>
              {/* Profile Header */}
              <div style={{
                background: 'linear-gradient(135deg, #198754, #20c997)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                color: 'white',
                textAlign: 'center'
              }}>
                <img
                  src={selectedUser.photo}
                  alt={selectedUser.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    objectFit: 'cover',
                    border: '4px solid rgba(255,255,255,0.3)',
                    marginBottom: '12px'
                  }}
                />
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  {selectedUser.name}
                </h3>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: statusBadge.bg,
                  color: statusBadge.color
                }}>
                  <StatusIcon style={{ width: '12px', height: '12px' }} />
                  {statusBadge.label}
                </span>
              </div>

              {/* Financial Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center'
                }}>
                  <Wallet style={{ width: '24px', height: '24px', color: '#16a34a', margin: '0 auto 6px' }} />
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#166534', margin: 0 }}>
                    Rp {(balance/1000).toFixed(0)}rb
                  </p>
                  <p style={{ fontSize: '11px', color: '#15803d', margin: '2px 0 0 0' }}>Total Simpanan</p>
                </div>
                <div style={{
                  background: '#ede9fe',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center'
                }}>
                  <ShoppingBag style={{ width: '24px', height: '24px', color: '#7c3aed', margin: '0 auto 6px' }} />
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#5b21b6', margin: 0 }}>
                    {activeLoan ? `Rp ${(activeLoan.remainingAmount/1000).toFixed(0)}rb` : '-'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#6d28d9', margin: '2px 0 0 0' }}>Sisa Cicilan</p>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                  Informasi Kontak
                </h4>
                {[
                  { icon: Phone, label: 'Telepon', value: selectedUser.phone },
                  { icon: Mail, label: 'Email', value: selectedUser.email },
                  { icon: MapPin, label: 'Alamat', value: selectedUser.address || '-' },
                  { icon: Calendar, label: 'Member sejak', value: selectedUser.memberSince || '-' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      background: '#f9fafb',
                      borderRadius: '10px',
                      marginBottom: '6px'
                    }}>
                      <Icon style={{ width: '16px', height: '16px', color: '#6b7280', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: '13px', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Statistik</p>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>{userTxCount}</p>
                    <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Transaksi</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                      {transactions.filter(t => t.userId === selectedUser.id && t.type === 'simpanan' && t.status === 'approved').length}
                    </p>
                    <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Setoran</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                      {loans.filter(l => l.userId === selectedUser.id).length}
                    </p>
                    <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Cicilan</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              {selectedUser.accountStatus === 'active' ? (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleStatusChange(selectedUser, 'suspend');
                  }}
                  style={{
                    width: '100%',
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
                  <UserX style={{ width: '18px', height: '18px' }} />
                  Tangguhkan Akun
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleStatusChange(selectedUser, 'activate');
                  }}
                  style={{
                    width: '100%',
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
                  <UserCheck style={{ width: '18px', height: '18px' }} />
                  Aktifkan Akun
                </button>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmStatusChange}
        title={confirmAction === 'activate' ? 'Aktifkan Akun?' : 'Tangguhkan Akun?'}
        message={confirmAction === 'activate' 
          ? `Aktifkan akun ${selectedUser?.name}? Member akan dapat mengakses layanan koperasi.`
          : `Tangguhkan akun ${selectedUser?.name}? Member tidak dapat melakukan transaksi.`
        }
        confirmText={confirmAction === 'activate' ? 'Ya, Aktifkan' : 'Ya, Tangguhkan'}
        type={confirmAction === 'activate' ? 'confirm' : 'danger'}
      />

      <Snackbar {...snackbar} onClose={closeSnackbar} />
    </>
  );
}
