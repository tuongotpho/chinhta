import { SpellError, CheckOptions } from '../types';
import { CO_QUAN_ND30, AgencyEntry } from '../data/rulesData';

/**
 * Tạo RegExp tìm kiếm tên cơ quan với ranh giới từ chuẩn Unicode
 */
function buildBoundaryRegex(phrase: string): RegExp {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pre = '(?<=^|[^\\p{L}\\p{N}])';
  const post = '(?=$|[^\\p{L}\\p{N}])';
  return new RegExp(`${pre}${escaped}${post}`, 'giu');
}

const COMPILED_R6: { regex: RegExp; entry: AgencyEntry }[] = CO_QUAN_ND30.map(entry => ({
  regex: buildBoundaryRegex(entry.chuan),
  entry
}));

/**
 * Luật R6: Viết hoa tên cơ quan theo Nghị định 30/2020/NĐ-CP (Mức: Nên xem)
 * 
 * RÀNG BUỘC NGHIÊM NGẶT:
 * - "Bộ Tài chính" (đúng chuẩn) -> KHÔNG báo lỗi.
 * - "BỘ TÀI CHÍNH" (tiêu đề in hoa toàn bộ) -> KHÔNG báo lỗi.
 * - Chỉ báo lỗi khi viết sai hoa/thường: "bộ tài chính", "Bộ tài chính", "bộ Tài chính".
 */
export function checkR6Organization(
  normalizedText: string,
  options?: CheckOptions
): SpellError[] {
  const errors: SpellError[] = [];
  const userDict = new Set((options?.userDictionary || []).map(w => w.toLowerCase().normalize('NFC')));

  for (const { regex, entry } of COMPILED_R6) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(normalizedText)) !== null) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;

      // 1. Nếu viết chuẩn đúng từng chữ hoa/thường (ví dụ "Bộ Tài chính") -> BỎ QUA
      if (matchText === entry.chuan) {
        continue;
      }

      // 2. Nếu viết in hoa toàn bộ (ví dụ tiêu đề "BỘ TÀI CHÍNH") -> BỎ QUA
      if (matchText === entry.chuan.toUpperCase()) {
        continue;
      }

      // Bỏ qua nếu có trong từ điển cá nhân người dùng
      if (userDict.has(matchText.toLowerCase())) continue;

      // Còn lại là viết sai hoa/thường (ví dụ "bộ tài chính", "Bộ tài chính", "bộ Tài chính") -> BÁO LỖI
      errors.push({
        luat: 'R6',
        batDau: start,
        ketThuc: end,
        goc: matchText,
        goiY: [entry.chuan],
        mucDo: 'nen-xem',
        lyDo: `Viết hoa tên cơ quan chưa đúng chuẩn Nghị định 30/2020/NĐ-CP (chuẩn: '${entry.chuan}')`
      });
    }
  }

  return errors;
}
