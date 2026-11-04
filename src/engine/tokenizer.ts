import { decodeVni } from './syllable';

export interface Token {
  text: string;
  lowerText: string;
  start: number;
  end: number;
  isWord: boolean;
  isProperNoun: boolean;
  isIgnored: boolean; // URL, Email, Acronym, Unit, Code
  isAllCaps: boolean; // Viết hoa toàn bộ: có thể là viết tắt hoặc chữ trong tiêu đề
  sentenceIndex: number;
  tokenIndexInSentence: number;
}

export interface Sentence {
  text: string;
  start: number;
  end: number;
  tokens: Token[];
}

// Regex nhận diện các thành phần được miễn trừ
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^(?:https?:\/\/[^\s]+|www\.[^\s]+)$/i;

// Đơn vị đo kỹ thuật điện, thời gian, kích thước, tiền
const UNITS_SET = new Set([
  'kwh', 'mwh', 'gwh', 'twh', 'kva', 'mva', 'kvar', 'mvar', 'kw', 'mw', 'gw', 'tw', 'kv',
  'v', 'a', 'ka', 'ma', 'hz', 'khz', 'mhz', 'ghz', 'm', 'km', 'cm', 'mm', 'mm2', 'm2', 'km2', 'm3',
  'kg', 'mg', 'g', 'ml', 'tấn', 'h', 's', 'ms', 'phút', 'giây', '%', 'đ', 'cos', 'sin', 'tan'
]);

// Mã thiết bị, từ viết tắt ngành điện và văn phòng
const ACRONYMS_SET = new Set([
  'mba', 'tba', 'cbcnv', 'scada', 'ems', 'gis', 'dms', 'evn', 'evnnpc', 'npsc',
  'cmis', 'oms', 'pmis', 'sđt', 'vt', 'kt', 'tnhh', 'mtv', 'hđqt', 'tgđ', 'bđh',
  'pc', 'cpc', 'spc', 'npt', 'khcn', 'scl', 'atld', 'pccc'
]);

// Đơn vị dính sau số. Bản dài xếp trước để không khớp nhầm phần đầu.
const NUMBER_UNITS = [
  'kWh', 'MWh', 'GWh', 'TWh', 'kVAr', 'MVAr', 'kVar', 'MVar', 'kVA', 'MVA', 'kHz', 'MHz', 'GHz',
  'mm2', 'km2', 'kW', 'MW', 'GW', 'TW', 'kV', 'kA', 'mA', 'Hz', 'km', 'cm', 'mm', 'm2', 'm3',
  'kg', 'mg', 'ml', 'ms', 'ha', 'V', 'A', 'W', 'm', 'g', 'l', 'h', 's', 'đ', '%'
].join('|');

// Ranh giới theo Unicode: \b của JavaScript chỉ hiểu ASCII nên "5 mét" sẽ bị cắt thành "5 m" + "ét"
const TOKEN_REGEX = new RegExp(
  [
    '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    'https?:\\/\\/[^\\s]+',
    'www\\.[^\\s]+',
    '(?<![\\p{L}\\p{N}_])MC\\s*\\d+(?![\\p{L}\\p{N}])',
    `(?<![\\p{L}\\p{N}_])\\d+(?:[.,/]\\d+)*(?:\\s?(?:${NUMBER_UNITS}))?(?![\\p{L}\\p{N}])`,
    '[\\p{L}\\p{N}_]+',
    '[^\\s\\p{L}\\p{N}]+'
  ].join('|'),
  'gu'
);

const MC_CODE_REGEX = /^MC\s*\d+$/;
const STARTS_WITH_DIGIT = /^\d/;
const ALL_CAPS_ACRONYM = /^[\p{Lu}\p{N}_]{2,}$/u;
const CAPITALIZED_WORD = /^\p{Lu}\p{Ll}*$/u;
// Hoa thường lẫn lộn kiểu mã hiệu, học vị, tên tệp: TTg, TTr, ThS, kVAr, BaoCao
const MIXED_CASE_CODE = /\p{Ll}\p{Lu}|\p{Lu}{2}\p{Ll}/u;
const WORD_CHAR_REGEX = /^[\p{L}\p{N}_]+$/u;
const HAS_LETTER_REGEX = /\p{L}/u;
const HAS_DIGIT_REGEX = /\p{N}/u;
const NON_LATIN_LETTER = /[^\P{L}\p{Script=Latin}]/u;

/**
 * Tách một chuỗi văn bản thành danh sách câu và token
 * Quét trực tiếp trên toàn chuỗi để bảo đảm không bị ngắt quãng email, URL hay số đo.
 */
export function tokenize(normalizedText: string): { sentences: Sentence[]; allTokens: Token[] } {
  const sentences: Sentence[] = [];
  const allTokens: Token[] = [];

  if (!normalizedText) {
    return { sentences, allTokens };
  }

  const tokenRegex = new RegExp(TOKEN_REGEX);
  let tokMatch: RegExpExecArray | null;
  let currentSentenceTokens: Token[] = [];
  let currentSentenceStart = 0;
  let currentSentenceIndex = 0;
  let tokenIndexInSentence = 0;

  while ((tokMatch = tokenRegex.exec(normalizedText)) !== null) {
    const tokText = tokMatch[0];
    const tokStart = tokMatch.index;
    const tokEnd = tokStart + tokText.length;
    const lower = tokText.toLowerCase();

    let isWord = false;
    let isIgnored = false;
    let isProperNoun = false;
    let isAllCaps = false;

    if (
      EMAIL_REGEX.test(tokText) ||
      URL_REGEX.test(tokText) ||
      MC_CODE_REGEX.test(tokText) ||
      STARTS_WITH_DIGIT.test(tokText)
    ) {
      isIgnored = true;
    } else if (WORD_CHAR_REGEX.test(tokText) && HAS_LETTER_REGEX.test(tokText)) {
      isWord = true;

      if (UNITS_SET.has(lower) || ACRONYMS_SET.has(lower)) {
        isIgnored = true;
      } else if (NON_LATIN_LETTER.test(tokText)) {
        isIgnored = true; // Ký hiệu Hy Lạp, ví dụ cosφ
      } else if (HAS_DIGIT_REGEX.test(tokText) && !decodeVni(tokText)) {
        isIgnored = true; // Mã có chữ và số: T1, Mc171, m2. Từ gõ VNI chưa chuyển vẫn được kiểm tra.
      } else if (ALL_CAPS_ACRONYM.test(tokText)) {
        isIgnored = true;
        isAllCaps = true;
      } else if (MIXED_CASE_CODE.test(tokText)) {
        isIgnored = true;
      } else if (CAPITALIZED_WORD.test(tokText) && tokenIndexInSentence > 0) {
        isProperNoun = true;
      }
    }

    const token: Token = {
      text: tokText,
      lowerText: lower,
      start: tokStart,
      end: tokEnd,
      isWord,
      isProperNoun,
      isIgnored,
      isAllCaps,
      sentenceIndex: currentSentenceIndex,
      tokenIndexInSentence: isWord ? tokenIndexInSentence : -1
    };

    allTokens.push(token);
    currentSentenceTokens.push(token);

    if (isWord) {
      tokenIndexInSentence++;
    }

    // Kiểm tra kết thúc câu: Dấu câu kết thúc câu (.!? hoặc xuống dòng)
    if (/^[.!?\n\r]+$/.test(tokText)) {
      // Chỉ kết thúc câu nếu theo sau là khoảng trắng hoặc hết văn bản
      const nextChar = normalizedText[tokEnd];
      if (!nextChar || /\s/.test(nextChar)) {
        sentences.push({
          text: normalizedText.slice(currentSentenceStart, tokEnd),
          start: currentSentenceStart,
          end: tokEnd,
          tokens: currentSentenceTokens
        });

        currentSentenceIndex++;
        currentSentenceTokens = [];
        currentSentenceStart = tokEnd;
        tokenIndexInSentence = 0;
      }
    }
  }

  // Thu nạp đoạn câu còn lại nếu chưa đóng dấu câu
  if (currentSentenceTokens.length > 0) {
    sentences.push({
      text: normalizedText.slice(currentSentenceStart, normalizedText.length),
      start: currentSentenceStart,
      end: normalizedText.length,
      tokens: currentSentenceTokens
    });
  }

  return { sentences, allTokens };
}
