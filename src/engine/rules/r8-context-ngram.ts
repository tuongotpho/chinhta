import { SpellError, CheckOptions } from '../types';
import { Sentence, Token } from '../tokenizer';
import { bigramCount, getNgramModel, unigramCount } from '../ngram';
import { isValidSyllable } from '../syllable';
import { ENGLISH_ALLOW_SET } from './r1-syllable';

const LETTERS = 'aàáảãạăằắẳẵặâầấẩẫậbcdđeèéẻẽẹêềếểễệghiìíỉĩịklmnoòóỏõọôồốổỗộơờớởỡợpqrstuùúủũụưừứửữựvxyỳýỷỹỵ';
const ONSET_SWAPS: [string, string][] = [
  ['ch', 'tr'], ['s', 'x'], ['d', 'gi'], ['d', 'r'], ['gi', 'r'], ['l', 'n'],
  ['c', 'k'], ['ng', 'ngh'], ['g', 'gh'], ['v', 'd']
];
const CODA_SWAPS: [string, string][] = [['n', 'ng'], ['t', 'c'], ['n', 'nh'], ['t', 'ch'], ['c', 'ch']];

/** Chênh lệch log xác suất tối thiểu để báo; chọn trên nửa dev của VSEC, xem data/NGUON-DU-LIEU.md */
export const R8_THRESHOLD = 8;
const MIN_CANDIDATE_COUNT = 30;
const BACKOFF = 0.05;
const ASCII_WORD = /^[a-z]{3,6}$/;

const candidateCache = new Map<string, string[]>();
let cacheFor: unknown = null;

function candidatesOf(word: string): string[] {
  const model = getNgramModel();
  if (cacheFor !== model) {
    candidateCache.clear();
    cacheFor = model;
  }
  const cached = candidateCache.get(word);
  if (cached) return cached;

  const chars = [...word];
  const variants = new Set<string>();
  for (let i = 0; i < chars.length; i++) {
    const head = chars.slice(0, i).join('');
    const tail = chars.slice(i + 1).join('');
    variants.add(head + tail);
    for (const letter of LETTERS) {
      variants.add(head + letter + tail);
      variants.add(head + letter + chars[i] + tail);
    }
  }
  for (let i = 0; i + 1 < chars.length; i++) {
    const swapped = [...chars];
    [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
    variants.add(swapped.join(''));
  }
  for (const [a, b] of ONSET_SWAPS) {
    for (const [from, to] of [[a, b], [b, a]]) {
      if (word.startsWith(from)) variants.add(to + word.slice(from.length));
    }
  }
  for (const [a, b] of CODA_SWAPS) {
    for (const [from, to] of [[a, b], [b, a]]) {
      if (word.endsWith(from)) variants.add(word.slice(0, word.length - from.length) + to);
    }
  }
  variants.delete(word);

  const result = [...variants].filter(v => unigramCount(v) >= MIN_CANDIDATE_COUNT && isValidSyllable(v));
  candidateCache.set(word, result);
  return result;
}

function logProbability(left: string, right: string, total: number): number {
  const pair = bigramCount(left, right);
  const leftCount = unigramCount(left);
  if (pair > 0 && leftCount > 0) return Math.log(pair / leftCount);
  return Math.log((BACKOFF * Math.max(unigramCount(right), 0.5)) / total);
}

function contextScore(left: string | null, word: string, right: string | null, total: number): number {
  let score = 0;
  if (left) score += logProbability(left, word, total);
  if (right) score += logProbability(word, right, total);
  return score;
}

interface Slot {
  token: Token;
  word: string | null; // null: không dùng làm ngữ cảnh (mã, số, tên riêng)
  check: boolean;
}

/** Xếp gợi ý theo chữ đứng cạnh, sau đó theo độ thông dụng: "dien lực" -> "điện", "dien tích" -> "diện" */
export function rankByContext(candidates: string[], left: string | null, right: string | null): string[] {
  const model = getNgramModel();
  if (!model || candidates.length < 2 || (!left && !right)) return candidates;
  const score = (word: string) =>
    contextScore(left, word, right, model.total) + Math.log(Math.max(unigramCount(word), 1) / model.total) * 0.1;
  return [...candidates].sort((a, b) => score(b) - score(a));
}

function isHeadingWord(token: Token, sentence: Sentence): boolean {
  if (!token.isAllCaps) return false;
  const words = sentence.tokens.filter(t => t.isWord);
  return words.length >= 3 && words.filter(t => t.isAllCaps).length / words.length >= 0.6;
}

/**
 * Luật R8: Âm tiết đúng cấu tạo nhưng lạc ngữ cảnh, phát hiện bằng tần suất cặp âm tiết (Mức: Nên xem).
 * Ví dụ: "kỷ thuật" -> "kỹ thuật", "công xuất" -> "công suất".
 * Chỉ gợi ý, không bao giờ đưa vào sửa hàng loạt. Không có mô hình thì luật không chạy.
 */
export function checkR8ContextNgram(sentences: Sentence[], options?: CheckOptions): SpellError[] {
  const model = getNgramModel();
  if (!model) return [];

  const errors: SpellError[] = [];
  const threshold = options?.r8Threshold ?? R8_THRESHOLD;
  const userDict = new Set((options?.userDictionary || []).map(w => w.toLowerCase().normalize('NFC')));

  for (const sentence of sentences) {
    const slots: (Slot | null)[] = [];
    for (const token of sentence.tokens) {
      if (!token.isWord) {
        // Dấu câu ngắt ngữ cảnh; dấu nối giữa hai chữ cũng vậy
        slots.push(null);
        continue;
      }
      const heading = isHeadingWord(token, sentence);
      const usable = (!token.isIgnored || heading) && !token.isProperNoun;
      const lower = token.lowerText.normalize('NFC');
      const valid = isValidSyllable(lower);
      // Chữ không dấu sai cấu tạo: chỉ báo khi ngữ cảnh chỉ rõ một âm tiết, nên "trog" bị bắt còn từ nước ngoài thì không
      const typoLike = usable && !valid && ASCII_WORD.test(lower) && !ENGLISH_ALLOW_SET.has(lower);
      const known = usable && (unigramCount(lower) > 0 || valid || typoLike);
      slots.push({ token, word: known ? lower : null, check: known && [...lower].length > 1 && (valid || typoLike) });
    }

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot?.check || !slot.word) continue;
      if (userDict.has(slot.word)) continue;

      const left = i > 0 ? slots[i - 1]?.word ?? null : null;
      const right = i + 1 < slots.length ? slots[i + 1]?.word ?? null : null;
      if (!left && !right) continue;

      const base = contextScore(left, slot.word, right, model.total);
      const ranked: { word: string; gain: number }[] = [];
      for (const candidate of candidatesOf(slot.word)) {
        const gain = contextScore(left, candidate, right, model.total) - base;
        if (gain >= threshold) ranked.push({ word: candidate, gain });
      }
      if (ranked.length === 0) continue;

      ranked.sort((a, b) => b.gain - a.gain);
      errors.push({
        luat: 'R8',
        batDau: slot.token.start,
        ketThuc: slot.token.end,
        goc: slot.token.text,
        goiY: ranked.slice(0, 3).map(r => r.word),
        mucDo: 'nen-xem',
        lyDo: 'Chữ này ít khi đi cùng các chữ bên cạnh, có thể gõ nhầm. Cần người đọc xác nhận theo ngữ cảnh.'
      });
    }
  }

  return errors;
}
