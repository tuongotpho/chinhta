/**
 * Nhận diện font chữ và bảng mã cũ (TCVN3 / ABC, VNI)
 * để cảnh báo người dùng và bỏ qua, tránh việc báo hàng loạt lỗi ảo.
 */

// Danh sách tên font TCVN3 / ABC và VNI phổ biến
const OLD_FONT_NAMES = new Set([
  '.vntime', '.vntimeh', '.vnarial', '.vnavant', '.vntime narrow',
  'vni-times', 'vni-avo', 'vni-helve', 'vni-aptima', 'vni-broad', 'vni-top',
  'tcvn3', 'vni-telex', 'vni-times', 'vnitimes'
]);

// Ký tự đặc trưng của bảng mã TCVN3 (ABC 1 byte)
// ví dụ: µ, ¸, ¶, ·, ¹, ¨, », ¾, ¼, ½
// Các dấu ©, ®, ½ có thể xuất hiện đơn lẻ trong văn bản Unicode, nên phải gặp nhiều lần mới kết luận.
const TCVN3_CHAR_REGEX = /[µ¸¶·¹¨»§«¬ÖË]/g;
const TCVN3_MIN_MATCHES = 3;

// Tổ hợp chỉ có ở bảng mã VNI Windows: chữ gốc + ký tự dấu rời như "coâng", "Vieät", "ñieän"
const VNI_CHAR_REGEX = /[aeo][âãäåæçéèêë]|ñ[aeiou]|ö[ôõ]/gi;
const VNI_MIN_MATCHES = 2;

export interface FontCheckResult {
  isOldFont: boolean;
  reason?: 'font-name' | 'tcvn3-encoding' | 'vni-encoding';
  fontName?: string;
}

export function detectOldFont(fontName?: string, sampleText?: string): FontCheckResult {
  if (fontName) {
    const lowerFont = fontName.toLowerCase().trim();
    if (OLD_FONT_NAMES.has(lowerFont) || lowerFont.startsWith('.vn') || lowerFont.startsWith('vni-')) {
      return {
        isOldFont: true,
        reason: 'font-name',
        fontName
      };
    }
  }

  if (sampleText) {
    if ((sampleText.match(TCVN3_CHAR_REGEX)?.length ?? 0) >= TCVN3_MIN_MATCHES) {
      return {
        isOldFont: true,
        reason: 'tcvn3-encoding',
        fontName: fontName || 'TCVN3'
      };
    }

    if ((sampleText.match(VNI_CHAR_REGEX)?.length ?? 0) >= VNI_MIN_MATCHES) {
      return {
        isOldFont: true,
        reason: 'vni-encoding',
        fontName: fontName || 'VNI'
      };
    }
  }

  return { isOldFont: false };
}
