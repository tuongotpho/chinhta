import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Bộ nhớ đệm trên Firebase', () => {
  it('trang HTML không được giữ bản cũ, tệp có mã băm được giữ lâu', () => {
    const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../firebase.json'), 'utf8'));
    const rules = config.hosting.headers as { source: string; headers: { key: string; value: string }[] }[];
    const cache = (source: string) => rules.find(r => r.source === source)?.headers.find(h => h.key === 'Cache-Control')?.value;
    expect(cache('**/*.html')).toBe('no-cache');
    expect(cache('/')).toBe('no-cache');
    expect(cache('/assets/@(taskpane|worker)-*')).toContain('immutable');
  });
});
