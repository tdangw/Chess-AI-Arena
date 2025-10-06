import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project Pages: https://tdangw.github.io/Chess-AI-Arena/
export default defineConfig({
  plugins: [react()],
  base: '/Chess-AI-Arena/', // quan trọng: đúng hoa-thường
  build: { outDir: 'dist' },
});
