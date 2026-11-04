import { SpellError } from '../types';

interface ToneStylePair {
  cu: string;
  moi: string;
}

const TONE_STYLE_PAIRS: ToneStylePair[] = [
  { cu: 'hoà', moi: 'hòa' },
  { cu: 'toà', moi: 'tòa' },
  { cu: 'xoà', moi: 'xòa' },
  { cu: 'khoẻ', moi: 'khỏe' },
  { cu: 'toé', moi: 'tóe' },
  { cu: 'loé', moi: 'lóe' },
  { cu: 'thuỷ', moi: 'thủy' },
  { cu: 'thuý', moi: 'thúy' },
  { cu: 'huỷ', moi: 'hủy' },
  { cu: 'luỹ', moi: 'lũy' },
  { cu: 'tuỳ', moi: 'tùy' },
  { cu: 'quỷ', moi: 'quỷ' },
  { cu: 'kỹ', moi: 'kĩ' }
];

function buildBoundaryRegex(word: string): RegExp {
  const pre = '(?<=^|[^\\p{L}\\p{N}])';
  const post = '(?=$|[^\\p{L}\\p{N}])';
  return new RegExp(`${pre}${word}${post}`, 'giu');
}

const COMPILED_R7 = TONE_STYLE_PAIRS.map(pair => ({
  regex: buildBoundaryRegex(pair.cu),
  pair
}));

/**
 * Luật R7: Thống nhất kiểu bỏ dấu hoà/hòa, thuỷ/thủy, kỹ/kĩ (Mức: Gợi ý, Mặc định tắt)
 */
export function checkR7ToneStyle(normalizedText: string): SpellError[] {
  const errors: SpellError[] = [];

  for (const { regex, pair } of COMPILED_R7) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(normalizedText)) !== null) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;

      let suggestion = pair.moi;
      if (matchText[0] === matchText[0].toUpperCase()) {
        suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
      }

      errors.push({
        luat: 'R7',
        batDau: start,
        ketThuc: end,
        goc: matchText,
        goiY: [suggestion],
        mucDo: 'goi-y',
        lyDo: `Gợi ý thống nhất kiểu đặt dấu thanh hiện đại '${suggestion}' thay cho kiểu cũ '${matchText}'`
      });
    }
  }

  return errors;
}
