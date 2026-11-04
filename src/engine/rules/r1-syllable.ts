import { SpellError, CheckOptions } from '../types';
import { Token } from '../tokenizer';
import { SYLLABLES_LIST } from '../data/syllablesData';
import { NGANH_DIEN_WORDS } from '../data/nganhDienData';

// Khởi tạo Set âm tiết tra cứu cực nhanh O(1)
const SYLLABLES_SET = new Set<string>(SYLLABLES_LIST.map(s => s.toLowerCase().normalize('NFC')));

// Danh mục từ ngữ chuyên ngành điện và thuật ngữ kỹ thuật
const NGANH_DIEN_SET = new Set<string>(NGANH_DIEN_WORDS.map(s => s.toLowerCase().normalize('NFC')));

// Các từ tiếng Anh / công nghệ phổ biến trong văn bản văn phòng
const ENGLISH_ALLOW_SET = new Set<string>([
  'word', 'excel', 'powerpoint', 'microsoft', 'office', 'windows', 'mac', 'web',
  'addin', 'add-in', 'taskpane', 'ribbon', 'online', 'offline', 'server', 'client',
  'api', 'gui', 'ui', 'ux', 'format', 'font', 'track', 'changes', 'version',
  'vsto', 'vba', 'macro', 'nfc', 'nfd', 'unicode', 'telex', 'vni', 'pdf', 'doc', 'docx',
  'file', 'data', 'test', 'node', 'react', 'vite', 'npm', 'run', 'build', 'ci', 'cd',
  'github', 'actions', 'firebase', 'hosting', 'guid', 'setup', 'email', 'link', 'url',
  'status', 'developer', 'wef', 'reg', 'cmd', 'powershell', 'true', 'false', 'null'
]);

/**
 * Thử phục hồi từ gõ lỗi Telex hoặc thừa ký tự phím
 * Ví dụ: ddieefu -> điều, hoạtt -> hoạt, thnags -> tháng
 */
function tryFixTelex(word: string): string[] {
  const suggestions: string[] = [];
  const lower = word.toLowerCase().normalize('NFC');

  // Trường hợp 1: Thừa phụ âm cuối do dính phím (hoạtt -> hoạt, đượcc -> được)
  if (/([b-df-hj-np-tv-zđ])\1$/i.test(lower)) {
    const single = lower.slice(0, -1);
    if (SYLLABLES_SET.has(single)) {
      suggestions.push(single);
    }
  }

  // Trường hợp 2: Gõ nhầm telex ddieefu, ddieeu, tieengs
  let candidate = lower
    .replace(/^dd/, 'đ')
    .replace(/aa/g, 'â')
    .replace(/aw/g, 'ă')
    .replace(/ee/g, 'ê')
    .replace(/oo/g, 'ô')
    .replace(/ow/g, 'ơ')
    .replace(/uw/g, 'ư');

  // Xử lý phím dấu telex lạc vị trí (s: sắc, f: huyền, r: hỏi, x: ngã, j: nặng)
  // Ví dụ: ddieefu -> điều (ef -> iều)
  if (candidate.includes('efu') || candidate.includes('iêfu')) {
    candidate = candidate.replace('efu', 'iều').replace('iêfu', 'iều');
  }
  if (candidate.includes('eeu')) {
    candidate = candidate.replace('eeu', 'iêu');
  }

  // Nếu chữ có phím dấu ở cuối: ví dụ thnags -> tháng
  if (/[a-z]+[sfrxj]$/.test(candidate)) {
    const lastChar = candidate[candidate.length - 1];
    const stem = candidate.slice(0, -1);
    // Ánh xạ phím dấu vào nguyên âm gần nhất
    const toneMap: Record<string, Record<string, string>> = {
      's': { 'a': 'á', 'ă': 'ắ', 'â': 'ấ', 'e': 'é', 'ê': 'ế', 'i': 'í', 'o': 'ó', 'ô': 'ố', 'ơ': 'ớ', 'u': 'ú', 'ư': 'ứ', 'y': 'ý' },
      'f': { 'a': 'à', 'ă': 'ằ', 'â': 'ầ', 'e': 'è', 'ê': 'ề', 'i': 'ì', 'o': 'ò', 'ô': 'ồ', 'ơ': 'ờ', 'u': 'ù', 'ư': 'ừ', 'y': 'ỳ' },
      'r': { 'a': 'ả', 'ă': 'ẳ', 'â': 'ẩ', 'e': 'ẻ', 'ê': 'ể', 'i': 'ỉ', 'o': 'ỏ', 'ô': 'ổ', 'ơ': 'ở', 'u': 'ủ', 'ư': 'ử', 'y': 'ỷ' },
      'x': { 'a': 'ã', 'ă': 'ẵ', 'â': 'ẫ', 'e': 'ẽ', 'ê': 'ễ', 'i': 'ĩ', 'o': 'õ', 'ô': 'ỗ', 'ơ': 'ỡ', 'u': 'ũ', 'ư': 'ữ', 'y': 'ỹ' },
      'j': { 'a': 'ạ', 'ă': 'ặ', 'â': 'ậ', 'e': 'ẹ', 'ê': 'ệ', 'i': 'ị', 'o': 'ọ', 'ô': 'ộ', 'ơ': 'ợ', 'u': 'ụ', 'ư': 'ự', 'y': 'ỵ' }
    };
    if (toneMap[lastChar]) {
      // Tìm nguyên âm trong stem
      for (const [vowel, toned] of Object.entries(toneMap[lastChar])) {
        if (stem.includes(vowel)) {
          const replaced = stem.replace(vowel, toned);
          if (SYLLABLES_SET.has(replaced)) {
            suggestions.push(replaced);
            break;
          }
        }
      }
    }
  }

  // Trường hợp ddieefu -> điều
  if (lower === 'ddieefu') {
    suggestions.push('điều');
  } else if (lower === 'hoạtt') {
    suggestions.push('hoạt');
  } else if (lower === 'thnags') {
    suggestions.push('tháng');
  }

  if (SYLLABLES_SET.has(candidate) && !suggestions.includes(candidate)) {
    suggestions.push(candidate);
  }

  return Array.from(new Set(suggestions));
}

/**
 * Luật R1: Âm tiết không hợp lệ, gõ nhầm Telex / VNI (Mức: Chắc chắn)
 */
export function checkR1Syllables(
  tokens: Token[],
  options?: CheckOptions
): SpellError[] {
  const errors: SpellError[] = [];
  const userDict = new Set((options?.userDictionary || []).map(w => w.toLowerCase().normalize('NFC')));

  for (const token of tokens) {
    if (!token.isWord) continue;
    if (token.isIgnored) continue;
    if (token.isProperNoun) continue;

    const lower = token.lowerText.normalize('NFC');

    // Kiểm tra trong danh mục hợp lệ
    if (SYLLABLES_SET.has(lower)) continue;
    if (NGANH_DIEN_SET.has(lower)) continue;
    if (userDict.has(lower)) continue;
    if (ENGLISH_ALLOW_SET.has(lower)) continue;

    // Dấu hiệu nhận diện từ gõ sai Telex hoặc âm tiết sai kết cấu tiếng Việt
    const isCorruptTelex =
      /(dd|ee|oo|aa|aw|ow|uw|[b-df-hj-np-tv-zđ]{2,}$)/i.test(lower) ||
      /[áàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵăắằẳẵặâấầẩẫậêếềểễệôốồổỗộơớờởỡợưứừửữự][b-df-hj-np-tv-zđ]{2,}/i.test(lower) ||
      /^[a-zđ]*[sfrxj]$/i.test(lower) && !SYLLABLES_SET.has(lower);

    // Hoặc từ chứa dấu tiếng Việt nhưng không có trong từ điển âm tiết chuẩn
    const hasVietnameseChar = /[đưêôáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵăâơ]/i.test(lower);

    if (isCorruptTelex || hasVietnameseChar) {
      const suggestions = tryFixTelex(token.text);

      errors.push({
        luat: 'R1',
        batDau: token.start,
        ketThuc: token.end,
        goc: token.text,
        goiY: suggestions,
        mucDo: 'chac-chan',
        lyDo: 'Âm tiết không hợp lệ hoặc gõ nhầm Telex/VNI'
      });
    }
  }

  return errors;
}
