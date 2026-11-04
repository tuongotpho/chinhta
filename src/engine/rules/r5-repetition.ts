import { SpellError, CheckOptions } from '../types';
import { Sentence } from '../tokenizer';

// Danh sách các từ láy hoặc điệp từ hợp lệ trong tiếng Việt (không báo lỗi lặp)
const VALID_REDUPLICATIONS = new Set<string>([
  'ngày ngày', 'người người', 'nhà nhà', 'năm năm', 'ai ai', 'ngay ngay',
  'xinh xinh', 'xanh xanh', 'đo đỏ', 'chậm chậm', 'nhanh nhanh', 'đều đều',
  'lớp lớp', 'tầng tầng', 'trùng trùng', 'điệp điệp', 'nhiều nhiều', 'ít ít',
  'trước trước', 'sau sau', 'dần dần', 'luôn luôn', 'sớm sớm', 'chiều chiều'
]);

/**
 * Luật R5: Lặp từ liền nhau (Mức: Nên xem)
 * Ví dụ: "trong trong", "và và", "đã đã"
 */
export function checkR5Repetition(
  sentences: Sentence[],
  options?: CheckOptions
): SpellError[] {
  const errors: SpellError[] = [];
  const userDict = new Set((options?.userDictionary || []).map(w => w.toLowerCase().normalize('NFC')));

  for (const sentence of sentences) {
    const wordTokens = sentence.tokens.filter(t => t.isWord && !t.isIgnored);

    for (let i = 0; i < wordTokens.length - 1; i++) {
      const current = wordTokens[i];
      const next = wordTokens[i + 1];

      // Kiểm tra xem hai từ có nằm sát nhau không (chỉ cách nhau bằng khoảng trắng)
      const textBetween = sentence.text.slice(
        current.end - sentence.start,
        next.start - sentence.start
      );

      // Nếu giữa 2 từ có dấu câu (dấu phẩy, chấm, gạch ngang) thì không phải lặp từ vô tình
      if (/[^\s]/.test(textBetween)) continue;

      const lowerCurrent = current.lowerText.normalize('NFC');
      const lowerNext = next.lowerText.normalize('NFC');

      if (lowerCurrent === lowerNext) {
        const pairKey = `${lowerCurrent} ${lowerNext}`;

        // Bỏ qua nếu là từ láy/điệp từ tiếng Việt hợp lệ hoặc trong từ điển
        if (VALID_REDUPLICATIONS.has(pairKey)) continue;
        if (userDict.has(pairKey)) continue;

        const start = current.start;
        const end = next.end;
        const original = sentence.text.slice(start - sentence.start, end - sentence.start);

        errors.push({
          luat: 'R5',
          batDau: start,
          ketThuc: end,
          goc: original,
          goiY: [current.text],
          mucDo: 'nen-xem',
          lyDo: `Lặp từ vô ý liên tiếp '${current.text}'`
        });
      }
    }
  }

  return errors;
}
