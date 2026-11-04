import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
