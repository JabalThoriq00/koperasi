import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Home,
  DollarSign,
  TrendingDown,
  CreditCard,
  History,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  Users,
  CheckSquare,
  MessageCircle,
  Leaf,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentUser) return <>{children}</>;

  const isAdmin = currentUser.role === 'admin';
  const currentPath = window.location.hash.slice(1);

  const nasabahMenuItems = [
    { icon: Home, label: 'Dashboard', path: 'dashboard' },
    { icon: DollarSign, label: 'Simpanan', path: 'simpanan' },
    { icon: TrendingDown, label: 'Penarikan', path: 'penarikan' },
    { icon: CreditCard, label: 'Leasing', path: 'pinjaman' },
    { icon: History, label: 'Riwayat', path: 'riwayat' },
    { icon: Bell, label: 'Notifikasi', path: 'notifikasi' },
    { icon: User, label: 'Profil', path: 'profil' },
  ];

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: 'admin-dashboard' },
    { icon: Users, label: 'Nasabah', path: 'admin-nasabah' },
    { icon: CheckSquare, label: 'Approval', path: 'admin-approval' },
    { icon: MessageCircle, label: 'Notifikasi WA', path: 'admin-wa' },
    { icon: History, label: 'Transaksi', path: 'admin-transaksi' },
    { icon: User, label: 'Profil', path: 'profil' },
  ];

  const menuItems = isAdmin ? adminMenuItems : nasabahMenuItems;

  const handleLogout = () => {
    logout();
    window.location.hash = 'login';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex' }}>
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <aside style={{
          width: '280px',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Logo */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #198754, #20c997)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Leaf style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f5132', margin: 0 }}>Koperasi</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Sejahtera Bersama</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              borderRadius: '16px',
              border: '1px solid #bbf7d0'
            }}>
              <img
                src={currentUser.photo}
                alt={currentUser.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '2px solid #22c55e'
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  fontWeight: '600', 
                  color: '#166534', 
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>{currentUser.name}</p>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#15803d', 
                  margin: 0,
                  textTransform: 'capitalize'
                }}>{currentUser.role}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav style={{ padding: '0 16px', flex: 1 }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={`#${item.path}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    marginBottom: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive ? 'linear-gradient(135deg, #198754, #20c997)' : 'transparent',
                    color: isActive ? 'white' : '#4b5563',
                    fontWeight: isActive ? '600' : '500',
                    boxShadow: isActive ? '0 4px 12px rgba(25, 135, 84, 0.3)' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.color = '#166534';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  <Icon style={{ width: '22px', height: '22px' }} />
                  <span style={{ fontSize: '15px' }}>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '20px' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                borderRadius: '14px',
                width: '100%',
                border: '2px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '15px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.borderColor = '#f87171';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              <LogOut style={{ width: '22px', height: '22px' }} />
              <span>Keluar</span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '10px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            {sidebarOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Leaf style={{ width: '24px', height: '24px', color: '#198754' }} />
            <span style={{ fontWeight: '700', color: '#0f5132' }}>Koperasi</span>
          </div>
          <img
            src={currentUser.photo}
            alt={currentUser.name}
            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 45
            }}
          />
          <aside style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '280px',
            background: 'white',
            zIndex: 50,
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.3s ease'
          }}>
            {/* Same content as desktop sidebar */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'linear-gradient(135deg, #198754, #20c997)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Leaf style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                  <span style={{ fontWeight: '700', color: '#0f5132', fontSize: '18px' }}>Koperasi</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{ padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                background: '#f0fdf4',
                borderRadius: '14px'
              }}>
                <img
                  src={currentUser.photo}
                  alt={currentUser.name}
                  style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div>
                  <p style={{ fontWeight: '600', color: '#166534', margin: 0 }}>{currentUser.name}</p>
                  <p style={{ fontSize: '13px', color: '#15803d', margin: 0, textTransform: 'capitalize' }}>{currentUser.role}</p>
                </div>
              </div>
            </div>

            <nav style={{ padding: '0 16px', flex: 1 }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <a
                    key={item.path}
                    href={`#${item.path}`}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      marginBottom: '4px',
                      textDecoration: 'none',
                      background: isActive ? 'linear-gradient(135deg, #198754, #20c997)' : 'transparent',
                      color: isActive ? 'white' : '#4b5563',
                      fontWeight: isActive ? '600' : '500'
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px' }} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            <div style={{ padding: '16px' }}>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  width: '100%',
                  border: '2px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <LogOut style={{ width: '20px', height: '20px' }} />
                <span>Keluar</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main style={{
        marginLeft: isMobile ? 0 : '280px',
        paddingTop: isMobile ? '70px' : 0,
        paddingBottom: isMobile ? '80px' : 0,
        flex: 1,
        minHeight: '100vh'
      }}>
        <div style={{ padding: isMobile ? '16px' : '32px' }}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '8px 4px',
          display: 'flex',
          justifyContent: 'space-around',
          zIndex: 30,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}>
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={`#${item.path}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  background: isActive ? '#f0fdf4' : 'transparent',
                  color: isActive ? '#198754' : '#6b7280'
                }}
              >
                <Icon style={{ width: '22px', height: '22px' }} />
                <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
