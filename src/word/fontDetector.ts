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
const TCVN3_CHAR_REGEX = /[µ¸¶·¹¨»¾¼½§©®™]/;

// Ký tự đặc trưng của bảng mã VNI Windows
const VNI_CHAR_REGEX = /[àáâãèéêìíòóôõùúý][1-8]/i;

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
    if (TCVN3_CHAR_REGEX.test(sampleText)) {
      return {
        isOldFont: true,
        reason: 'tcvn3-encoding',
        fontName: fontName || 'TCVN3'
      };
    }

    if (VNI_CHAR_REGEX.test(sampleText)) {
      return {
        isOldFont: true,
        reason: 'vni-encoding',
        fontName: fontName || 'VNI'
      };
    }
  }

  return { isOldFont: false };
}
