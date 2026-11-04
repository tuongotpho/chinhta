import { describe, expect, it } from 'vitest';
import {
  convertLegacyText,
  detectLegacyEncoding,
  isLegacyFontName,
  unicodeFontFor
} from '../word/legacyEncoding';

describe('Đổi bảng mã cũ sang Unicode', () => {
  it('TCVN3: quốc hiệu, tiêu ngữ', () => {
    expect(convertLegacyText('Céng hßa x· héi chñ nghÜa ViÖt Nam', 'tcvn3')).toBe('Cộng hòa xã hội chủ nghĩa Việt Nam');
    expect(convertLegacyText('§éc lËp - Tù do - H¹nh phóc', 'tcvn3')).toBe('Độc lập - Tự do - Hạnh phúc');
  });

  it('TCVN3: đủ nguyên âm có dấu và ư mã 0xAD', () => {
    expect(convertLegacyText('C«ng ty ®iÖn lùc tr¸ch nhiÖm h÷u h¹n', 'tcvn3')).toBe('Công ty điện lực trách nhiệm hữu hạn');
    expect(convertLegacyText('nh­ng', 'tcvn3')).toBe('nhưng');
  });

  it('TCVN3: font chữ hoa .VnTimeH', () => {
    expect(convertLegacyText('c«ng ty ®iÖn lùc', 'tcvn3', '.VnTimeH')).toBe('CÔNG TY ĐIỆN LỰC');
  });

  it('VNI: quốc hiệu, tiêu ngữ', () => {
    expect(convertLegacyText('Coäng hoøa xaõ hoäi chuû nghóa Vieät Nam', 'vni')).toBe('Cộng hòa xã hội chủ nghĩa Việt Nam');
    expect(convertLegacyText('Ñoäc laäp - Töï do - Haïnh phuùc', 'vni')).toBe('Độc lập - Tự do - Hạnh phúc');
  });

  it('VNI: chữ hoa, ă, ơ, ư', () => {
    expect(convertLegacyText('COÂNG TY ÑIEÄN LÖÏC', 'vni')).toBe('CÔNG TY ĐIỆN LỰC');
    expect(convertLegacyText('naêm thaùng ngaøy trôû löông', 'vni')).toBe('năm tháng ngày trở lương');
  });

  it('chữ đã là Unicode giữ nguyên, không đổi hai lần', () => {
    expect(convertLegacyText('Việt Nam', 'tcvn3')).toBe('Việt Nam');
    expect(convertLegacyText('điện lực', 'vni')).toBe('điện lực');
  });

  it('nhận bảng mã theo tên font rồi theo nội dung', () => {
    expect(detectLegacyEncoding('.VnTime', 'x')).toBe('tcvn3');
    expect(detectLegacyEncoding('VNI-Times', 'x')).toBe('vni');
    expect(detectLegacyEncoding('Times New Roman', 'C«ng ty tr¸ch nhiÖm h÷u h¹n ®iÖn lùc')).toBe('tcvn3');
    expect(detectLegacyEncoding('Times New Roman', 'Công ty điện lực')).toBeNull();
    expect(isLegacyFontName('Times New Roman')).toBe(false);
  });

  it('chọn font thay thế đúng kiểu', () => {
    expect(unicodeFontFor('.VnTime')).toBe('Times New Roman');
    expect(unicodeFontFor('.VnArialH')).toBe('Arial');
    expect(unicodeFontFor('VNI-Helve')).toBe('Arial');
  });
});
