import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import {
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  Users,
  Bell,
  Phone,
  Search,
  ExternalLink,
  Wifi,
  WifiOff,
  QrCode,
  Loader2,
  AlertCircle
} from 'lucide-react';

const WA_SERVER_URL = 'http://localhost:3001';

export function WANotifPage() {
  // Subscribe to Zustand state
  const users = useStore(state => state.users);
  const notifications = useStore(state => state.notifications);
  const addNotification = useStore(state => state.addNotification);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'reminder' | 'promo' | 'info'>('reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [waStatus, setWaStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [isSending, setIsSending] = useState(false);
  const [useOpenWA, setUseOpenWA] = useState(true); // Toggle between OpenWA and wa.me
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // Get nasabah users
  const nasabahUsers = users.filter(u => u.role === 'nasabah' && u.accountStatus === 'active');

  // Filter users
  const filteredUsers = nasabahUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  // Stats
  const waNotifications = notifications.filter(n => n.channel === 'whatsapp');
  const todayNotifications = waNotifications.filter(n => {
    const today = new Date().toISOString().split('T')[0];
    return n.createdAt.includes(today);
  });

  // Check WA Server status
  useEffect(() => {
    if (useOpenWA) {
      checkWAStatus();
      const interval = setInterval(checkWAStatus, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [useOpenWA]);

  const checkWAStatus = async () => {
    try {
      const response = await fetch(`${WA_SERVER_URL}/status`);
      const data = await response.json();
      setWaStatus(data.ready ? 'connected' : 'disconnected');
    } catch (error) {
      setWaStatus('error');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const getMessageTemplate = () => {
    switch (messageType) {
      case 'reminder':
        return 'Halo {name}, jangan lupa setor simpanan bulanan Anda. Terima kasih! 🙏';
      case 'promo':
        return 'Halo {name}! Promo spesial: Dapatkan bunga istimewa untuk simpanan sukarela. Hubungi kami! 🎉';
      case 'info':
        return 'Halo {name}, Info: Kantor koperasi buka Senin-Jumat pukul 08.00-16.00 WIB. 📍';
      default:
        return '';
    }
  };

  // Format phone for WhatsApp
  const formatPhoneForWA = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  // Send via OpenWA Server (single)
  const sendViaOpenWA = async (user: any) => {
    const message = (customMessage || getMessageTemplate()).replace('{name}', user.name);
    
    try {
      const response = await fetch(`${WA_SERVER_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          message
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        addNotification({
          userId: user.id,
          title: messageType === 'reminder' ? 'Pengingat Simpanan' : 
                 messageType === 'promo' ? 'Promo Koperasi' : 'Informasi',
          message,
          type: 'info',
          channel: 'whatsapp'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending to', user.name, error);
      return false;
    }
  };

  // Send via wa.me (fallback)
  const sendViaWaMe = (user: any) => {
    const message = (customMessage || getMessageTemplate()).replace('{name}', user.name);
    const phone = formatPhoneForWA(user.phone);
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
    
    addNotification({
      userId: user.id,
      title: messageType === 'reminder' ? 'Pengingat Simpanan' : 
             messageType === 'promo' ? 'Promo Koperasi' : 'Informasi',
      message,
      type: 'info',
      channel: 'whatsapp'
    });
  };

  // Send to single user
  const sendToUser = async (user: any) => {
    if (useOpenWA && waStatus === 'connected') {
      setIsSending(true);
      const success = await sendViaOpenWA(user);
      setIsSending(false);
      
      if (success) {
        showSnackbar(`Pesan terkirim ke ${user.name}!`, 'success');
      } else {
        showSnackbar('Gagal mengirim, coba lagi', 'error');
      }
    } else {
      sendViaWaMe(user);
      showSnackbar(`Membuka WhatsApp untuk ${user.name}...`, 'success');
    }
  };

  // Send to all selected
  const sendNotifications = async () => {
    if (selectedUsers.length === 0) {
      showSnackbar('Pilih minimal 1 nasabah', 'error');
      return;
    }

    if (useOpenWA && waStatus === 'connected') {
      // Send via OpenWA Server
      setIsSending(true);
      
      const contacts = selectedUsers.map(userId => {
        const user = users.find(u => u.id === userId);
        return { phone: user?.phone || '', name: user?.name || '' };
      }).filter(c => c.phone);

      try {
        const response = await fetch(`${WA_SERVER_URL}/send-bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contacts,
            message: customMessage || getMessageTemplate()
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          const successCount = result.results.filter((r: any) => r.success).length;
          
          // Log notifications
          selectedUsers.forEach(userId => {
            const user = users.find(u => u.id === userId);
            if (user) {
              addNotification({
                userId,
                title: messageType === 'reminder' ? 'Pengingat Simpanan' : 
                       messageType === 'promo' ? 'Promo Koperasi' : 'Informasi',
                message: (customMessage || getMessageTemplate()).replace('{name}', user.name),
                type: 'info',
                channel: 'whatsapp'
              });
            }
          });
          
          showSnackbar(`Berhasil kirim ke ${successCount}/${contacts.length} nasabah!`, 'success');
        } else {
          showSnackbar('Gagal mengirim: ' + result.error, 'error');
        }
      } catch (error) {
        showSnackbar('Error: Server tidak merespon', 'error');
      }
      
      setIsSending(false);
      
    } else {
      // Fallback to wa.me
      const message = customMessage || getMessageTemplate();
      
      selectedUsers.forEach((userId, index) => {
        const user = users.find(u => u.id === userId);
        if (user) {
          setTimeout(() => {
            sendViaWaMe(user);
          }, index * 500);
        }
      });
      
      showSnackbar(`Membuka WhatsApp untuk ${selectedUsers.length} nasabah...`, 'success');
    }

    setSelectedUsers([]);
    setCustomMessage('');
  };

  const openQRPage = () => {
    window.open(`${WA_SERVER_URL}/qr`, '_blank');
  };

  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            Notifikasi WA
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
            Kirim notifikasi ke nasabah via WhatsApp
          </p>
        </div>

        {/* Connection Mode Toggle */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Mode Kirim</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setUseOpenWA(true)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: useOpenWA ? 'linear-gradient(135deg, #25D366, #128C7E)' : '#f3f4f6',
                  color: useOpenWA ? 'white' : '#6b7280',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                OpenWA Server
              </button>
              <button
                onClick={() => setUseOpenWA(false)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !useOpenWA ? 'linear-gradient(135deg, #25D366, #128C7E)' : '#f3f4f6',
                  color: !useOpenWA ? 'white' : '#6b7280',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                wa.me Link
              </button>
            </div>
          </div>

          {/* OpenWA Status */}
          {useOpenWA && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '10px',
              background: waStatus === 'connected' ? '#dcfce7' : 
                         waStatus === 'disconnected' ? '#fef3c7' : 
                         waStatus === 'error' ? '#fee2e2' : '#f3f4f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {waStatus === 'checking' && <Loader2 style={{ width: '16px', height: '16px', color: '#6b7280', animation: 'spin 1s linear infinite' }} />}
                {waStatus === 'connected' && <Wifi style={{ width: '16px', height: '16px', color: '#16a34a' }} />}
                {waStatus === 'disconnected' && <WifiOff style={{ width: '16px', height: '16px', color: '#d97706' }} />}
                {waStatus === 'error' && <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />}
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: waStatus === 'connected' ? '#166534' : 
                         waStatus === 'disconnected' ? '#92400e' : 
                         waStatus === 'error' ? '#991b1b' : '#374151'
                }}>
                  {waStatus === 'checking' && 'Mengecek koneksi...'}
                  {waStatus === 'connected' && 'WhatsApp Terhubung'}
                  {waStatus === 'disconnected' && 'Perlu scan QR Code'}
                  {waStatus === 'error' && 'Server tidak aktif'}
                </span>
              </div>
              {(waStatus === 'disconnected' || waStatus === 'error') && (
                <button
                  onClick={openQRPage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#25D366',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <QrCode style={{ width: '12px', height: '12px' }} />
                  Scan QR
                </button>
              )}
            </div>
          )}

          {!useOpenWA && (
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
              Mode wa.me akan membuka tab browser untuk setiap nomor
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            borderRadius: '14px',
            padding: '14px',
            color: 'white',
            textAlign: 'center'
          }}>
            <MessageCircle style={{ width: '24px', height: '24px', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>{waNotifications.length}</p>
            <p style={{ fontSize: '10px', opacity: 0.9, margin: '2px 0 0 0' }}>Total WA</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <Send style={{ width: '24px', height: '24px', color: '#2563eb', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
              {todayNotifications.length}
            </p>
            <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0 0' }}>Hari Ini</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <Users style={{ width: '24px', height: '24px', color: '#16a34a', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
              {nasabahUsers.length}
            </p>
            <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0 0' }}>Aktif</p>
          </div>
        </div>

        {/* Message Composer */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Kirim Pesan
          </h3>

          {/* Message Type */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Jenis Pesan</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { value: 'reminder', label: 'Reminder', icon: Clock },
                { value: 'promo', label: 'Promo', icon: Bell },
                { value: 'info', label: 'Info', icon: MessageCircle },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setMessageType(type.value as any)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: messageType === type.value ? '2px solid #25D366' : '2px solid #e5e7eb',
                      background: messageType === type.value ? '#dcfce7' : 'white',
                      color: messageType === type.value ? '#166534' : '#6b7280',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Icon style={{ width: '14px', height: '14px' }} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Preview */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '12px'
          }}>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
              Template: <span style={{ color: '#6b7280' }}>(gunakan {'{name}'} untuk nama)</span>
            </p>
            <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>{getMessageTemplate()}</p>
          </div>

          {/* Custom Message */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
              Custom Pesan <span style={{ color: '#9ca3af' }}>(opsional, gunakan {'{name}'} untuk nama)</span>
            </p>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Tulis pesan custom..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Selected Count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: selectedUsers.length > 0 ? '#dcfce7' : '#f9fafb',
            borderRadius: '10px',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '13px', color: selectedUsers.length > 0 ? '#166534' : '#6b7280' }}>
              {selectedUsers.length > 0 
                ? `${selectedUsers.length} nasabah dipilih`
                : 'Pilih nasabah di bawah'
              }
            </span>
            <button
              onClick={selectAll}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: '#e5e7eb',
                color: '#374151',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {selectedUsers.length === filteredUsers.length ? 'Batal Semua' : 'Pilih Semua'}
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={sendNotifications}
            disabled={selectedUsers.length === 0 || isSending}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: selectedUsers.length > 0 && !isSending
                ? 'linear-gradient(135deg, #25D366, #128C7E)' 
                : '#e5e7eb',
              color: selectedUsers.length > 0 && !isSending ? 'white' : '#9ca3af',
              fontSize: '15px',
              fontWeight: '700',
              cursor: selectedUsers.length > 0 && !isSending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSending ? (
              <>
                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                Mengirim...
              </>
            ) : (
              <>
                {useOpenWA && waStatus === 'connected' ? (
                  <Send style={{ width: '18px', height: '18px' }} />
                ) : (
                  <ExternalLink style={{ width: '18px', height: '18px' }} />
                )}
                {useOpenWA && waStatus === 'connected' 
                  ? `Kirim ke ${selectedUsers.length} Nasabah`
                  : `Buka WhatsApp (${selectedUsers.length})`
                }
              </>
            )}
          </button>
        </div>

        {/* User Selection */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Pilih Penerima
          </h3>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Cari nama atau telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 36px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* User List */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: index < filteredUsers.length - 1 ? '6px' : '0',
                  background: selectedUsers.includes(user.id) ? '#dcfce7' : '#f9fafb',
                  transition: 'all 0.2s',
                  border: selectedUsers.includes(user.id) ? '2px solid #25D366' : '2px solid transparent'
                }}
              >
                <div 
                  onClick={() => toggleUserSelection(user.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: selectedUsers.includes(user.id) ? 'none' : '2px solid #d1d5db',
                    background: selectedUsers.includes(user.id) ? '#25D366' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {selectedUsers.includes(user.id) && (
                      <CheckCircle style={{ width: '14px', height: '14px', color: 'white' }} />
                    )}
                  </div>
                  <img
                    src={user.photo}
                    alt={user.name}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '13px' }}>
                      {user.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone style={{ width: '10px', height: '10px', color: '#9ca3af' }} />
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{user.phone}</span>
                    </div>
                  </div>
                </div>
                {/* Quick Send Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sendToUser(user);
                  }}
                  disabled={isSending}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSending ? '#d1d5db' : 'linear-gradient(135deg, #25D366, #128C7E)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: isSending ? 'none' : '0 2px 6px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <MessageCircle style={{ width: '12px', height: '12px' }} />
                  Kirim
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sent */}
        {waNotifications.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginTop: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
              Riwayat Kirim
            </h3>
            {waNotifications.slice(0, 5).map((notif, index) => {
              const user = users.find(u => u.id === notif.userId);
              return (
                <div key={notif.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 0',
                  borderBottom: index < Math.min(waNotifications.length, 5) - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle style={{ width: '16px', height: '16px', color: '#25D366' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', margin: 0 }}>
                      {user?.name || 'User'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {notif.title}
                    </p>
                  </div>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>{notif.createdAt}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Snackbar {...snackbar} onClose={closeSnackbar} />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
