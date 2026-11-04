/**
 * Đổi văn bản gõ bằng bảng mã cũ (TCVN3 / ABC, VNI Windows) sang Unicode.
 * Chỉ là bảng tra cố định, không gọi mạng, không dùng AI.
 */
import { detectOldFont } from './fontDetector';

export type LegacyEncoding = 'tcvn3' | 'vni';

/** Từng cặp: ký tự bảng mã TCVN3, rồi chữ Unicode tương ứng. Riêng ư là mã 0xAD (dấu gạch mềm) nên viết bằng mã. */
const TCVN3_PAIRS =
  'µà¶ả·ã¸á¹ạ¨ă»ằ¼ẳ½ẵ¾ắÆặ©âÇầÈẩÉẫÊấËậ®đ' +
  'ÌèÎẻÏẽÐéÑẹªêÒềÓểÔễÕếÖệ×ìØỉÜĩÝíÞị' +
  'ßòáỏâõãóäọ«ôåồæổçỗèốéộ¬ơêờëởìỡíớîợ' +
  'ïùñủòũóúôụ­ưõừöử÷ữøứùựúỳûỷüỹýýþỵ' +
  '¡Ă¢Â§Đ£Ê¤Ô¥Ơ¦Ư';

const TCVN3_MAP = new Map<string, string>();
for (let i = 0; i < TCVN3_PAIRS.length; i += 2) {
  TCVN3_MAP.set(TCVN3_PAIRS[i], TCVN3_PAIRS[i + 1]);
}

const VNI_PAIRS = new Map<string, string>();
const VNI_SINGLE = new Map<string, string>();

/** Dấu thanh dùng chung: sắc, huyền, hỏi, ngã, nặng */
const TONES = ['ù', 'ø', 'û', 'õ', 'ï'];
/** Dấu cho â, ê, ô: mũ, sắc, huyền, hỏi, ngã, nặng */
const HAT_TONES = ['â', 'á', 'à', 'å', 'ã', 'ä'];
/** Dấu cho ă: trăng, sắc, huyền, hỏi, ngã, nặng */
const BREVE_TONES = ['ê', 'é', 'è', 'ú', 'ü', 'ë'];

function addVni(base: string, marks: string[], letters: string): void {
  marks.forEach((mark, i) => {
    VNI_PAIRS.set(base + mark, letters[i]);
    VNI_PAIRS.set(base + mark.toUpperCase(), letters[i]);
    VNI_PAIRS.set(base.toUpperCase() + mark.toUpperCase(), letters[i].toUpperCase());
    VNI_PAIRS.set(base.toUpperCase() + mark, letters[i].toUpperCase());
  });
}

addVni('a', TONES, 'áàảãạ');
addVni('a', HAT_TONES, 'âấầẩẫậ');
addVni('a', BREVE_TONES, 'ăắằẳẵặ');
addVni('e', TONES, 'éèẻẽẹ');
addVni('e', HAT_TONES, 'êếềểễệ');
addVni('o', TONES, 'óòỏõọ');
addVni('o', HAT_TONES, 'ôốồổỗộ');
addVni('ô', TONES, 'ớờởỡợ');
addVni('u', TONES, 'úùủũụ');
addVni('ö', TONES, 'ứừửữự');
addVni('y', TONES, 'ýỳỷỹỵ');

for (const [from, to] of [
  ['í', 'í'], ['ì', 'ì'], ['æ', 'ỉ'], ['ó', 'ĩ'], ['ò', 'ị'],
  ['î', 'ỵ'], ['ñ', 'đ'], ['ô', 'ơ'], ['ö', 'ư']
]) {
  VNI_SINGLE.set(from, to);
  VNI_SINGLE.set(from.toUpperCase(), to.toUpperCase());
}

/** Chữ đặc trưng Unicode tiếng Việt không có trong hai bảng mã cũ: gặp là từ đã ở Unicode */
const UNICODE_ONLY = /[ĂăĐđĨĩŨũƠơƯưẠ-ỹ]/;

export function isLegacyFontName(fontName?: string): boolean {
  const lower = (fontName ?? '').toLowerCase().trim();
  return lower.startsWith('.vn') || lower.startsWith('vni-') || lower === 'vnitimes' || lower === 'tcvn3';
}

/** Bộ font TCVN3 chữ hoa (.VnTimeH, .VnArialH...): mã chữ thường hiển thị thành chữ hoa */
function isUppercaseFont(fontName?: string): boolean {
  return /^\.vn.*h$/i.test((fontName ?? '').trim());
}

/** Đoán bảng mã: theo tên font trước, không có thì theo chính nội dung */
export function detectLegacyEncoding(fontName?: string, sampleText?: string): LegacyEncoding | null {
  if (isLegacyFontName(fontName)) {
    return (fontName ?? '').toLowerCase().trim().startsWith('vni') ? 'vni' : 'tcvn3';
  }
  const check = detectOldFont(undefined, sampleText);
  if (check.reason === 'tcvn3-encoding') return 'tcvn3';
  if (check.reason === 'vni-encoding') return 'vni';
  return null;
}

/** Font Unicode thay thế, giữ đúng kiểu chữ có chân hay không chân */
export function unicodeFontFor(fontName?: string): string {
  const lower = (fontName ?? '').toLowerCase();
  if (/arial|helve|avant|avo/.test(lower)) return 'Arial';
  if (/courier/.test(lower)) return 'Courier New';
  return 'Times New Roman';
}

function convertVni(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const pair = VNI_PAIRS.get(text.slice(i, i + 2));
    if (pair) {
      out += pair;
      i++;
    } else {
      out += VNI_SINGLE.get(text[i]) ?? text[i];
    }
  }
  return out;
}

/** Đổi một đoạn chữ. Chữ đã ở Unicode được giữ nguyên để không đổi hai lần. */
export function convertLegacyText(text: string, encoding: LegacyEncoding, fontName?: string): string {
  if (UNICODE_ONLY.test(text)) return text;
  const converted = encoding === 'vni'
    ? convertVni(text)
    : Array.from(text, ch => TCVN3_MAP.get(ch) ?? ch).join('');
  return isUppercaseFont(fontName) ? converted.toLocaleUpperCase('vi') : converted;
}
