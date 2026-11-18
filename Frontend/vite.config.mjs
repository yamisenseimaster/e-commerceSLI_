import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  server: {
    port: 3000,
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-router)[\\/]/.test(id)) return 'react';
          if (/[\\/]node_modules[\\/](@stripe|@paypal)[\\/]/.test(id)) return 'payments';
          if (/[\\/]node_modules[\\/](@headlessui|swiper)[\\/]/.test(id)) return 'ui';
          if (/[\\/]node_modules[\\/](apexcharts|react-apexcharts)[\\/]/.test(id)) return 'charts';
        },
      },
    },
  },
});
