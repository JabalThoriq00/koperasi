import React from 'react';
import { Button } from '../components/Button';
import { Home, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D8348] to-[#27AE60] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-white mb-4" style={{ fontSize: '6rem', lineHeight: 1 }}>404</h1>
          <h2 className="text-white mb-4">Halaman Tidak Ditemukan</h2>
          <p className="text-[#A9DFBF] text-lg mb-8">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('dashboard')}
          >
            <Home className="w-5 h-5 mr-2" />
            Ke Beranda
          </Button>
        </div>

        <div className="mt-12">
          <svg
            className="w-64 h-64 mx-auto opacity-50"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" stroke="#A9DFBF" strokeWidth="4" />
            <path
              d="M70 90 Q100 120 130 90"
              stroke="#A9DFBF"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="75" cy="75" r="8" fill="#A9DFBF" />
            <circle cx="125" cy="75" r="8" fill="#A9DFBF" />
          </svg>
        </div>
      </div>
    </div>
  );
}
