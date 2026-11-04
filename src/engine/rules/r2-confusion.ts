import { SpellError, CheckOptions } from '../types';
import { CUM_TU_NHAM_LAN, ConfusionPair } from '../data/rulesData';

/**
 * Tạo RegExp tìm kiếm cụm từ với ranh giới từ chuẩn Unicode
 * (không dùng \b thông thường vì \b không hoạt động chính xác với ký tự có dấu)
 */
function buildBoundaryRegex(phrase: string): RegExp {
  // Thoát các ký tự đặc biệt trong phrase
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Ranh giới: Bắt đầu chuỗi hoặc ký tự không phải chữ/số tiếng Việt
  const pre = '(?<=^|[^\\p{L}\\p{N}])';
  // Kết thúc: Cuối chuỗi hoặc ký tự không phải chữ/số tiếng Việt
  const post = '(?=$|[^\\p{L}\\p{N}])';
  return new RegExp(`${pre}${escaped}${post}`, 'giu');
}

// Biên dịch trước các regex cho danh sách cụm từ nhầm lẫn đã kiểm duyệt
const COMPILED_R2: { regex: RegExp; needle: string; pair: ConfusionPair; exception: RegExp | null }[] = CUM_TU_NHAM_LAN.map(pair => ({
  regex: buildBoundaryRegex(pair.sai),
  needle: pair.sai.toLowerCase(),
  pair,
  exception: pair.khongDungTruoc
    ? new RegExp(`^[ \\u00A0]+(?:${pair.khongDungTruoc})(?![\\p{L}\\p{N}])`, 'iu')
    : null
}));

/**
 * Luật R2: Danh sách nhầm lẫn đã kiểm duyệt (Mức: Chắc chắn)
 * Ví dụ: xản xuất -> sản xuất, xắp xếp -> sắp xếp, trân thành -> chân thành
 */
export function checkR2Confusion(
  normalizedText: string,
  options?: CheckOptions
): SpellError[] {
  const errors: SpellError[] = [];
  const userDict = new Set((options?.userDictionary || []).map(w => w.toLowerCase().normalize('NFC')));

  // Lọc nhanh trước: danh sách dài mà chạy biểu thức chính quy cho mọi cụm ở mọi đoạn thì chậm
  const lowerText = normalizedText.toLowerCase();

  for (const { regex, needle, pair, exception } of COMPILED_R2) {
    if (!lowerText.includes(needle)) continue;
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(normalizedText)) !== null) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;

      // Cụm trùng hình thức với chữ đúng: "tiếp xúc tích cực", "nhận chức vụ"
      if (exception?.test(normalizedText.slice(end, end + 24))) continue;

      // Nếu từ này đã được người dùng thêm vào từ điển cá nhân thì bỏ qua
      if (userDict.has(matchText.toLowerCase())) continue;

      // Giữ nguyên kiểu chữ hoa/thường phù hợp
      let suggestion = pair.dung;
      if (matchText[0] === matchText[0].toUpperCase()) {
        suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
      }

      errors.push({
        luat: 'R2',
        batDau: start,
        ketThuc: end,
        goc: matchText,
        goiY: [suggestion],
        mucDo: 'chac-chan',
        lyDo: pair.lyDo
      });
    }
  }

  return errors;
}
