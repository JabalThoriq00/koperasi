import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  fullScreen?: boolean;
  text?: string;
}

export function Loading({ size = 'md', color = 'primary', fullScreen = false, text }: LoadingProps) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const colors = {
    primary: 'border-[#1D8348] border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`} />
      {text && <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 shadow-xl">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

// Loading Button Content
export function LoadingButton({ children, isLoading, loadingText = 'Memproses...' }: {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loading size="sm" color="white" />
        <span>{loadingText}</span>
      </div>
    );
  }
  return <>{children}</>;
}

// Page Loading
export function PageLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loading size="lg" text="Memuat data..." />
    </div>
  );
}

// Overlay Loading
export function OverlayLoading({ text = 'Memproses...' }: { text?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-xl">
      <Loading size="lg" text={text} />
    </div>
  );
}

