import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  Edit,
  LogOut,
  Moon,
  Sun,
  Bell,
  Shield,
  ChevronRight,
  Wallet,
  CreditCard,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ProfilPageProps {
  onNavigate: (page: string) => void;
}

export function ProfilPage({ onNavigate }: ProfilPageProps) {
  const { currentUser, logout, updateUser, darkMode, toggleDarkMode, getUserBalance, getUserActiveLoan } = useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: '',
    occupation: '',
  });
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  if (!currentUser) return null;

  const balance = getUserBalance(currentUser.id);
  const activeLoan = getUserActiveLoan(currentUser.id);

  const handleEditOpen = () => {
    setEditData({
      name: currentUser.name,
      phone: currentUser.phone,
      address: currentUser.address || '',
      occupation: currentUser.occupation || '',
    });
    setShowEditModal(true);
  };

  const handleSave = () => {
    updateUser(currentUser.id, editData);
    showSnackbar('Profil diperbarui!', 'success');
    setShowEditModal(false);
  };

  const handleLogout = () => {
    logout();
    window.location.hash = '#login';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending': return 'Pending';
      case 'suspended': return 'Ditangguhkan';
      default: return status;
    }
  };

  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            Profil
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Kelola akun Anda</p>
        </div>

        {/* Profile Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f5132 0%, #198754 50%, #20c997 100%)',
          borderRadius: '20px',
          padding: 'clamp(20px, 4vw, 28px)',
          marginBottom: '16px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={currentUser.photo}
                alt={currentUser.name}
                style={{
                  width: 'clamp(60px, 15vw, 80px)',
                  height: 'clamp(60px, 15vw, 80px)',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '700', margin: '0 0 4px 0' }}>
                  {currentUser.name}
                </h2>
                <p style={{ fontSize: '13px', opacity: 0.9, margin: '0 0 8px 0' }}>
                  {currentUser.role === 'admin' ? 'Administrator' : 'Nasabah'}
                </p>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {currentUser.accountStatus === 'active' && <CheckCircle style={{ width: '12px', height: '12px' }} />}
                  {currentUser.accountStatus === 'pending' && <Clock style={{ width: '12px', height: '12px' }} />}
                  {getStatusLabel(currentUser.accountStatus)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleEditOpen}
              style={{
                position: 'absolute',
                top: '0',
                right: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <Edit style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', background: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet style={{ width: '16px', height: '16px', color: '#16a34a' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>Simpanan</span>
            </div>
            <p style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '700', color: '#111827', margin: 0 }}>
              Rp {(balance/1000000).toFixed(1)}jt
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', background: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard style={{ width: '16px', height: '16px', color: '#2563eb' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>Pinjaman</span>
            </div>
            <p style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '700', color: '#111827', margin: 0 }}>
              {activeLoan ? `Rp ${(activeLoan.remainingAmount/1000000).toFixed(1)}jt` : '-'}
            </p>
          </div>
        </div>

        {/* Personal Info */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Informasi Pribadi
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: Mail, label: 'Email', value: currentUser.email },
              { icon: Phone, label: 'Telepon', value: currentUser.phone },
              { icon: MapPin, label: 'Alamat', value: currentUser.address || '-' },
              { icon: Briefcase, label: 'Pekerjaan', value: currentUser.occupation || '-' },
              { icon: Calendar, label: 'Member sejak', value: currentUser.memberSince ? new Date(currentUser.memberSince).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '10px',
                  background: '#f9fafb',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: '#e5e7eb',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Pengaturan
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Dark Mode */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {darkMode ? <Moon style={{ width: '18px', height: '18px', color: '#6b7280' }} /> : <Sun style={{ width: '18px', height: '18px', color: '#6b7280' }} />}
                <span style={{ fontWeight: '500', color: '#111827', fontSize: '13px' }}>Mode Gelap</span>
              </div>
              <button
                onClick={toggleDarkMode}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: darkMode ? '#198754' : '#e5e7eb',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '3px',
                  left: darkMode ? '23px' : '3px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            {/* Notifications */}
            <button
              onClick={() => onNavigate('notifikasi')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                <span style={{ fontWeight: '500', color: '#111827', fontSize: '13px' }}>Notifikasi</span>
              </div>
              <ChevronRight style={{ width: '18px', height: '18px', color: '#9ca3af' }} />
            </button>

            {/* Security */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                <span style={{ fontWeight: '500', color: '#111827', fontSize: '13px' }}>Keamanan</span>
              </div>
              <ChevronRight style={{ width: '18px', height: '18px', color: '#9ca3af' }} />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px',
            background: '#fee2e2',
            border: 'none',
            borderRadius: '12px',
            color: '#dc2626',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <LogOut style={{ width: '18px', height: '18px' }} />
          Keluar
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profil" size="md">
        <div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              No. Telepon
            </label>
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Alamat
            </label>
            <textarea
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Pekerjaan
            </label>
            <input
              type="text"
              value={editData.occupation}
              onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #198754, #20c997)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Simpan
          </button>
        </div>
      </Modal>

      {/* Logout Confirm */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar?"
        message="Yakin ingin keluar dari akun?"
        confirmText="Ya, Keluar"
        type="danger"
      />

      <Snackbar {...snackbar} onClose={closeSnackbar} />
    </>
  );
}
