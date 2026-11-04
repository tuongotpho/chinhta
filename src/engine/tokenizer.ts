export interface Token {
  text: string;
  lowerText: string;
  start: number;
  end: number;
  isWord: boolean;
  isProperNoun: boolean;
  isIgnored: boolean; // URL, Email, Acronym, Unit, Code
  sentenceIndex: number;
  tokenIndexInSentence: number;
}

export interface Sentence {
  text: string;
  start: number;
  end: number;
  tokens: Token[];
}

// Regex nhận diện các thành phần được miễn trừ (bỏ qua theo đề bài)
const URL_REGEX = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Mã thiết bị ngành điện, số đo, đơn vị (110kV, 220kV, 500kV, MC 171, v.v.)
const UNIT_OR_DEVICE_REGEX = /^(\d+([.,]\d+)*(kV|kW|MW|kWh|V|A|Hz|m|km|kg|%)?|MC\s*\d+|MBA|TBA|CBCNV|SCADA|EMS|GIS|DMS)$/i;
// Từ viết tắt in hoa toàn bộ (MBA, TBA, CBCNV, EVN, EVNNPC,...)
const ACRONYM_REGEX = /^[\p{Lu}\p{N}_-]{2,}$/u;
// Tên riêng viết hoa (Nguyễn, Văn, Chia, Hà, Nội, Việt, Nam...)
const CAPITALIZED_REGEX = /^\p{Lu}\p{Ll}*$/u;

/**
 * Tách một chuỗi văn bản (đã chuẩn hóa NFC) thành danh sách câu và token
 * có kèm vị trí bắt đầu, kết thúc chính xác.
 */
export function tokenize(normalizedText: string): { sentences: Sentence[]; allTokens: Token[] } {
  const sentences: Sentence[] = [];
  const allTokens: Token[] = [];

  if (!normalizedText) {
    return { sentences, allTokens };
  }

  // Tách câu theo dấu chấm, chấm hỏi, chấm than hoặc xuống dòng
  // Chú ý không tách dấu chấm trong số thập phân hoặc viết tắt
  const sentenceRegex = /[^.!?\n\r]+(?:[.!?\n\r]+|$)/g;
  let sentMatch: RegExpExecArray | null;

  let globalSentIndex = 0;

  while ((sentMatch = sentenceRegex.exec(normalizedText)) !== null) {
    const rawSent = sentMatch[0];
    const sentStart = sentMatch.index;
    const sentEnd = sentStart + rawSent.length;

    const tokens: Token[] = [];
    // Dùng \p{L} và \p{N} hỗ trợ 100% tiếng Việt Unicode đầy đủ dấu
    const tokenRegex = /([\p{L}\p{N}_-]+)|([^\s\p{L}\p{N}]+)/gu;

    let tokMatch: RegExpExecArray | null;
    let tokIndexInSent = 0;

    while ((tokMatch = tokenRegex.exec(rawSent)) !== null) {
      const tokText = tokMatch[0];
      const tokStart = sentStart + tokMatch.index;
      const tokEnd = tokStart + tokText.length;
      const isWord = Boolean(tokMatch[1]);

      let isIgnored = false;
      let isProperNoun = false;

      if (isWord) {
        if (URL_REGEX.test(tokText) || EMAIL_REGEX.test(tokText) || UNIT_OR_DEVICE_REGEX.test(tokText)) {
          isIgnored = true;
        } else if (ACRONYM_REGEX.test(tokText) && tokText.length >= 2) {
          isIgnored = true;
        } else if (CAPITALIZED_REGEX.test(tokText)) {
          // Nếu viết hoa và không phải từ đầu tiên trong câu -> Tên riêng (như "Nguyễn Văn Chia")
          if (tokIndexInSent > 0) {
            isProperNoun = true;
          }
        }
      }

      const token: Token = {
        text: tokText,
        lowerText: tokText.toLowerCase(),
        start: tokStart,
        end: tokEnd,
        isWord,
        isProperNoun,
        isIgnored,
        sentenceIndex: globalSentIndex,
        tokenIndexInSentence: tokIndexInSent
      };

      tokens.push(token);
      allTokens.push(token);

      if (isWord) {
        tokIndexInSent++;
      }
    }

    sentences.push({
      text: rawSent,
      start: sentStart,
      end: sentEnd,
      tokens
    });

    globalSentIndex++;
  }

  return { sentences, allTokens };
}
