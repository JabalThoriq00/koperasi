import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { useSnackbar, Snackbar } from '../components/Snackbar';
import { useStore } from '../store/useStore';
import { User, Mail, Phone, MapPin, Upload, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string>('');
  const { register } = useStore();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKtpFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setKtpPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.password) {
      showSnackbar('Harap isi semua field', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showSnackbar('Password tidak cocok', 'error');
      return;
    }

    if (!ktpFile) {
      showSnackbar('Harap upload KTP', 'error');
      return;
    }

    // Register user
    register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      ktpUrl: ktpPreview,
    });

    showSnackbar('Pendaftaran berhasil! Menunggu persetujuan admin.', 'success');
    setTimeout(() => {
      onNavigate('login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D8348] to-[#27AE60] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1D8348] mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Login
          </button>

          <div className="text-center mb-8">
            <h1 className="text-gray-900 mb-2">Daftar Nasabah Baru</h1>
            <p className="text-gray-500">Lengkapi data diri Anda untuk mendaftar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="name"
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              value={formData.name}
              onChange={handleChange}
              icon={<User className="w-5 h-5" />}
            />

            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail className="w-5 h-5" />}
            />

            <Input
              type="tel"
              name="phone"
              label="Nomor HP"
              placeholder="08123456789"
              value={formData.phone}
              onChange={handleChange}
              icon={<Phone className="w-5 h-5" />}
            />

            <Textarea
              name="address"
              label="Alamat Lengkap"
              placeholder="Masukkan alamat lengkap"
              value={formData.address}
              onChange={handleChange}
              rows={3}
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={handleChange}
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Konfirmasi Password"
              placeholder="Ulangi password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {/* KTP Upload */}
            <div>
              <label className="block mb-2 text-gray-700">
                Upload KTP <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#27AE60] transition-colors">
                {ktpPreview ? (
                  <div className="space-y-4">
                    <img src={ktpPreview} alt="KTP Preview" className="max-h-48 mx-auto rounded-lg" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setKtpFile(null);
                        setKtpPreview('');
                      }}
                    >
                      Ganti Foto
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-1">Klik untuk upload KTP</p>
                    <p className="text-sm text-gray-400">PNG, JPG max 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKtpUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg">
              Daftar
            </Button>
          </form>
        </div>
      </div>

      <Snackbar {...snackbar} onClose={closeSnackbar} />
    </div>
  );
}
