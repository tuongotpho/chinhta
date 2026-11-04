import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import os from 'os';
import packageJson from './package.json';

const certDir = path.join(os.homedir(), '.office-addin-dev-certs');
const certPath = path.join(certDir, 'localhost.crt');
const keyPath = path.join(certDir, 'localhost.key');
const caPath = path.join(certDir, 'ca.crt');

const hasOfficeCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);

const httpsConfig = hasOfficeCerts
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      ca: fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined
    }
  : true;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Hiện ở chân trang để biết đang dùng đúng bản mới. Nâng version trong package.json mỗi lần phát hành.
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_BUILD_DATE__: JSON.stringify(
      new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' })
    )
  },
  server: {
    port: 3000,
    https: httpsConfig,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        taskpane: 'index.html'
      }
    }
  }
});
