import { SpellError } from '../types';

/**
 * Luật R4: Lỗi dấu câu và khoảng trắng (Mức: Chắc chắn)
 * Ví dụ: "công ty ,trách nhiệm ." -> "công ty, trách nhiệm."
 */
export function checkR4Typography(normalizedText: string): SpellError[] {
  const errors: SpellError[] = [];

  if (!normalizedText) return errors;

  // 1. Khoảng trắng trước dấu câu: " ," " ." " :" " ;" " ?" " !"
  // Ví dụ: "công ty ,trách nhiệm"
  const spaceBeforePunctRegex = /(\p{L}|\p{N})(\s+)([,.:;?!])/gu;
  let match: RegExpExecArray | null;

  while ((match = spaceBeforePunctRegex.exec(normalizedText)) !== null) {
    const charBefore = match[1];
    const spaces = match[2];
    const punct = match[3];

    // Vị trí lỗi là cụm khoảng trắng + dấu câu
    const start = match.index + charBefore.length;
    const end = start + spaces.length + punct.length;
    const original = normalizedText.slice(start, end);

    errors.push({
      luat: 'R4',
      batDau: start,
      ketThuc: end,
      goc: original,
      goiY: [punct],
      mucDo: 'chac-chan',
      lyDo: `Không đặt dấu cách trước dấu câu '${punct}'`
    });
  }

  // 2. Thiếu khoảng trắng sau dấu câu khi nối tiếp chữ cái: "công ty,trách nhiệm" -> "công ty, trách nhiệm"
  // Tránh bắt nhầm URL (vd: abc.com) hoặc số thập phân (vd: 3.14 hoặc 1,5)
  const missingSpaceAfterRegex = /(?<!https?:\/\/\S*)(?<!www\.\S*)(?<!\d)([,;:])(\p{L})/gu;

  while ((match = missingSpaceAfterRegex.exec(normalizedText)) !== null) {
    const punct = match[1];
    const letterAfter = match[2];
    const start = match.index;
    const end = start + punct.length + letterAfter.length;
    const original = normalizedText.slice(start, end);

    errors.push({
      luat: 'R4',
      batDau: start,
      ketThuc: end,
      goc: original,
      goiY: [`${punct} ${letterAfter}`],
      mucDo: 'chac-chan',
      lyDo: `Cần có dấu cách sau dấu '${punct}' trước từ tiếp theo`
    });
  }

  // 3. Khoảng trắng thừa liên tiếp (2 dấu cách trở lên)
  const multipleSpacesRegex = /[^\S\r\n]{2,}/g;

  while ((match = multipleSpacesRegex.exec(normalizedText)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    const original = match[0];

    errors.push({
      luat: 'R4',
      batDau: start,
      ketThuc: end,
      goc: original,
      goiY: [' '],
      mucDo: 'chac-chan',
      lyDo: 'Thừa dấu cách liên tiếp'
    });
  }

  return errors;
}
