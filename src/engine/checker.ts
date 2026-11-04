import { SpellError, CheckOptions } from './types';
import { normalizeWithMapping } from './normalizer';
import { tokenize } from './tokenizer';
import { checkR1Syllables } from './rules/r1-syllable';
import { checkR2Confusion } from './rules/r2-confusion';
import { checkR3Context } from './rules/r3-context';
import { checkR4Typography } from './rules/r4-typography';
import { checkR5Repetition } from './rules/r5-repetition';
import { checkR6Organization } from './rules/r6-organization';
import { checkR7ToneStyle } from './rules/r7-tone-style';
import { checkR8ContextNgram } from './rules/r8-context-ngram';

/** Luật có gợi ý là chữ thường cần trả về đúng kiểu hoa/thường của chữ gốc */
const CASE_MATCHED_RULES = new Set(['R1', 'R2', 'R3', 'R8']);

export function matchCase(original: string, suggestion: string): string {
  const letters = [...original].filter(ch => ch.toLowerCase() !== ch.toUpperCase());
  if (letters.length >= 2 && letters.every(ch => ch === ch.toUpperCase())) {
    return suggestion.toUpperCase();
  }
  if (letters.length > 0 && letters[0] === letters[0].toUpperCase()) {
    const chars = [...suggestion];
    chars[0] = chars[0].toUpperCase();
    return chars.join('');
  }
  return suggestion;
}

const SEVERITY_WEIGHT: Record<string, number> = {
  'chac-chan': 3,
  'nen-xem': 2,
  'goi-y': 1
};

/**
 * Hàm kiểm tra chính tả cốt lõi cho một đoạn văn bản (paragraph string).
 * 
 * - Chạy hoàn toàn trên máy trạm (Client/Worker), 0 phụ thuộc Word, 0 mạng.
 * - Chuẩn hóa NFC trong quá trình so khớp và ánh xạ chính xác về offset chuỗi gốc (kể cả NFD).
 * - Trả về danh sách SpellError với vị trí batDau, ketThuc khớp chuẩn xác với văn bản gốc.
 */
export function checkParagraph(
  originalText: string,
  options: CheckOptions = {}
): SpellError[] {
  if (!originalText || !originalText.trim()) {
    return [];
  }

  // 1. Chuẩn hóa NFC và tạo hàm ánh xạ vị trí gốc
  const { text: normText, toOriginalOffset } = normalizeWithMapping(originalText);

  // 2. Tách câu và token
  const { sentences, allTokens } = tokenize(normText);

  const rawErrors: SpellError[] = [];

  // 3. Thực thi các luật theo tùy chọn cấu hình
  if (options.enableR1 !== false) {
    rawErrors.push(...checkR1Syllables(allTokens, options));
  }

  if (options.enableR2 !== false) {
    rawErrors.push(...checkR2Confusion(normText, options));
  }

  if (options.enableR3 !== false) {
    rawErrors.push(...checkR3Context(sentences, options));
  }

  if (options.enableR4 !== false) {
    rawErrors.push(...checkR4Typography(normText));
  }

  if (options.enableR5 !== false) {
    rawErrors.push(...checkR5Repetition(sentences, options));
  }

  if (options.enableR6 !== false) {
    rawErrors.push(...checkR6Organization(normText, options));
  }

  // R7 mặc định tắt theo đề bài, chỉ chạy khi enableR7 = true
  if (options.enableR7 === true) {
    rawErrors.push(...checkR7ToneStyle(normText));
  }

  // R8 chạy sau cùng: chỗ đã có luật chắc chắn hơn thì bước lọc trùng sẽ giữ luật đó
  if (options.enableR8 !== false) {
    rawErrors.push(...checkR8ContextNgram(sentences, options));
  }

  // 4. Lọc trùng lặp & giải quyết xung đột vùng span đè lên nhau
  // Sắp xếp theo vị trí bắt đầu tăng dần, nếu bằng nhau thì ưu tiên mức độ chắc chắn cao hơn
  rawErrors.sort((a, b) => {
    if (a.batDau !== b.batDau) return a.batDau - b.batDau;
    return (SEVERITY_WEIGHT[b.mucDo] || 0) - (SEVERITY_WEIGHT[a.mucDo] || 0);
  });

  const deduped: SpellError[] = [];
  let lastEnd = -1;

  for (const err of rawErrors) {
    // Nếu lỗi này hoàn toàn nằm trong lỗi trước đó có mức độ cao hơn thì bỏ qua
    if (err.batDau < lastEnd) {
      continue;
    }
    deduped.push(err);
    lastEnd = Math.max(lastEnd, err.ketThuc);
  }

  // 5. Ánh xạ vị trí từ chuỗi chuẩn hóa về chuỗi gốc
  const mappedErrors: SpellError[] = deduped.map(err => {
    const origStart = toOriginalOffset(err.batDau);
    const origEnd = toOriginalOffset(err.ketThuc);
    const originalGoc = originalText.slice(origStart, origEnd);

    const goc = originalGoc || err.goc;
    return {
      ...err,
      batDau: origStart,
      ketThuc: origEnd,
      goc,
      goiY: CASE_MATCHED_RULES.has(err.luat) ? err.goiY.map(s => matchCase(goc, s)) : err.goiY
    };
  });

  return mappedErrors;
}
