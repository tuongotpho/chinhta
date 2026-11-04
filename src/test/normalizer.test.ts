import { describe, it, expect } from 'vitest';
import { normalizeWithMapping } from '../engine/normalizer';

describe('Normalizer with Mapping', () => {
  it('xử lý chuỗi rỗng an toàn', () => {
    const res = normalizeWithMapping('');
    expect(res.text).toBe('');
    expect(res.toOriginalOffset(0)).toBe(0);
  });

  it('xử lý văn bản NFC thông thường mà không làm lệch index', () => {
    const text = 'Hôm nay trời nắng đẹp.';
    const res = normalizeWithMapping(text);
    expect(res.text).toBe(text);
    expect(res.toOriginalOffset(0)).toBe(0);
    expect(res.toOriginalOffset(4)).toBe(4);
    expect(res.toOriginalOffset(text.length)).toBe(text.length);
  });

  it('xử lý chuẩn hóa từ NFD sang NFC và ánh xạ chính xác vị trí gốc', () => {
    // "hòa" ở dạng NFD (o + dấu huyền \u0300)
    const nfdWord = 'h\u006F\u0300a'; // 4 code units
    const originalText = `Văn bản ${nfdWord} bình`; // "hòa" bắt đầu tại index 8, kết thúc tại 12

    const res = normalizeWithMapping(originalText);
    // Trong NFC, "hòa" là h-ò-a (3 code units)
    expect(res.text).toBe('Văn bản hòa bình');

    // Tìm vị trí của "hòa" trong chuỗi NFC
    const nfcStart = res.text.indexOf('hòa'); // 8
    const nfcEnd = nfcStart + 'hòa'.length; // 11

    // Ánh xạ ngược lại chuỗi gốc
    const origStart = res.toOriginalOffset(nfcStart);
    const origEnd = res.toOriginalOffset(nfcEnd);

    expect(origStart).toBe(8);
    expect(origEnd).toBe(12);

    // Trích xuất chuỗi gốc bằng vị trí ánh xạ phải khớp đúng nfdWord
    const extractedOriginal = originalText.slice(origStart, origEnd);
    expect(extractedOriginal).toBe(nfdWord);
  });
});
