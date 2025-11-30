import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  CheckCheck,
  MessageCircle
} from 'lucide-react';

export function NotifikasiPage() {
  const { 
    currentUser, 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    getUnreadCount 
  } = useStore();

  if (!currentUser) return null;

  const notifications = getUserNotifications(currentUser.id);
  const unreadCount = getUnreadCount(currentUser.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle style={{ width: '18px', height: '18px', color: '#16a34a' }} />;
      case 'warning':
        return <AlertTriangle style={{ width: '18px', height: '18px', color: '#d97706' }} />;
      case 'error':
        return <XCircle style={{ width: '18px', height: '18px', color: '#dc2626' }} />;
      default:
        return <Info style={{ width: '18px', height: '18px', color: '#2563eb' }} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'success': return '#dcfce7';
      case 'warning': return '#fef3c7';
      case 'error': return '#fee2e2';
      default: return '#dbeafe';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Baru saja';
    else if (hours < 24) return `${hours}j lalu`;
    else if (days < 7) return `${days}h lalu`;
    else return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
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
            Notifikasi
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsAsRead(currentUser.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'white',
              color: '#198754',
              border: '2px solid #198754',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <CheckCheck style={{ width: '14px', height: '14px' }} />
            <span style={{ display: 'none' }}>Tandai</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <Bell style={{ width: '28px', height: '28px', color: '#9ca3af' }} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
              Tidak ada notifikasi
            </h3>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px' }}>
              Notifikasi akan muncul di sini
            </p>
          </div>
        ) : (
          notifications.map((notif, index) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && markNotificationAsRead(notif.id)}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '14px 16px',
                borderBottom: index < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: notif.read ? 'white' : '#f0fdf4',
                cursor: notif.read ? 'default' : 'pointer'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: getIconBg(notif.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(notif.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  fontSize: '13px', 
                  fontWeight: notif.read ? '400' : '600', 
                  color: '#111827', 
                  margin: '0 0 6px 0',
                  lineHeight: '1.4'
                }}>
                  {notif.message}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {formatDate(notif.createdAt)}
                  </span>
                  {notif.whatsappSent && (
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '3px', 
                      fontSize: '10px', 
                      color: '#16a34a',
                      background: '#dcfce7',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      <MessageCircle style={{ width: '10px', height: '10px' }} />
                      WA
                    </span>
                  )}
                </div>
              </div>

              {/* Unread indicator */}
              {!notif.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#198754',
                  flexShrink: 0,
                  alignSelf: 'center'
                }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
