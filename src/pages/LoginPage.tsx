import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import { useStore } from '../store/useStore';
import { Mail, Lock, Eye, EyeOff, Leaf, Users, TrendingUp } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showSnackbar('Harap isi semua field', 'error');
      return;
    }

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, password);
    
    if (success) {
      showSnackbar('Login berhasil! Mengalihkan...', 'success');
      setTimeout(() => {
        const user = useStore.getState().currentUser;
        if (user?.role === 'admin') {
          onNavigate('admin-dashboard');
        } else {
          onNavigate('dashboard');
        }
      }, 300);
    } else {
      showSnackbar('Email tidak ditemukan. Gunakan email demo di bawah.', 'error');
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (type: 'nasabah' | 'admin') => {
    if (type === 'nasabah') {
      setEmail('budi@example.com');
      setPassword('password');
    } else {
      setEmail('admin@koperasi.com');
      setPassword('password');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f5132 0%, #198754 50%, #20c997 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        right: '-150px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '1000px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left side - Branding (hidden on mobile) */}
        <div style={{ 
          color: 'white', 
          padding: '20px',
          display: 'none',
          '@media (min-width: 768px)': { display: 'block' }
        }} className="branding-section">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <Leaf style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Koperasi Sejahtera</h1>
              <p style={{ opacity: 0.8, margin: 0, fontSize: '14px' }}>Tumbuh Bersama, Maju Bersama</p>
            </div>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
            Kelola Keuangan<br />dengan Mudah
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px', lineHeight: 1.6 }}>
            Platform koperasi digital yang memudahkan Anda mengelola simpanan, pinjaman, dan transaksi dengan aman dan transparan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: Users, text: '500+ Anggota Aktif' },
              { icon: TrendingUp, text: 'Pertumbuhan 25% per tahun' },
              { icon: Lock, text: 'Keamanan Terjamin' },
            ].map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255,255,255,0.1)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <item.icon style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '15px' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Form */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}>
          {/* Mobile logo */}
          <div className="mobile-logo" style={{
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #198754, #20c997)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Leaf style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f5132' }}>Koperasi Sejahtera</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' }}>
              Selamat Datang! 👋
            </h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#9ca3af'
                }} />
                <input
                  type="text"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    background: '#f9fafb'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#198754';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#f9fafb';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#9ca3af'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    background: '#f9fafb'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#198754';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#f9fafb';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? '#6b7280' : 'linear-gradient(135deg, #198754, #20c997)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(25, 135, 84, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                style={{
                  color: '#198754',
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Daftar Sekarang
              </button>
            </p>
          </div>

          {/* Demo accounts */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            borderRadius: '16px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#166534',
              marginBottom: '12px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🔑 Demo Account (klik untuk login otomatis)
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('nasabah')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  border: '2px solid #86efac',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#22c55e';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#86efac';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>👤</div>
                <div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>Nasabah</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>budi@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  border: '2px solid #86efac',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#22c55e';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#86efac';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>👨‍💼</div>
                <div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>Admin</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>admin@koperasi.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Snackbar {...snackbar} onClose={closeSnackbar} />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .branding-section {
          display: none !important;
        }
        .mobile-logo {
          display: flex !important;
        }
        @media (min-width: 768px) {
          .branding-section {
            display: block !important;
          }
          .mobile-logo {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
