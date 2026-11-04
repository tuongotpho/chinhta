import { SpellError, CheckOptions } from '../types';
import { Token } from '../tokenizer';
import { isValidSyllable, suggestCorrection } from '../syllable';
import { NGANH_DIEN_WORDS } from '../data/nganhDienData';
import { rankByContext } from './r8-context-ngram';

// Danh mục từ ngữ chuyên ngành điện và thuật ngữ kỹ thuật
const NGANH_DIEN_SET = new Set<string>(NGANH_DIEN_WORDS.map(s => s.toLowerCase().normalize('NFC')));

// Các từ tiếng Anh ngắn dễ bị hiểu nhầm là gõ Telex (bus -> bú). Từ dài không có gợi ý đã tự được bỏ qua.
export const ENGLISH_ALLOW_SET = new Set<string>([
  'word', 'excel', 'powerpoint', 'microsoft', 'office', 'windows', 'mac', 'web', 'website',
  'addin', 'taskpane', 'ribbon', 'online', 'offline', 'server', 'client', 'app', 'apps',
  'api', 'gui', 'ui', 'ux', 'format', 'font', 'track', 'changes', 'version', 'software', 'hardware',
  'vsto', 'vba', 'macro', 'nfc', 'nfd', 'unicode', 'telex', 'vni', 'pdf', 'doc', 'docx',
  'file', 'data', 'test', 'node', 'react', 'vite', 'npm', 'run', 'build', 'ci', 'cd',
  'github', 'actions', 'firebase', 'hosting', 'guid', 'setup', 'email', 'link', 'url',
  'status', 'developer', 'wef', 'reg', 'cmd', 'powershell', 'true', 'false', 'null',
  'teams', 'cmis', 'oms', 'pmis', 'scada', 'gis', 'ems', 'dms', 'erp', 'internet', 'portal',
  'of', 'the', 'and', 'for', 'from', 'with', 'or', 'on', 'in', 'at', 'by', 'to', 'is', 'line', 'lines', 'leon',
  'fax', 'bar', 'bus', 'gas', 'mix', 'like', 'logic', 'video', 'wifi', 'zalo', 'laptop', 'camera'
]);

const ASCII_WORD = /^[a-z]+$/;
// Dấu hiệu gõ Telex rõ ràng: phím bỏ dấu nằm giữa từ hoặc nguyên âm kép
const TELEX_PATTERN = /dd|aa|ee|oo|aw|ow|uw/;
const HAS_VOWEL = /[aăâeêioôơuưy]/;
const HEADING_MIN_WORDS = 3;
const ROMAN_NUMERAL = /^[ivxlcdm]+$/;

/** Câu là tiêu đề in hoa khi đa số chữ viết hoa và có ít nhất hai âm tiết tiếng Việt thật */
function findHeadingSentences(tokens: Token[]): Set<number> {
  const stats = new Map<number, { words: number; caps: number; syllables: number }>();
  for (const token of tokens) {
    if (!token.isWord) continue;
    const entry = stats.get(token.sentenceIndex) ?? { words: 0, caps: 0, syllables: 0 };
    entry.words++;
    if (token.isAllCaps) {
      entry.caps++;
      if (isValidSyllable(token.lowerText)) entry.syllables++;
    }
    stats.set(token.sentenceIndex, entry);
  }
  const headings = new Set<number>();
  for (const [index, entry] of stats) {
    if (entry.words >= HEADING_MIN_WORDS && entry.caps / entry.words >= 0.6 && entry.syllables >= 2) {
      headings.add(index);
    }
  }
  return headings;
}

/**
 * Luật R1: Âm tiết không hợp lệ, gõ nhầm Telex / VNI.
 * - Có dấu tiếng Việt mà sai cấu tạo: mức Chắc chắn.
 * - Chữ không dấu không có gợi ý: coi là từ nước ngoài, bỏ qua theo đề bài.
 * - Chữ không dấu có gợi ý nhưng không rõ là Telex: mức Nên xem, không đưa vào sửa hàng loạt.
 */
export function checkR1Syllables(tokens: Token[], options?: CheckOptions): SpellError[] {
  const errors: SpellError[] = [];
  const userDict = new Set((options?.userDictionary || []).map(w => w.toLowerCase().normalize('NFC')));
  const headings = findHeadingSentences(tokens);

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (!token.isWord) continue;

    const lower = token.lowerText.normalize('NFC');
    const chars = [...lower];
    const inHeading = token.isAllCaps && headings.has(token.sentenceIndex);
    const isAscii = ASCII_WORD.test(lower);
    // Kẹt phím Shift: cCơ, vViệc. Mã hiệu như TTg, TTr không tạo thành âm tiết nên không dính.
    const stuckShift =
      token.isIgnored && !token.isAllCaps && chars[0] === chars[1] && isValidSyllable(chars.slice(1).join(''));

    if (token.isIgnored && !inHeading && !stuckShift) continue;
    if (chars.length === 1) continue; // Chữ cái đơn: điểm b, b), Đ/c
    if (isValidSyllable(lower)) continue;
    if (NGANH_DIEN_SET.has(lower) || userDict.has(lower) || ENGLISH_ALLOW_SET.has(lower)) continue;
    if (inHeading && (!HAS_VOWEL.test(lower) || ROMAN_NUMERAL.test(lower))) continue;

    // Tên riêng giữa câu được bỏ qua, trừ chữ có dấu sai cấu tạo như "Viẹt", vì tên thật không viết vậy
    if (token.isProperNoun && isAscii) continue;

    const neighbour = (other?: Token) => (other?.isWord ? other.lowerText.normalize('NFC') : null);
    const suggestions = stuckShift
      ? [chars.slice(1).join('')]
      : rankByContext(suggestCorrection(token.text), neighbour(tokens[index - 1]), neighbour(tokens[index + 1]));
    if (token.isProperNoun && suggestions.length === 0) continue;

    // Chữ in hoa trong tiêu đề chỉ báo khi có gợi ý, nếu không dễ là viết tắt
    if ((isAscii || inHeading) && suggestions.length === 0) continue;

    const certain = !inHeading && !token.isProperNoun && !stuckShift && (!isAscii || TELEX_PATTERN.test(lower));
    errors.push({
      luat: 'R1',
      batDau: token.start,
      ketThuc: token.end,
      goc: token.text,
      goiY: suggestions,
      mucDo: certain ? 'chac-chan' : 'nen-xem',
      lyDo: certain
        ? 'Âm tiết không hợp lệ trong tiếng Việt hoặc gõ nhầm Telex/VNI'
        : 'Chữ này không phải âm tiết tiếng Việt, có thể gõ thiếu dấu hoặc là từ nước ngoài'
    });
  }

  return errors;
}
