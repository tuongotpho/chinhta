import { SpellError } from '../engine/types';

export interface ParagraphInfo {
  index: number;
  /** Văn bản đang hiệu lực: khi có Track Changes thì không gồm chữ đã xóa */
  text: string;
  /** Đoạn đang có sửa đổi theo dõi nên văn bản hiển thị khác dữ liệu thô */
  hasTrackedChanges: boolean;
  isOldFont: boolean;
  fontName?: string;
  locationType: 'body' | 'table';
}

export interface WordScanResult {
  paragraphs: ParagraphInfo[];
  hasOldFontWarning: boolean;
  oldFontCount: number;
  totalParagraphs: number;
}

export interface WordErrorLocation {
  id: string;
  paragraphIndex: number;
  /** Nội dung đoạn lúc quét, dùng để phát hiện đoạn đã đổi trước khi ghi */
  paragraphText: string;
  error: SpellError;
  selectedSuggestion: string;
}

/**
 * Kết quả một lần sửa.
 * - ok: đã ghi vào tài liệu
 * - stale: đoạn đã đổi so với lúc quét, không ghi
 * - not-found: không định vị được đúng chỗ, không ghi
 * - tracked: đoạn có sửa đổi theo dõi làm không xác định được đúng lần xuất hiện, không ghi
 */
export type FixStatus = 'ok' | 'stale' | 'not-found' | 'tracked';

export interface BatchResult {
  succeeded: string[];
  failed: string[];
}

export interface OldFontConvertResult {
  /** Số đoạn đã đổi */
  paragraphs: number;
  /** Số từ đã đổi */
  words: number;
  /** Số đoạn bỏ qua vì đang có sửa đổi theo dõi */
  skippedTracked: number;
  /** Số từ bỏ qua vì lẫn nhiều font trong một từ */
  skippedMixed: number;
}
