import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Wallet, 
  CreditCard, 
  Clock, 
  DollarSign, 
  ArrowDownLeft,
  TrendingUp,
  ChevronRight,
  Bell,
  AlertTriangle,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Gift,
  PieChart
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardNasabahPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardNasabahPage({ onNavigate }: DashboardNasabahPageProps) {
  // Get all data from Zustand store - this will re-render when any of these change
  const currentUser = useStore(state => state.currentUser);
  const transactions = useStore(state => state.transactions);
  const loans = useStore(state => state.loans);
  const notifications = useStore(state => state.notifications);
  const shuRecords = useStore(state => state.shuRecords);
  
  // Use store functions
  const getUserBalance = useStore(state => state.getUserBalance);
  const getUserSavingsDetail = useStore(state => state.getUserSavingsDetail);
  const getUserActiveLoan = useStore(state => state.getUserActiveLoan);
  const getUserTransactions = useStore(state => state.getUserTransactions);
  const getMonthlyData = useStore(state => state.getMonthlyData);
  const getUnreadCount = useStore(state => state.getUnreadCount);
  const getSHUByUser = useStore(state => state.getSHUByUser);

  if (!currentUser) return null;

  // Calculate values - these will update when transactions/loans change
  const balance = getUserBalance(currentUser.id);
  const savingsDetail = getUserSavingsDetail(currentUser.id);
  const activeLoan = getUserActiveLoan(currentUser.id);
  const userTransactions = getUserTransactions(currentUser.id);
  const recentTransactions = userTransactions.slice(0, 5);
  const monthlyData = getMonthlyData(currentUser.id);
  const unreadNotifications = getUnreadCount(currentUser.id);

  // Calculate pending amounts
  const pendingDeposits = userTransactions
    .filter(t => t.type === 'simpanan' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const pendingWithdrawals = userTransactions
    .filter(t => t.type === 'penarikan' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const nextInstallment = activeLoan?.installments.find(i => i.status !== 'paid');
  const isOverdue = nextInstallment && new Date(nextInstallment.dueDate) < new Date();
  const paidCount = activeLoan?.installments.filter(i => i.status === 'paid').length || 0;

  // Get SHU for current year
  const currentYear = new Date().getFullYear();
  const userSHU = getSHUByUser(currentUser.id, currentYear);
  const lastYearSHU = getSHUByUser(currentUser.id, currentYear - 1);

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header - Mobile First */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Selamat datang, {currentUser.name.split(' ')[0]}!
        </p>
      </div>

      {/* Pending Alert */}
      {(pendingDeposits > 0 || pendingWithdrawals > 0) && (
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
            <Clock style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#92400e', fontSize: '13px', fontWeight: '600' }}>
              Transaksi Pending
            </p>
            <p style={{ margin: '2px 0 0 0', color: '#a16207', fontSize: '12px' }}>
              {pendingDeposits > 0 && `Setoran: Rp ${pendingDeposits.toLocaleString('id-ID')}`}
              {pendingDeposits > 0 && pendingWithdrawals > 0 && ' • '}
              {pendingWithdrawals > 0 && `Penarikan: Rp ${pendingWithdrawals.toLocaleString('id-ID')}`}
            </p>
          </div>
        </div>
      )}

      {/* Main Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f5132 0%, #198754 50%, #20c997 100%)',
        borderRadius: '20px',
        padding: 'clamp(20px, 4vw, 32px)',
        marginBottom: '16px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Wallet style={{ width: '20px', height: '20px', opacity: 0.9 }} />
            <span style={{ fontSize: '13px', opacity: 0.9 }}>Total Simpanan</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 7vw, 42px)', fontWeight: '800', margin: '0 0 16px 0' }}>
            Rp {balance.toLocaleString('id-ID')}
          </h1>

          {/* Savings breakdown - Responsive grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
            gap: '12px' 
          }}>
            {[
              { label: 'Pokok', value: savingsDetail.pokok },
              { label: 'Wajib', value: savingsDetail.wajib },
              { label: 'Sukarela', value: savingsDetail.sukarela },
            ].map((item, i) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.15)', 
                borderRadius: '10px', 
                padding: '10px' 
              }}>
                <p style={{ fontSize: '11px', opacity: 0.8, margin: '0 0 2px 0' }}>{item.label}</p>
                <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '600', margin: 0 }}>
                  Rp {item.value.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loan & Installment Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Active Loan/Leasing */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Cicilan Aktif</p>
            <div style={{
              width: '36px',
              height: '36px',
              background: activeLoan ? '#ede9fe' : '#f3f4f6',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag style={{ width: '18px', height: '18px', color: activeLoan ? '#7c3aed' : '#9ca3af' }} />
            </div>
          </div>
          <p style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            {activeLoan ? `Rp ${(activeLoan.remainingAmount / 1000000).toFixed(1)}jt` : '-'}
          </p>
          {activeLoan && (
            <p style={{ fontSize: '11px', color: '#7c3aed', margin: 0 }}>
              {paidCount}/{activeLoan.tenure} terbayar
            </p>
          )}
        </div>

        {/* Next Installment */}
        <div style={{
          background: isOverdue ? '#fef2f2' : 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          border: isOverdue ? '2px solid #fca5a5' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Angsuran</p>
            <div style={{
              width: '36px',
              height: '36px',
              background: isOverdue ? '#fee2e2' : '#fef3c7',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock style={{ width: '18px', height: '18px', color: isOverdue ? '#dc2626' : '#d97706' }} />
            </div>
          </div>
          <p style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            {nextInstallment ? `Rp ${(nextInstallment.amount / 1000).toFixed(0)}rb` : '-'}
          </p>
          {nextInstallment && (
            <p style={{ fontSize: '11px', color: isOverdue ? '#dc2626' : '#d97706', margin: 0, fontWeight: '500' }}>
              {isOverdue ? '⚠️ Jatuh tempo!' : `Due: ${new Date(nextInstallment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
            </p>
          )}
        </div>
      </div>

      {/* SHU Card */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
        borderRadius: '16px',
        padding: '16px',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '13px', opacity: 0.9 }}>Sisa Hasil Usaha (SHU)</span>
            </div>
            {userSHU && (
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '600',
                background: userSHU.status === 'distributed' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)'
              }}>
                {userSHU.status === 'distributed' ? '✓ Dibagikan' : '⏳ Dihitung'}
              </span>
            )}
          </div>

          <p style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: '800', margin: '0 0 12px 0' }}>
            Rp {(userSHU?.totalSHU || 0).toLocaleString('id-ID')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', opacity: 0.8, margin: '0 0 2px 0' }}>Kontribusi</p>
              <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>
                {userSHU?.kontribusiSimpanan?.toFixed(1) || 0}%
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', opacity: 0.8, margin: '0 0 2px 0' }}>Transaksi</p>
              <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>
                {userSHU?.totalTransaksi || 0}x
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', opacity: 0.8, margin: '0 0 2px 0' }}>Tahun</p>
              <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>{currentYear}</p>
            </div>
          </div>

          {!userSHU && (
            <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px', marginBottom: 0 }}>
              SHU akan dihitung di akhir tahun berdasarkan kontribusi Anda
            </p>
          )}

          {lastYearSHU && (
            <div style={{ 
              marginTop: '10px', 
              paddingTop: '10px', 
              borderTop: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>SHU {currentYear - 1}</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                Rp {lastYearSHU.totalSHU.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Mobile optimized */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
          Aksi Cepat
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { icon: DollarSign, label: 'Setor', path: 'simpanan', color: '#16a34a', bgColor: '#dcfce7' },
            { icon: ArrowDownLeft, label: 'Tarik', path: 'penarikan', color: '#dc2626', bgColor: '#fee2e2' },
            { icon: ShoppingBag, label: 'Leasing', path: 'pinjaman', color: '#7c3aed', bgColor: '#ede9fe' },
            { icon: TrendingUp, label: 'Riwayat', path: 'riwayat', color: '#2563eb', bgColor: '#dbeafe' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onNavigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  background: item.bgColor,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'white',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon style={{ width: '18px', height: '18px', color: item.color }} />
                </div>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '11px' }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart - Responsive height */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
          Perkembangan Simpanan
        </h3>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px 0' }}>6 bulan terakhir</p>
        <div style={{ height: '160px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorSimpananNasabah" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198754" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#198754" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
              />
              <Area type="monotone" dataKey="simpanan" stroke="#198754" strokeWidth={2} fillOpacity={1} fill="url(#colorSimpananNasabah)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Transaksi Terakhir
          </h3>
          <button
            onClick={() => onNavigate('riwayat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: 'none',
              border: 'none',
              color: '#198754',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: 0
            }}
          >
            Semua
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9ca3af' }}>
            <p style={{ fontSize: '14px' }}>Belum ada transaksi</p>
          </div>
        ) : (
          <div>
            {recentTransactions.map((t, index) => (
              <div key={t.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: index < recentTransactions.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: t.type === 'simpanan' ? '#dcfce7' : t.type === 'penarikan' ? '#fee2e2' : '#ede9fe'
                  }}>
                    {t.type === 'simpanan' && <DollarSign style={{ width: '18px', height: '18px', color: '#16a34a' }} />}
                    {t.type === 'penarikan' && <ArrowDownLeft style={{ width: '18px', height: '18px', color: '#dc2626' }} />}
                    {t.type === 'angsuran' && <ShoppingBag style={{ width: '18px', height: '18px', color: '#7c3aed' }} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 2px 0', fontSize: '14px' }}>
                      {t.type === 'simpanan' ? (t.savingsType || 'Sukarela') : t.type === 'penarikan' ? 'Penarikan' : 'Cicilan'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{t.date}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: t.type === 'penarikan' || t.type === 'angsuran' ? '#dc2626' : '#16a34a',
                    margin: '0 0 2px 0'
                  }}>
                    {t.type === 'penarikan' || t.type === 'angsuran' ? '-' : '+'}Rp {(t.amount/1000).toFixed(0)}rb
                  </p>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '500',
                    background: t.status === 'approved' ? '#dcfce7' : t.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                    color: t.status === 'approved' ? '#166534' : t.status === 'rejected' ? '#991b1b' : '#92400e'
                  }}>
                    {t.status === 'approved' && <CheckCircle style={{ width: '10px', height: '10px' }} />}
                    {t.status === 'pending' && <Clock style={{ width: '10px', height: '10px' }} />}
                    {t.status === 'rejected' && <XCircle style={{ width: '10px', height: '10px' }} />}
                    {t.status === 'approved' ? 'OK' : t.status === 'rejected' ? '✗' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating notification button */}
      {unreadNotifications > 0 && (
        <button
          onClick={() => onNavigate('notifikasi')}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #198754, #20c997)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            boxShadow: '0 4px 20px rgba(25, 135, 84, 0.4)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            zIndex: 50
          }}
        >
          <Bell style={{ width: '18px', height: '18px' }} />
          {unreadNotifications}
        </button>
      )}
    </div>
  );
}
