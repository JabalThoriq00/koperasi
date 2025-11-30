import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist', // Changed to 'dist' for Vercel
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'recharts': ['recharts'],
          'xlsx': ['xlsx'],
          'zustand': ['zustand'],
          'lucide': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3002,
    host: true,
    open: true,
  },
});
