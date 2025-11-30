import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  Clock,
  Activity,
  UserCheck,
  Bell,
  ChevronRight,
  ArrowUpRight,
  ShoppingBag,
  XCircle
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

interface DashboardAdminPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardAdminPage({ onNavigate }: DashboardAdminPageProps) {
  // Subscribe to Zustand state for reactivity
  const users = useStore(state => state.users);
  const transactions = useStore(state => state.transactions);
  const loans = useStore(state => state.loans);
  const notifications = useStore(state => state.notifications);

  // Calculate stats from state (reactive)
  const nasabahUsers = users.filter(u => u.role === 'nasabah');
  const totalMembers = nasabahUsers.length;
  const activeMembers = nasabahUsers.filter(u => u.accountStatus === 'active').length;
  const pendingMembers = nasabahUsers.filter(u => u.accountStatus === 'pending').length;
  const suspendedMembers = nasabahUsers.filter(u => u.accountStatus === 'suspended').length;

  // Calculate total savings (approved transactions only)
  const approvedDeposits = transactions
    .filter(t => t.type === 'simpanan' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const approvedWithdrawals = transactions
    .filter(t => t.type === 'penarikan' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSavings = approvedDeposits - approvedWithdrawals;

  // Calculate total loans
  const approvedLoans = loans.filter(l => l.status === 'approved');
  const totalLoans = approvedLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

  // Pending items
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const pendingLoansCount = loans.filter(l => l.status === 'pending').length;
  const totalPendingCount = pendingTransactions.length + pendingLoansCount + pendingMembers;

  // Recent activities (all transactions sorted by date)
  const recentActivities = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Growth data for chart (mock monthly data based on transactions)
  const months = ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const growthData = months.map((month, index) => {
    const baseDeposit = approvedDeposits / 6;
    const variation = (Math.random() - 0.5) * baseDeposit * 0.3;
    return {
      month,
      simpanan: Math.round(baseDeposit + variation + (index * baseDeposit * 0.1)),
      pinjaman: Math.round(totalLoans / 6 * (1 + index * 0.05)),
    };
  });

  const statsCards = [
    {
      title: 'Total Nasabah',
      value: totalMembers.toString(),
      subtitle: `${activeMembers} aktif`,
      icon: Users,
      color: '#198754',
      bgColor: '#dcfce7',
    },
    {
      title: 'Total Simpanan',
      value: `Rp ${(totalSavings / 1000000).toFixed(1)}jt`,
      subtitle: `${transactions.filter(t => t.type === 'simpanan').length} transaksi`,
      icon: DollarSign,
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      title: 'Total Cicilan',
      value: `Rp ${(totalLoans / 1000000).toFixed(1)}jt`,
      subtitle: `${approvedLoans.length} aktif`,
      icon: ShoppingBag,
      color: '#7c3aed',
      bgColor: '#ede9fe',
    },
    {
      title: 'Pending',
      value: totalPendingCount.toString(),
      subtitle: 'Butuh approval',
      icon: Clock,
      color: '#d97706',
      bgColor: '#fef3c7',
    },
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>
          Dashboard Admin
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Kelola koperasi Anda
        </p>
      </div>

      {/* Alert Pending */}
      {totalPendingCount > 0 && (
        <div 
          onClick={() => onNavigate('admin-approval')}
          style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '2px solid #fcd34d',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: '#f59e0b',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle style={{ width: '22px', height: '22px', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontWeight: '700', color: '#92400e', margin: '0 0 2px 0', fontSize: '15px' }}>
                {totalPendingCount} Item Menunggu Approval
              </p>
              <p style={{ fontSize: '12px', color: '#a16207', margin: 0 }}>
                {pendingTransactions.length} transaksi • {pendingLoansCount} pengajuan • {pendingMembers} member
              </p>
            </div>
          </div>
          <ChevronRight style={{ width: '20px', height: '20px', color: '#92400e' }} />
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px', 
        marginBottom: '16px' 
      }}>
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: card.bgColor,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: card.color }} />
                </div>
              </div>
              <p style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>
                {card.value}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{card.title}</p>
              <p style={{ fontSize: '11px', color: card.color, margin: '4px 0 0 0', fontWeight: '500' }}>
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 2px 0' }}>
              Pertumbuhan
            </h3>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>6 bulan terakhir</p>
          </div>
        </div>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorSimpananAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198754" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#198754" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPinjamanAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(v) => `${(v/1000000).toFixed(0)}jt`} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
              />
              <Area type="monotone" dataKey="simpanan" stroke="#198754" strokeWidth={2} fillOpacity={1} fill="url(#colorSimpananAdmin)" name="Simpanan" />
              <Area type="monotone" dataKey="pinjaman" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorPinjamanAdmin)" name="Cicilan" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Approvals */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Menunggu Approval
          </h3>
          <button
            onClick={() => onNavigate('admin-approval')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#198754',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Lihat Semua
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {pendingTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
            <CheckCircle style={{ width: '32px', height: '32px', marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '13px', margin: 0 }}>Tidak ada pending</p>
          </div>
        ) : (
          <div>
            {pendingTransactions.slice(0, 4).map((t, index) => (
              <div key={t.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: index < Math.min(pendingTransactions.length, 4) - 1 ? '1px solid #f3f4f6' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: t.type === 'simpanan' ? '#dcfce7' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {t.type === 'simpanan' ? (
                      <DollarSign style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                    ) : (
                      <TrendingUp style={{ width: '18px', height: '18px', color: '#dc2626', transform: 'rotate(180deg)' }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: '500', color: '#111827', margin: 0, fontSize: '13px' }}>
                      {t.userName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                      {t.type === 'simpanan' ? 'Setoran' : 'Penarikan'} • {t.date}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    fontWeight: '600', 
                    color: t.type === 'simpanan' ? '#16a34a' : '#dc2626', 
                    margin: 0, 
                    fontSize: '14px' 
                  }}>
                    {t.type === 'simpanan' ? '+' : '-'}Rp {(t.amount/1000).toFixed(0)}rb
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Aktivitas Terbaru
          </h3>
          <button
            onClick={() => onNavigate('admin-transaksi')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#198754',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Semua
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div>
          {recentActivities.map((activity, index) => (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 0',
              borderBottom: index < recentActivities.length - 1 ? '1px solid #f3f4f6' : 'none'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: activity.status === 'approved' ? '#dcfce7' : activity.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {activity.status === 'approved' && <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} />}
                {activity.status === 'pending' && <Clock style={{ width: '16px', height: '16px', color: '#d97706' }} />}
                {activity.status === 'rejected' && <XCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', color: '#111827', margin: 0, fontWeight: '500' }}>
                  {activity.userName} - {activity.type === 'simpanan' ? 'Setor' : activity.type === 'penarikan' ? 'Tarik' : 'Cicilan'}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                  {activity.date}
                </p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                Rp {(activity.amount/1000).toFixed(0)}rb
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
          Aksi Cepat
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            { icon: UserCheck, label: 'Kelola Nasabah', path: 'admin-nasabah', color: '#198754', bgColor: '#dcfce7' },
            { icon: CheckCircle, label: 'Approval', path: 'admin-approval', color: '#2563eb', bgColor: '#dbeafe' },
            { icon: Activity, label: 'Transaksi', path: 'admin-transaksi', color: '#7c3aed', bgColor: '#ede9fe' },
            { icon: Bell, label: 'Notifikasi WA', path: 'admin-wa', color: '#d97706', bgColor: '#fef3c7' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  background: item.bgColor,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  width: '100%'
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
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
