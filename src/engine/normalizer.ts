import { NormalizedResult } from './types';

/**
 * Chuẩn hóa chuỗi văn bản về Unicode NFC đồng thời tạo bảng ánh xạ
 * vị trí (offset) chính xác về chuỗi gốc (dù chuỗi gốc là NFD, tổ hợp hay dựng sẵn).
 */
export function normalizeWithMapping(originalText: string): NormalizedResult {
  if (!originalText) {
    return {
      text: '',
      toOriginalOffset: () => 0
    };
  }

  // Dùng Intl.Segmenter để tách theo cụm ký tự đồ họa (grapheme cluster)
  // đảm bảo các dấu tổ hợp NFD đi liền với chữ cái gốc được gom thành 1 cụm.
  const segmenter = new Intl.Segmenter('vi', { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(originalText));

  let normalizedText = '';
  // Mảng lưu vị trí gốc tương ứng với từng chỉ số ký tự trong normalizedText
  // indexMap[normIdx] = origOffset
  const indexMap: number[] = [];

  for (const seg of segments) {
    const origStart = seg.index;
    const origEnd = origStart + seg.segment.length;
    const normSegment = seg.segment.normalize('NFC');
    normalizedText += normSegment;

    // Ánh xạ từng ký tự trong normSegment về vị trí gốc
    const normLen = normSegment.length;
    const origLen = origEnd - origStart;

    for (let i = 0; i < normLen; i++) {
      // Tỷ lệ ánh xạ trong trường hợp cụm ký tự biến đổi độ dài
      const mappedOrigOffset = origStart + Math.floor((i / normLen) * origLen);
      indexMap.push(mappedOrigOffset);
    }
  }

  // Điểm cuối cùng (EOF)
  indexMap.push(originalText.length);

  const toOriginalOffset = (normOffset: number): number => {
    if (normOffset <= 0) return 0;
    if (normOffset >= indexMap.length) return originalText.length;
    return indexMap[normOffset];
  };

  return {
    text: normalizedText,
    toOriginalOffset
  };
}
