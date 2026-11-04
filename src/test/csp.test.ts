import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Bảo mật dữ liệu & Kiểm tra CSP (Content Security Policy)', () => {
  it('kiểm tra firebase.json có CSP chặt chẽ', () => {
    const firebaseJsonPath = path.resolve(__dirname, '../../firebase.json');
    const content = fs.readFileSync(firebaseJsonPath, 'utf8');
    const json = JSON.parse(content);

    const headers = json.hosting?.headers?.[0]?.headers || [];
    const cspHeader = headers.find((h: { key: string }) => h.key === 'Content-Security-Policy');

    expect(cspHeader).toBeDefined();
    const cspVal = cspHeader.value;

    // Không cho phép kết nối mạng bên ngoài
    expect(cspVal).toContain("connect-src 'self'");
    // Chỉ tải script từ self và Office.js
    expect(cspVal).toContain('https://appsforoffice.microsoft.com');
  });

  it('kiểm tra index.html có meta CSP bảo vệ', () => {
    const indexHtmlPath = path.resolve(__dirname, '../../index.html');
    const content = fs.readFileSync(indexHtmlPath, 'utf8');

    expect(content).toContain('http-equiv="Content-Security-Policy"');
    expect(content).toContain("connect-src 'self'");
  });

  it('chứng minh thư mục src/engine hoàn toàn không có lệnh mạng', () => {
    const engineDir = path.resolve(__dirname, '../engine');
    const files = fs.readdirSync(engineDir, { recursive: true }) as string[];

    for (const file of files) {
      if (typeof file === 'string' && file.endsWith('.ts')) {
        const fullPath = path.join(engineDir, file);
        const code = fs.readFileSync(fullPath, 'utf8');

        // Đảm bảo không có fetch, axios, XMLHttpRequest, WebSocket trong engine
        expect(code).not.toMatch(/\bfetch\s*\(/);
        expect(code).not.toMatch(/\bXMLHttpRequest\b/);
        expect(code).not.toMatch(/\bWebSocket\b/);
        expect(code).not.toMatch(/\baxios\b/);
      }
    }
  });
});
