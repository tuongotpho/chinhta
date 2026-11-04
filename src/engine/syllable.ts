import { getNgramModel, unigramCount } from './ngram';

/**
 * Kiểm tra âm tiết tiếng Việt theo quy tắc cấu tạo:
 *   âm tiết = [phụ âm đầu] + vần (âm đệm + âm chính + âm cuối) + thanh
 *
 * - Không dùng danh sách liệt kê thủ công, bao quát toàn bộ âm tiết tiếng Việt hợp lệ.
 * - Chấp nhận CẢ HAI kiểu đặt dấu thanh: cũ (hoà, thuỷ) và mới (hòa, thủy).
 * - Không phụ thuộc Word, chạy được trong Node và Web Worker.
 */

// Thứ tự thanh: 0 ngang, 1 sắc, 2 huyền, 3 hỏi, 4 ngã, 5 nặng
const TONE_TABLE: Record<string, string> = {
  a: 'aáàảãạ', ă: 'ăắằẳẵặ', â: 'âấầẩẫậ',
  e: 'eéèẻẽẹ', ê: 'êếềểễệ',
  i: 'iíìỉĩị',
  o: 'oóòỏõọ', ô: 'ôốồổỗộ', ơ: 'ơớờởỡợ',
  u: 'uúùủũụ', ư: 'ưứừửữự',
  y: 'yýỳỷỹỵ'
};

const CHAR_INFO = new Map<string, { base: string; tone: number }>();
for (const [base, forms] of Object.entries(TONE_TABLE)) {
  [...forms].forEach((ch, tone) => CHAR_INFO.set(ch, { base, tone }));
}

const VOWELS = new Set(Object.keys(TONE_TABLE));
const HAT_VOWELS = new Set(['ă', 'â', 'ê', 'ô', 'ơ', 'ư']);

const ONSETS = [
  'ngh', 'ng', 'gh', 'gi', 'kh', 'nh', 'ph', 'th', 'tr', 'ch', 'qu',
  'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'
];

// Vần mở (không có phụ âm cuối; bán âm cuối i/y/o/u nằm trong vần)
const OPEN_RHYMES = [
  'a', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
  'ai', 'ao', 'au', 'ay', 'âu', 'ây', 'eo', 'êu', 'ia', 'iu',
  'oi', 'ôi', 'ơi', 'ua', 'ui', 'ưa', 'ưi', 'ưu', 'uy', 'oa', 'oe', 'uê', 'uơ',
  'oai', 'oay', 'oao', 'oeo', 'uây', 'uôi', 'ươi', 'ươu', 'iêu', 'yêu', 'uya', 'uyu'
];

// Âm chính (có thể kèm âm đệm) + các phụ âm cuối được phép
const CLOSED_NUCLEI: Record<string, string[]> = {
  a: ['m', 'n', 'ng', 'nh', 'p', 't', 'c', 'ch'],
  ă: ['m', 'n', 'ng', 'p', 't', 'c'],
  â: ['m', 'n', 'ng', 'p', 't', 'c'],
  e: ['m', 'n', 'ng', 'p', 't', 'c'],
  ê: ['m', 'n', 'nh', 'p', 't', 'ch'],
  i: ['m', 'n', 'nh', 'p', 't', 'ch'],
  o: ['m', 'n', 'ng', 'p', 't', 'c'],
  oo: ['ng', 'c'],
  ô: ['m', 'n', 'ng', 'p', 't', 'c'],
  ơ: ['m', 'n', 'p', 't'],
  u: ['m', 'n', 'ng', 'p', 't', 'c'],
  ư: ['m', 'n', 'ng', 't', 'c'],
  iê: ['m', 'n', 'ng', 'p', 't', 'c'],
  yê: ['m', 'n', 'ng', 'p', 't', 'c'],
  uô: ['m', 'n', 'ng', 't', 'c'],
  ươ: ['m', 'n', 'ng', 'p', 't', 'c'],
  oa: ['m', 'n', 'ng', 'nh', 'p', 't', 'c', 'ch'],
  oă: ['m', 'n', 'ng', 't', 'c'],
  oe: ['n', 't'],
  uâ: ['n', 'ng', 't'],
  uê: ['nh', 'ch'],
  uy: ['n', 'nh', 't', 'ch', 'p'],
  uyê: ['n', 't']
};

// "y" làm âm chính có âm cuối chỉ đi sau "qu": quýt, quỳnh, quých
CLOSED_NUCLEI.y = ['n', 'nh', 't', 'ch'];

const STOP_CODAS = new Set(['p', 't', 'c', 'ch']);

interface Rhyme {
  nucleus: string; // phần nguyên âm của vần
  coda: string;    // phụ âm cuối ('' nếu vần mở)
}

const RHYMES = new Map<string, Rhyme>();
for (const r of OPEN_RHYMES) RHYMES.set(r, { nucleus: r, coda: '' });
for (const [nuc, codas] of Object.entries(CLOSED_NUCLEI)) {
  for (const c of codas) RHYMES.set(nuc + c, { nucleus: nuc, coda: c });
}

/** Tách dấu thanh: trả về chuỗi gốc (giữ â ă ê ô ơ ư đ) và thanh, hoặc null nếu có >1 dấu thanh */
export function stripTone(word: string): { base: string; tone: number; tonePos: number } | null {
  let base = '';
  let tone = 0;
  let tonePos = -1;
  const chars = [...word];
  for (let i = 0; i < chars.length; i++) {
    const info = CHAR_INFO.get(chars[i]);
    if (info) {
      base += info.base;
      if (info.tone !== 0) {
        if (tone !== 0) return null;
        tone = info.tone;
        tonePos = i;
      }
    } else {
      base += chars[i];
    }
  }
  return { base, tone, tonePos };
}

interface Parsed {
  onset: string;
  rhyme: string;
  rhymeStart: number;
  info: Rhyme;
}

const FRONT = new Set(['i', 'e', 'ê', 'y']);

function onsetSpellingOk(onset: string, rhyme: string): boolean {
  const first = rhyme[0];
  switch (onset) {
    case 'k': return FRONT.has(first);
    // "c" không đứng trước âm đệm: coa, cuyên, cuân phải viết với "qu"
    case 'c': return !FRONT.has(first) && !/^(oa|oă|oe|uâ|uê|uy|uơ)/.test(rhyme);
    case 'gh':
    case 'ngh': return first === 'i' || first === 'e' || first === 'ê';
    case 'g':
    case 'ng': return !(first === 'i' || first === 'e' || first === 'ê');
    case 'qu': return first !== 'u' && first !== 'o';
    default: return true;
  }
}

/** Phân tích chuỗi gốc (đã bỏ thanh) thành phụ âm đầu + vần */
export function parseBase(base: string): Parsed | null {
  const tryParse = (onset: string, rhyme: string): Parsed | null => {
    const info = RHYMES.get(rhyme);
    if (!info) return null;
    // "yê..." chỉ đứng đầu âm tiết (yên, yêu) hoặc đi với phụ âm "qu" (quyết, quyền, quyến...)
    // "iê..." cần các phụ âm đầu khác (tiên, kiêu)
    if (rhyme.startsWith('yê') && onset !== '' && onset !== 'qu') return null;
    if (rhyme.startsWith('iê') && (onset === '' || onset === 'qu')) return null;
    if (info.nucleus === 'y' && info.coda && onset !== 'qu') return null;
    // Âm đệm "o"/"u" đứng sau "qu" là thừa
    if (onset === 'qu' && (rhyme.startsWith('o') || rhyme.startsWith('u'))) return null;
    if (onset && !onsetSpellingOk(onset, rhyme)) return null;
    return { onset, rhyme, rhymeStart: onset.length, info };
  };

  for (const onset of ONSETS) {
    if (!base.startsWith(onset)) continue;
    const rest = base.slice(onset.length);
    if (!rest) {
      // "gi" đứng một mình: gi + i (vd: "gì")
      if (onset === 'gi') return { onset: 'g', rhyme: 'i', rhymeStart: 1, info: RHYMES.get('i')! };
      continue;
    }
    const p = tryParse(onset, rest);
    if (p) return p;
    // "gi" + vần bắt đầu bằng phụ âm hoặc "ê": gìn = g + in, giêng = g + iêng
    if (onset === 'gi') {
      const rhyme = 'i' + rest;
      const info = RHYMES.get(rhyme);
      if (info) return { onset: 'g', rhyme, rhymeStart: 1, info };
    }
    // Chỉ thử phụ âm đầu dài nhất khớp được (tránh "ng" + "h...")
    if (onset.length > 1 && onset !== 'gi') return null;
  }
  // Không có phụ âm đầu
  if (base.length > 0 && VOWELS.has(base[0])) return tryParse('', base);
  return null;
}

/** Các vị trí (trong toàn từ) được phép đặt dấu thanh — gồm cả kiểu cũ và kiểu mới */
function allowedTonePositions(p: Parsed): number[] {
  const nuc = p.info.nucleus;
  const start = p.rhymeStart;
  const hatIdx: number[] = [];
  [...nuc].forEach((ch, i) => { if (HAT_VOWELS.has(ch)) hatIdx.push(i); });

  if (hatIdx.length > 0) return [start + hatIdx[hatIdx.length - 1]];
  if (p.info.coda) return [start + nuc.length - 1];
  if (nuc.length === 1) return [start];
  if (nuc.length === 2) {
    if (nuc === 'oa' || nuc === 'oe' || nuc === 'uy') return [start, start + 1];
    return [start];
  }
  return [start + 1];
}

/** Vị trí dấu thanh theo kiểu mới (dùng khi sinh gợi ý) */
function preferredTonePosition(p: Parsed): number {
  const pos = allowedTonePositions(p);
  return pos[pos.length - 1];
}

/**
 * Kiểm tra xem một từ có phải là âm tiết tiếng Việt chuẩn xác hay không.
 */
const SPECIAL_VALID_WORDS = new Set([
  'đắk', 'lắk', 'krông', 'pơ', 'brau', 'choòng', 'xoong', 'coong', 'loong', 'ba', 'tơ', 'hleo', 'đrăng',
  'kạn', 'kon', 'ea'
]);

export function isValidSyllable(word: string): boolean {
  if (!word) return false;
  const lower = word.toLowerCase().normalize('NFC');
  if (SPECIAL_VALID_WORDS.has(lower)) return true;
  const s = stripTone(lower);
  if (!s) return false;
  const p = parseBase(s.base);
  if (!p) return false;

  // QUY TẮC CỐT LÕI: Vần có âm cuối tắc (p, t, c, ch) CHỈ ĐI VỚI thanh sắc (1) hoặc nặng (5).
  // Tuyệt đối không thể đi với thanh ngang (0), huyền (2), hỏi (3), ngã (4)!
  if (STOP_CODAS.has(p.info.coda)) {
    if (s.tone !== 1 && s.tone !== 5) return false;
  }

  // Nếu có dấu thanh, vị trí dấu thanh phải hợp lệ (theo kiểu cũ hoặc kiểu mới)
  if (s.tone !== 0 && !allowedTonePositions(p).includes(s.tonePos)) return false;
  return true;
}

/** Đặt thanh vào chuỗi gốc theo kiểu mới. Trả về null nếu chuỗi gốc không thể mang thanh này. */
export function applyTone(base: string, tone: number): string | null {
  const p = parseBase(base);
  if (!p) return null;
  if (tone === 0) {
    if (STOP_CODAS.has(p.info.coda)) return null; // Âm cuối tắc không thể có thanh ngang
    return base;
  }
  if (STOP_CODAS.has(p.info.coda) && tone !== 1 && tone !== 5) return null;
  const chars = [...base];
  const pos = preferredTonePosition(p);
  const forms = TONE_TABLE[chars[pos]];
  if (!forms) return null;
  chars[pos] = [...forms][tone];
  return chars.join('');
}

// ---------------- Gợi ý sửa lỗi gõ Telex / VNI / Nhầm lẫn ----------------

const TELEX_TONES: Record<string, number> = { s: 1, f: 2, r: 3, x: 4, j: 5 };

function applyTelexModifiers(s: string): string {
  return s
    .replace(/^dd/, 'đ')
    .replace(/uow/g, 'ươ')
    .replace(/uwow/g, 'ươ')
    .replace(/aa/g, 'â')
    .replace(/aw/g, 'ă')
    .replace(/ee/g, 'ê')
    .replace(/oo/g, 'ô')
    .replace(/ow/g, 'ơ')
    .replace(/uw/g, 'ư')
    .replace(/^w/, 'ư')
    .replace(/([^aeiouyâăêôơư])w/g, '$1ư');
}

/**
 * Giải mã chuỗi Telex gõ sai vị trí hoặc dính phím
 */
export function decodeTelex(word: string): string[] {
  const lower = word.toLowerCase().normalize('NFC');
  const s = stripTone(lower);
  if (!s) return [];
  const results = new Set<string>();
  const chars = [...s.base];

  const candidates: { str: string; tone: number }[] = [{ str: s.base, tone: s.tone }];
  for (let i = 1; i < chars.length; i++) {
    const t = TELEX_TONES[chars[i]];
    if (t === undefined) continue;
    if (chars.slice(0, i).some(c => VOWELS.has(c))) {
      candidates.push({ str: chars.slice(0, i).join('') + chars.slice(i + 1).join(''), tone: t });
    }
  }

  for (const c of candidates) {
    const base = applyTelexModifiers(c.str);
    const out = applyTone(base, c.tone);
    if (out && out !== lower && isValidSyllable(out)) results.add(out);
  }
  return [...results];
}

const VNI_MODS: Record<string, (c: string) => string | null> = {
  '6': c => ({ a: 'â', e: 'ê', o: 'ô' } as Record<string, string>)[c] ?? null,
  '7': c => ({ o: 'ơ', u: 'ư' } as Record<string, string>)[c] ?? null,
  '8': c => (c === 'a' ? 'ă' : null),
  '9': c => (c === 'd' ? 'đ' : null)
};

/** Giải mã từ gõ VNI chưa chuyển (vd: "vie65t" → "việt", "trưcj" → "trực") */
export function decodeVni(word: string): string | null {
  const lower = word.toLowerCase().normalize('NFC');
  if (!/[1-9j]/.test(lower)) return null;

  // Hỗ trợ trường hợp gõ telex/vni lẫn: trưcj -> trực
  if (lower.endsWith('j')) {
    const stem = lower.slice(0, -1);
    const res = applyTone(stem, 5);
    if (res && isValidSyllable(res)) return res;
  }

  let tone = 0;
  const out: string[] = [];
  for (const ch of lower) {
    if (ch >= '1' && ch <= '5') { tone = Number(ch); continue; }
    if (ch >= '6' && ch <= '9') {
      let done = false;
      for (let i = out.length - 1; i >= 0; i--) {
        const r = VNI_MODS[ch](out[i]);
        if (r) {
          out[i] = r;
          if (ch === '7' && out[i] === 'ơ' && out[i - 1] === 'u') out[i - 1] = 'ư';
          done = true;
          break;
        }
      }
      if (!done) return null;
      continue;
    }
    if (ch === '0') return null;
    out.push(ch);
  }

  const res = applyTone(out.join(''), tone);
  return res && isValidSyllable(res) ? res : null;
}

const DEACCENT: Record<string, string> = { đ: 'd', ă: 'a', â: 'a', ê: 'e', ô: 'o', ơ: 'o', ư: 'u' };

/** Bỏ toàn bộ dấu: "điện" -> "dien" */
export function deaccent(word: string): string {
  const s = stripTone(word);
  const base = s ? s.base : word;
  return [...base].map(ch => DEACCENT[ch] ?? ch).join('');
}

let accentIndexFor: unknown = null;
let accentIndex = new Map<string, string[]>();

/** Tra các âm tiết có dấu từ dạng không dấu, xếp theo tần suất. Cần mô hình n-gram. */
function accentCandidates(plain: string): string[] {
  const model = getNgramModel();
  if (!model) return [];
  if (accentIndexFor !== model) {
    accentIndex = new Map();
    for (const word of model.words) {
      if (word.length > 7 || !isValidSyllable(word)) continue;
      const key = deaccent(word);
      const list = accentIndex.get(key);
      if (list) list.push(word);
      else accentIndex.set(key, [word]);
    }
    accentIndexFor = model;
  }
  return accentIndex.get(plain) ?? [];
}

const MIN_SUGGESTION_COUNT = 30;

/**
 * Sinh danh sách từ gợi ý sửa lỗi cho một âm tiết sai quy tắc.
 * Có mô hình tần suất thì chỉ giữ âm tiết thật sự được dùng và xếp từ thông dụng lên trước,
 * vì vậy "đươc" gợi ý "được" chứ không phải "đước".
 */
export function suggestCorrection(word: string): string[] {
  const lower = word.toLowerCase().normalize('NFC');
  const suggestions = new Set<string>();
  const s = stripTone(lower);

  // 1. Phục hồi dấu đặt sai vị trí: baó -> báo, ngươì -> người
  if (s && s.tone !== 0) {
    const fixed = applyTone(s.base, s.tone);
    if (fixed && isValidSyllable(fixed)) suggestions.add(fixed);
  }

  // 2. Thừa ký tự cuối do kẹt phím: hoạtt -> hoạt, củaa -> của
  const chars = [...lower];
  if (chars.length > 2 && chars[chars.length - 1] === chars[chars.length - 2]) {
    const single = chars.slice(0, -1).join('');
    if (isValidSyllable(single)) suggestions.add(single);
  }

  // 3. Âm cuối tắc thiếu thanh: kêt -> kết, duyêt -> duyệt
  if (s && s.tone === 0) {
    for (const tone of [1, 5]) {
      const toned = applyTone(s.base, tone);
      if (toned && isValidSyllable(toned)) suggestions.add(toned);
    }
  }

  // 4. Giải mã Telex: ddieefu -> điều, tieengs -> tiếng
  for (const t of decodeTelex(lower)) suggestions.add(t);

  // 5. Giải mã VNI
  const vni = decodeVni(lower);
  if (vni) suggestions.add(vni);

  // 6. Dấu Telex cuối từ, có thể kèm gõ đảo: thnags -> tháng, Ddienj -> điện
  const toneKey = TELEX_TONES[chars[chars.length - 1]];
  if (toneKey !== undefined && chars.length > 2) {
    const stem = chars.slice(0, -1);
    const variants = [stem.join('')];
    for (let i = 0; i + 1 < stem.length; i++) {
      const swapped = [...stem];
      [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
      variants.push(swapped.join(''));
    }
    for (const variant of variants) {
      const base = applyTelexModifiers(variant);
      const fixed = applyTone(base, toneKey);
      if (fixed && isValidSyllable(fixed)) suggestions.add(fixed);
      const wantsD = base.startsWith('đ');
      for (const candidate of accentCandidates(deaccent(base))) {
        const info = stripTone(candidate);
        if (info?.tone === toneKey && (!wantsD || candidate.startsWith('đ'))) suggestions.add(candidate);
      }
    }
  }

  // 7. Đảo hai ký tự liền nhau: thôgn -> thông, cogn -> công
  for (let i = 0; i + 1 < chars.length; i++) {
    const swapped = [...chars];
    [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
    const candidate = swapped.join('');
    if (isValidSyllable(candidate)) suggestions.add(candidate);
    for (const accented of accentCandidates(deaccent(candidate)).slice(0, 2)) suggestions.add(accented);
  }

  // 8. Thiếu dấu hoàn toàn: dien -> điện, tiep -> tiếp
  for (const accented of accentCandidates(deaccent(lower)).slice(0, 3)) suggestions.add(accented);

  // 9. Lặp ký tự giữa từ do kẹt phím: cachh -> cách, ttheo -> theo, chayyj -> chạy
  if (suggestions.size === 0) {
    const collapsed = chars.filter((ch, i) => ch !== chars[i - 1]).join('');
    if (collapsed !== lower) {
      if (isValidSyllable(collapsed)) suggestions.add(collapsed);
      for (const item of suggestCorrection(collapsed)) suggestions.add(item);
    }
  }

  suggestions.delete(lower);
  const list = [...suggestions];
  if (!getNgramModel()) return list;

  const known = list.filter(item => unigramCount(item) >= MIN_SUGGESTION_COUNT);
  return known.sort((a, b) => unigramCount(b) - unigramCount(a)).slice(0, 4);
}
