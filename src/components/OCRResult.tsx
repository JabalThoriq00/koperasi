import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { OCRResult as OCRResultType } from '../store/useStore';

interface OCRResultProps {
  result: OCRResultType;
  expectedAmount?: number;
}

export function OCRResult({ result, expectedAmount }: OCRResultProps) {
  const isAmountMatch = expectedAmount ? result.amount === expectedAmount : true;
  const isHighConfidence = result.confidence >= 0.9;

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-gray-900">Hasil OCR</h4>
        <div className={`flex items-center gap-2 ${isHighConfidence ? 'text-[#27AE60]' : 'text-[#F1C40F]'}`}>
          {isHighConfidence ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm">Confidence: {(result.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Pengirim</p>
          <p className="text-gray-900">{result.sender}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Nominal</p>
          <div className="flex items-center gap-2">
            <p className="text-gray-900">
              Rp {result.amount.toLocaleString('id-ID')}
            </p>
            {expectedAmount && !isAmountMatch && (
              <span className="text-xs text-[#E74C3C] bg-red-50 px-2 py-1 rounded">
                Tidak cocok
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Tanggal Transfer</p>
          <p className="text-gray-900">{new Date(result.date).toLocaleDateString('id-ID')}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Nomor Referensi</p>
          <p className="text-gray-900">{result.referenceNumber}</p>
        </div>
      </div>

      {expectedAmount && isAmountMatch && (
        <div className="bg-green-50 border border-[#27AE60] rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#27AE60]" />
          <span className="text-sm text-[#1D8348]">Nominal sesuai dengan yang diharapkan</span>
        </div>
      )}
    </div>
  );
}
