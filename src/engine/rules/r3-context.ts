import { SpellError, CheckOptions } from '../types';
import { Sentence } from '../tokenizer';

/**
 * Luật R3: Nhầm cần xem ngữ cảnh, chỉ dùng danh sách cặp (Mức: Nên xem)
 * Ví dụ: dành/giành giải, dành được/giành được, chia sẽ/chia sẻ, giành cho/dành cho
 * Ràng buộc:
 * - "chân thành cảm ơn" là đúng, không được báo lỗi.
 * - "Nguyễn Văn Chia sẽ..." không được báo lỗi vì "Chia" là tên riêng.
 */
export function checkR3Context(
  sentences: Sentence[],
  options?: CheckOptions
): SpellError[] {
  const errors: SpellError[] = [];
  const userDict = new Set((options?.userDictionary || []).map(w => w.toLowerCase().normalize('NFC')));

  // Danh mục họ phổ biến để nhận diện tên người
  const COMMON_SURNAMES = new Set([
    'nguyễn', 'trần', 'lê', 'phạm', 'hoàng', 'huỳnh', 'phan', 'vũ', 'võ',
    'đặng', 'bùi', 'đỗ', 'hồ', 'ngô', 'dương', 'lý', 'đinh', 'đoàn', 'trịnh', 'ông', 'bà', 'anh', 'chị'
  ]);

  for (const sentence of sentences) {
    const tokens = sentence.tokens.filter(t => t.isWord);

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const lower = tok.lowerText.normalize('NFC');

      // 1. Kiểm tra cặp: dành/giành giải, dành được / giành được
      if (lower === 'dành' && i + 1 < tokens.length) {
        const nextTok = tokens[i + 1];
        const nextLower = nextTok.lowerText.normalize('NFC');
        if (['giải', 'huy', 'thắng', 'được', 'thành'].includes(nextLower)) {
          const start = tok.start;
          const end = nextTok.end;
          const original = sentence.text.slice(start - sentence.start, end - sentence.start);

          if (!userDict.has(original.toLowerCase())) {
            errors.push({
              luat: 'R3',
              batDau: start,
              ketThuc: end,
              goc: original,
              goiY: [original.replace(/dành/i, match => match[0] === 'D' ? 'Giành' : 'giành')],
              mucDo: 'nen-xem',
              lyDo: 'Trong ngữ cảnh đạt được phần thưởng/thắng lợi/thành tích, nên dùng "giành" thay vì "dành"'
            });
          }
        }
      }

      // 2. Kiểm tra cặp: giành cho / giành tình cảm
      if (lower === 'giành' && i + 1 < tokens.length) {
        const nextTok = tokens[i + 1];
        const nextLower = nextTok.lowerText.normalize('NFC');
        const afterNext = tokens[i + 2]?.lowerText.normalize('NFC');
        // "giành sự công bằng", "giành thời cơ" là đúng; chỉ "giành thời gian" mới sai
        if (['cho', 'tình', 'tặng', 'riêng'].includes(nextLower) || (nextLower === 'thời' && afterNext === 'gian')) {
          const start = tok.start;
          const end = nextTok.end;
          const original = sentence.text.slice(start - sentence.start, end - sentence.start);

          if (!userDict.has(original.toLowerCase())) {
            errors.push({
              luat: 'R3',
              batDau: start,
              ketThuc: end,
              goc: original,
              goiY: [original.replace(/giành/i, match => match[0] === 'G' ? 'Dành' : 'dành')],
              mucDo: 'nen-xem',
              lyDo: 'Trong ngữ cảnh cất giữ, để lại hoặc trao tình cảm/thời gian, nên dùng "dành" thay vì "giành"'
            });
          }
        }
      }

      // 3. Kiểm tra cặp: chia sẽ -> chia sẻ
      if (lower === 'chia' && i + 1 < tokens.length) {
        const nextTok = tokens[i + 1];
        const nextLower = nextTok.lowerText.normalize('NFC');

        if (nextLower === 'sẽ') {
          // QUAN TRỌNG: Kiểm tra nếu "Chia" là tên riêng (ví dụ "Nguyễn Văn Chia sẽ đến...", "Ông Chia sẽ...")
          let isPersonName = tok.isProperNoun;

          if (i > 0) {
            const prevTok = tokens[i - 1];
            const prevLower = prevTok.lowerText.normalize('NFC');
            if (COMMON_SURNAMES.has(prevLower) || prevLower === 'văn' || prevLower === 'thị') {
              isPersonName = true;
            }
          }

          // Nếu là tên riêng thì KHÔNG báo lỗi
          if (!isPersonName) {
            const start = tok.start;
            const end = nextTok.end;
            const original = sentence.text.slice(start - sentence.start, end - sentence.start);

            if (!userDict.has(original.toLowerCase())) {
              errors.push({
                luat: 'R3',
                batDau: start,
                ketThuc: end,
                goc: original,
                goiY: ['chia sẻ'],
                mucDo: 'nen-xem',
                lyDo: 'Động từ san sẻ kinh nghiệm/thông tin nên dùng "chia sẻ" (dấu hỏi)'
              });
            }
          }
        }
      }
    }
  }

  return errors;
}
