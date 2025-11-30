import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Download,
  FileSpreadsheet,
  Users,
  DollarSign,
  Calculator,
  TrendingUp,
  Settings,
  CheckCircle,
  Clock,
  RefreshCw,
  Wallet,
  ShoppingBag,
  PieChart,
  BarChart3,
  Eye
} from 'lucide-react';

export function LaporanPage() {
  // Subscribe to Zustand state
  const users = useStore(state => state.users);
  const transactions = useStore(state => state.transactions);
  const loans = useStore(state => state.loans);
  const shuConfig = useStore(state => state.shuConfig);
  const shuRecords = useStore(state => state.shuRecords);
  const setSHUConfig = useStore(state => state.setSHUConfig);
  const calculateSHU = useStore(state => state.calculateSHU);
  const distributeSHU = useStore(state => state.distributeSHU);
  const getNasabahReport = useStore(state => state.getNasabahReport);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showSHUConfigModal, setShowSHUConfigModal] = useState(false);
  const [showSHUDetailModal, setShowSHUDetailModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [configForm, setConfigForm] = useState(shuConfig);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // Get nasabah data
  const nasabahUsers = users.filter(u => u.role === 'nasabah');
  const nasabahReport = getNasabahReport();
  const currentYearSHU = shuRecords.filter(s => s.year === selectedYear);

  // Calculate totals
  const totalSimpanan = nasabahReport.reduce((sum, n) => sum + n.saldoSimpanan, 0);
  const totalPokok = nasabahReport.reduce((sum, n) => sum + n.simpananPokok, 0);
  const totalWajib = nasabahReport.reduce((sum, n) => sum + n.simpananWajib, 0);
  const totalSukarela = nasabahReport.reduce((sum, n) => sum + n.simpananSukarela, 0);
  const totalSHU = currentYearSHU.reduce((sum, s) => sum + s.totalSHU, 0);

  // Years for dropdown
  const years = [2024, 2023, 2022];

  // Update config form when year changes
  useEffect(() => {
    setConfigForm({ ...shuConfig, year: selectedYear });
  }, [selectedYear, shuConfig]);

  // Export to Excel
  const exportToExcel = (type: 'nasabah' | 'simpanan' | 'shu' | 'all') => {
    const wb = XLSX.utils.book_new();

    if (type === 'nasabah' || type === 'all') {
      const nasabahData = nasabahReport.map(n => ({
        'No': nasabahReport.indexOf(n) + 1,
        'Nama': n.name,
        'Email': n.email,
        'Telepon': n.phone,
        'Alamat': n.address,
        'Member Sejak': n.memberSince,
        'Status': n.status === 'active' ? 'Aktif' : n.status === 'pending' ? 'Pending' : 'Ditangguhkan',
        'Simpanan Pokok': n.simpananPokok,
        'Simpanan Wajib': n.simpananWajib,
        'Simpanan Sukarela': n.simpananSukarela,
        'Total Simpanan': n.totalSimpanan,
        'Total Penarikan': n.totalPenarikan,
        'Saldo': n.saldoSimpanan,
        'Total Cicilan': n.totalCicilan,
        'Sisa Cicilan': n.sisaCicilan,
        'Jumlah Transaksi': n.jumlahTransaksi,
        'SHU Tahun Ini': n.shuTahunIni
      }));
      const ws = XLSX.utils.json_to_sheet(nasabahData);
      XLSX.utils.book_append_sheet(wb, ws, 'Data Nasabah');
    }

    if (type === 'simpanan' || type === 'all') {
      const simpananData = transactions
        .filter(t => t.type === 'simpanan' && t.status === 'approved')
        .map((t, i) => ({
          'No': i + 1,
          'No Transaksi': t.transactionNumber || '-',
          'Tanggal': t.date,
          'Nama': t.userName,
          'Jenis Simpanan': t.savingsType === 'pokok' ? 'Pokok' : t.savingsType === 'wajib' ? 'Wajib' : 'Sukarela',
          'Jumlah': t.amount,
          'Status': 'Disetujui',
          'Catatan': t.notes || '-'
        }));
      const ws = XLSX.utils.json_to_sheet(simpananData);
      XLSX.utils.book_append_sheet(wb, ws, 'Simpanan');

      const penarikanData = transactions
        .filter(t => t.type === 'penarikan' && t.status === 'approved')
        .map((t, i) => ({
          'No': i + 1,
          'No Transaksi': t.transactionNumber || '-',
          'Tanggal': t.date,
          'Nama': t.userName,
          'Jumlah': t.amount,
          'Status': 'Disetujui',
          'Catatan': t.notes || '-'
        }));
      const ws2 = XLSX.utils.json_to_sheet(penarikanData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Penarikan');
    }

    if (type === 'shu' || type === 'all') {
      const shuData = currentYearSHU.map((s, i) => ({
        'No': i + 1,
        'Nama': s.userName,
        'Tahun': s.year,
        'Simpanan Pokok': s.simpananPokok,
        'Simpanan Wajib': s.simpananWajib,
        'Simpanan Sukarela': s.simpananSukarela,
        'Total Simpanan': s.totalSimpanan,
        'Jumlah Transaksi': s.totalTransaksi,
        'Kontribusi Simpanan (%)': s.kontribusiSimpanan,
        'Kontribusi Transaksi (%)': s.kontribusiTransaksi,
        'SHU Simpanan': s.shuSimpanan,
        'SHU Transaksi': s.shuTransaksi,
        'SHU Dana': s.shuDana,
        'Total SHU': s.totalSHU,
        'Status': s.status === 'distributed' ? 'Dibagikan' : 'Dihitung'
      }));
      const ws = XLSX.utils.json_to_sheet(shuData);
      XLSX.utils.book_append_sheet(wb, ws, `SHU ${selectedYear}`);
    }

    // Generate file
    const fileName = type === 'all' 
      ? `Laporan_Koperasi_${new Date().toISOString().split('T')[0]}.xlsx`
      : `Laporan_${type.charAt(0).toUpperCase() + type.slice(1)}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
    
    showSnackbar(`File ${fileName} berhasil didownload!`, 'success');
  };

  // Handle SHU calculation
  const handleCalculateSHU = () => {
    setIsCalculating(true);
    setTimeout(() => {
      calculateSHU(selectedYear);
      setIsCalculating(false);
      showSnackbar(`SHU tahun ${selectedYear} berhasil dihitung!`, 'success');
    }, 1000);
  };

  // Handle config save
  const handleSaveConfig = () => {
    // Calculate derived values
    const labaBeresih = configForm.totalLabaKotor - configForm.biayaOperasional;
    const cadangan = labaBeresih * 0.2;
    
    setSHUConfig({
      ...configForm,
      labaBeresih: labaBeresih - cadangan,
      cadangan
    });
    
    setShowSHUConfigModal(false);
    showSnackbar('Konfigurasi SHU berhasil disimpan!', 'success');
  };

  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            Laporan & SHU
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
            Export data dan kelola Sisa Hasil Usaha
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #198754, #20c997)',
            borderRadius: '16px',
            padding: '16px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '12px', opacity: 0.9 }}>Total Nasabah</span>
            </div>
            <p style={{ fontSize: '26px', fontWeight: '800', margin: 0 }}>{nasabahUsers.length}</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
            borderRadius: '16px',
            padding: '16px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Wallet style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '12px', opacity: 0.9 }}>Total Simpanan</span>
            </div>
            <p style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>
              Rp {(totalSimpanan / 1000000).toFixed(1)}jt
            </p>
          </div>
        </div>

        {/* Simpanan Breakdown */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
            Ringkasan Simpanan
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: 'Pokok', value: totalPokok, color: '#16a34a', bg: '#dcfce7' },
              { label: 'Wajib', value: totalWajib, color: '#2563eb', bg: '#dbeafe' },
              { label: 'Sukarela', value: totalSukarela, color: '#7c3aed', bg: '#ede9fe' },
            ].map((item, i) => (
              <div key={i} style={{
                background: item.bg,
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0' }}>{item.label}</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: item.color, margin: 0 }}>
                  Rp {(item.value / 1000000).toFixed(1)}jt
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileSpreadsheet style={{ width: '20px', height: '20px', color: '#16a34a' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Export ke Excel
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              onClick={() => exportToExcel('nasabah')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Users style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                <span style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>Data Nasabah</span>
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                Semua data anggota
              </p>
            </button>

            <button
              onClick={() => exportToExcel('simpanan')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <DollarSign style={{ width: '18px', height: '18px', color: '#2563eb' }} />
                <span style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>Transaksi</span>
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                Simpanan & Penarikan
              </p>
            </button>

            <button
              onClick={() => exportToExcel('shu')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <PieChart style={{ width: '18px', height: '18px', color: '#7c3aed' }} />
                <span style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>Data SHU</span>
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                SHU per anggota
              </p>
            </button>

            <button
              onClick={() => exportToExcel('all')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Download style={{ width: '18px', height: '18px', color: 'white' }} />
                <span style={{ fontWeight: '600', fontSize: '13px', color: 'white' }}>Semua Data</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Export lengkap
              </p>
            </button>
          </div>
        </div>

        {/* SHU Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Sisa Hasil Usaha (SHU)
              </h3>
            </div>
            <button
              onClick={() => setShowSHUConfigModal(true)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                background: '#f3f4f6',
                color: '#374151',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Settings style={{ width: '14px', height: '14px' }} />
              Config
            </button>
          </div>

          {/* Year Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: selectedYear === year ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : '#f3f4f6',
                  color: selectedYear === year ? 'white' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {year}
              </button>
            ))}
          </div>

          {/* SHU Summary */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '16px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>Total SHU {selectedYear}</span>
              {currentYearSHU.length > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  background: currentYearSHU[0].status === 'distributed' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)'
                }}>
                  {currentYearSHU[0].status === 'distributed' ? (
                    <><CheckCircle style={{ width: '10px', height: '10px' }} /> Dibagikan</>
                  ) : (
                    <><Clock style={{ width: '10px', height: '10px' }} /> Dihitung</>
                  )}
                </span>
              )}
            </div>
            <p style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>
              Rp {totalSHU.toLocaleString('id-ID')}
            </p>
            <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>
              Laba Bersih: Rp {shuConfig.labaBeresih.toLocaleString('id-ID')}
            </p>
          </div>

          {/* SHU Distribution Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Kontribusi Simpanan', value: `${shuConfig.persentaseSimpanan}%`, color: '#16a34a' },
              { label: 'Kontribusi Transaksi', value: `${shuConfig.persentaseTransaksi}%`, color: '#2563eb' },
              { label: 'Dana Sosial', value: `${shuConfig.persentaseDana}%`, color: '#d97706' },
              { label: 'Pengurus', value: `${shuConfig.persentasePengurus}%`, color: '#dc2626' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '10px',
                background: '#f9fafb',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCalculateSHU}
              disabled={isCalculating}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: isCalculating ? '#e5e7eb' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: isCalculating ? '#9ca3af' : 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isCalculating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isCalculating ? (
                <><RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Menghitung...</>
              ) : (
                <><Calculator style={{ width: '16px', height: '16px' }} /> Hitung SHU</>
              )}
            </button>
            <button
              onClick={() => setShowSHUDetailModal(true)}
              disabled={currentYearSHU.length === 0}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #7c3aed',
                background: 'white',
                color: currentYearSHU.length === 0 ? '#d1d5db' : '#7c3aed',
                fontSize: '14px',
                fontWeight: '600',
                cursor: currentYearSHU.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Eye style={{ width: '16px', height: '16px' }} />
              Lihat
            </button>
          </div>
        </div>
      </div>

      {/* SHU Config Modal */}
      <Modal isOpen={showSHUConfigModal} onClose={() => setShowSHUConfigModal(false)} title="Konfigurasi SHU" size="md">
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Total Laba Kotor (Rp)
            </label>
            <input
              type="number"
              value={configForm.totalLabaKotor}
              onChange={(e) => setConfigForm({ ...configForm, totalLabaKotor: parseInt(e.target.value) || 0 })}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Biaya Operasional (Rp)
            </label>
            <input
              type="number"
              value={configForm.biayaOperasional}
              onChange={(e) => setConfigForm({ ...configForm, biayaOperasional: parseInt(e.target.value) || 0 })}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{
            background: '#f9fafb',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0' }}>Laba Bersih (setelah cadangan 20%)</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a', margin: 0 }}>
              Rp {((configForm.totalLabaKotor - configForm.biayaOperasional) * 0.8).toLocaleString('id-ID')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {[
              { key: 'persentaseSimpanan', label: '% Simpanan' },
              { key: 'persentaseTransaksi', label: '% Transaksi' },
              { key: 'persentaseDana', label: '% Dana Sosial' },
              { key: 'persentasePengurus', label: '% Pengurus' },
            ].map((item) => (
              <div key={item.key}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  {item.label}
                </label>
                <input
                  type="number"
                  value={configForm[item.key as keyof typeof configForm]}
                  onChange={(e) => setConfigForm({ ...configForm, [item.key]: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveConfig}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Simpan Konfigurasi
          </button>
        </div>
      </Modal>

      {/* SHU Detail Modal */}
      <Modal isOpen={showSHUDetailModal} onClose={() => setShowSHUDetailModal(false)} title={`SHU ${selectedYear}`} size="lg">
        <div>
          {currentYearSHU.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <Calculator style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada data SHU</p>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Klik "Hitung SHU" untuk menghitung</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {currentYearSHU.map((shu, index) => (
                <div key={shu.userId} style={{
                  padding: '14px',
                  background: index % 2 === 0 ? '#f9fafb' : 'white',
                  borderRadius: '10px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{shu.userName}</span>
                    <span style={{ fontWeight: '700', color: '#7c3aed', fontSize: '16px' }}>
                      Rp {shu.totalSHU.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Simpanan</p>
                      <p style={{ fontSize: '12px', color: '#111827', margin: 0 }}>
                        Rp {(shu.totalSimpanan/1000).toFixed(0)}rb ({shu.kontribusiSimpanan}%)
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Transaksi</p>
                      <p style={{ fontSize: '12px', color: '#111827', margin: 0 }}>
                        {shu.totalTransaksi}x ({shu.kontribusiTransaksi}%)
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>SHU</p>
                      <p style={{ fontSize: '12px', color: '#16a34a', margin: 0 }}>
                        S: {(shu.shuSimpanan/1000).toFixed(0)}rb | T: {(shu.shuTransaksi/1000).toFixed(0)}rb
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentYearSHU.length > 0 && currentYearSHU[0].status !== 'distributed' && (
            <button
              onClick={() => {
                distributeSHU(selectedYear);
                showSnackbar('SHU berhasil didistribusikan!', 'success');
              }}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '16px',
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
              <CheckCircle style={{ width: '18px', height: '18px' }} />
              Tandai Sudah Dibagikan
            </button>
          )}
        </div>
      </Modal>

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

