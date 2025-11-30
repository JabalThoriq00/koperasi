import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardNasabahPage } from './pages/DashboardNasabahPage';
import { DashboardAdminPage } from './pages/DashboardAdminPage';
import { SimpananPage } from './pages/SimpananPage';
import { PenarikanPage } from './pages/PenarikanPage';
import { PinjamanPage } from './pages/PinjamanPage';
import { RiwayatPage } from './pages/RiwayatPage';
import { NotifikasiPage } from './pages/NotifikasiPage';
import { ProfilPage } from './pages/ProfilPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { NasabahPage } from './pages/NasabahPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WANotifPage } from './pages/WANotifPage';
import { TransaksiPage } from './pages/TransaksiPage';
import { LaporanPage } from './pages/LaporanPage';

export default function App() {
  const { isAuthenticated, currentUser, darkMode } = useStore();
  const [currentPage, setCurrentPage] = useState('login');

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string) => {
    window.location.hash = page;
    setCurrentPage(page);
  };

  // Redirect to appropriate dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentPage === 'login' || currentPage === 'register') {
        if (currentUser.role === 'admin') {
          navigate('admin-dashboard');
        } else {
          navigate('dashboard');
        }
      }
    } else if (!isAuthenticated && currentPage !== 'register') {
      navigate('login');
    }
  }, [isAuthenticated, currentUser, currentPage]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Render pages based on authentication
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={navigate} />;
    }
    return <LoginPage onNavigate={navigate} />;
  }

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Render authenticated pages
  const renderPage = () => {
    switch (currentPage) {
      // Nasabah pages
      case 'dashboard':
        return <DashboardNasabahPage onNavigate={navigate} />;
      case 'simpanan':
        return <SimpananPage />;
      case 'penarikan':
        return <PenarikanPage />;
      case 'pinjaman':
        return <PinjamanPage />;
      case 'riwayat':
        return <RiwayatPage />;
      case 'notifikasi':
        return <NotifikasiPage />;
      case 'profil':
        return <ProfilPage onNavigate={navigate} />;

      // Admin pages
      case 'admin-dashboard':
        return isAdmin ? <DashboardAdminPage onNavigate={navigate} /> : <NotFoundPage onNavigate={navigate} />;
      case 'admin-nasabah':
        return isAdmin ? <NasabahPage /> : <NotFoundPage onNavigate={navigate} />;
      case 'admin-approval':
        return isAdmin ? <ApprovalPage /> : <NotFoundPage onNavigate={navigate} />;
      case 'admin-wa':
        return isAdmin ? <WANotifPage /> : <NotFoundPage onNavigate={navigate} />;
      case 'admin-laporan':
        return isAdmin ? <LaporanPage /> : <NotFoundPage onNavigate={navigate} />;
      case 'admin-transaksi':
        return isAdmin ? <TransaksiPage /> : <NotFoundPage onNavigate={navigate} />;

      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}
