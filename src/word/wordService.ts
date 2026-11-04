import { ParagraphInfo, WordScanResult, WordErrorLocation } from './types';
import { detectOldFont } from './fontDetector';
import { SpellError } from '../engine/types';

/**
 * Lớp WordService đóng gói toàn bộ tương tác với Microsoft Word qua Office.js (Word.run).
 * Toàn bộ logic Word chỉ nằm trong module này, độc lập hoàn toàn với src/engine/.
 */
export class WordService {
  /**
   * Kiểm tra môi trường có đang chạy bên trong Microsoft Word hay không
   */
  public static isWordAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.Word !== 'undefined' &&
      typeof window.Office !== 'undefined' &&
      Boolean(window.Office.context)
    );
  }

  /**
   * Kiểm tra mức hỗ trợ WordApi
   */
  public static checkSupport(): { is1_3: boolean; is1_4: boolean; is1_7: boolean } {
    if (!this.isWordAvailable()) {
      return { is1_3: false, is1_4: false, is1_7: false };
    }
    const context = window.Office.context;
    return {
      is1_3: context.requirements?.isSetSupported('WordApi', '1.3') ?? false,
      is1_4: context.requirements?.isSetSupported('WordApi', '1.4') ?? false,
      is1_7: context.requirements?.isSetSupported('WordApi', '1.7') ?? false
    };
  }

  /**
   * Đọc nội dung văn bản (toàn bộ tài liệu hoặc vùng chọn hiện tại)
   */
  public static async readDocument(scope: 'all' | 'selection' = 'all'): Promise<WordScanResult> {
    if (!this.isWordAvailable()) {
      // Dữ liệu mẫu giả lập khi chạy trong trình duyệt độc lập để kiểm thử giao diện
      return {
        paragraphs: [
          {
            index: 0,
            text: 'Công ty xản xuất và xắp xếp lại lịch làm việc trân thành.',
            isOldFont: false,
            locationType: 'body'
          },
          {
            index: 1,
            text: 'Đội tuyển đã dành giải nhất cuộc thi năm nay.',
            isOldFont: false,
            locationType: 'body'
          },
          {
            index: 2,
            text: 'Vấn đề nằm trong trong báo cáo bộ tài chính .',
            isOldFont: false,
            locationType: 'body'
          }
        ],
        hasOldFontWarning: false,
        oldFontCount: 0,
        totalParagraphs: 3
      };
    }

    return await window.Word.run(async (context) => {
      let paragraphs: Word.ParagraphCollection;

      if (scope === 'selection') {
        const selection = context.document.getSelection();
        paragraphs = selection.paragraphs;
      } else {
        paragraphs = context.document.body.paragraphs;
      }

      // Tải text và font của từng đoạn văn
      paragraphs.load(['text', 'font/name']);
      await context.sync();

      const resultParagraphs: ParagraphInfo[] = [];
      let oldFontCount = 0;

      for (let i = 0; i < paragraphs.items.length; i++) {
        const p = paragraphs.items[i];
        const text = p.text;

        // Bỏ qua đoạn rỗng
        if (!text || !text.trim()) continue;

        const fontName = p.font?.name;
        const fontCheck = detectOldFont(fontName, text);

        if (fontCheck.isOldFont) {
          oldFontCount++;
        }

        resultParagraphs.push({
          index: i,
          text,
          isOldFont: fontCheck.isOldFont,
          fontName,
          locationType: 'body'
        });
      }

      return {
        paragraphs: resultParagraphs,
        hasOldFontWarning: oldFontCount > 0,
        oldFontCount,
        totalParagraphs: resultParagraphs.length
      };
    });
  }

  /**
   * Đánh dấu và chọn (Select) lỗi trong văn bản Word để người dùng quan sát
   */
  public static async selectError(
    paragraphIndex: number,
    error: SpellError
  ): Promise<boolean> {
    if (!this.isWordAvailable()) {
      console.log(`[Mock Word] Selected error '${error.goc}' in paragraph ${paragraphIndex}`);
      return true;
    }

    return await window.Word.run(async (context) => {
      const paragraphs = context.document.body.paragraphs;
      paragraphs.load('items');
      await context.sync();

      if (paragraphIndex >= paragraphs.items.length) return false;

      const p = paragraphs.items[paragraphIndex];
      // Tìm từ lỗi trong đoạn
      const searchResults = p.search(error.goc, { matchCase: true, matchWholeWord: false });
      searchResults.load('items');
      await context.sync();

      if (searchResults.items.length === 0) return false;

      // Xác định lần xuất hiện đúng vị trí tương đối
      const targetRange = this.findMatchingRange(p.text, error.goc, error.batDau, searchResults.items);
      if (targetRange) {
        targetRange.select();
        await context.sync();
        return true;
      }

      // Mặc định chọn kết quả đầu tiên nếu không so khớp được offset
      searchResults.items[0].select();
      await context.sync();
      return true;
    });
  }

  /**
   * Thay thế một lỗi chính tả bằng từ gợi ý được chọn
   */
  public static async replaceError(
    paragraphIndex: number,
    error: SpellError,
    suggestion: string
  ): Promise<boolean> {
    if (!this.isWordAvailable()) {
      console.log(`[Mock Word] Replaced '${error.goc}' -> '${suggestion}' in paragraph ${paragraphIndex}`);
      return true;
    }

    return await window.Word.run(async (context) => {
      const paragraphs = context.document.body.paragraphs;
      paragraphs.load('items');
      await context.sync();

      if (paragraphIndex >= paragraphs.items.length) return false;

      const p = paragraphs.items[paragraphIndex];
      p.load('text');
      await context.sync();

      // Tìm kiếm cụm từ trong đoạn
      const searchResults = p.search(error.goc, { matchCase: true, matchWholeWord: false });
      searchResults.load(['items', 'text']);
      await context.sync();

      if (searchResults.items.length === 0) return false;

      const targetRange = this.findMatchingRange(p.text, error.goc, error.batDau, searchResults.items);
      if (!targetRange) return false;

      // Kiểm tra an toàn: So sánh text của range với từ gốc trước khi ghi
      targetRange.load('text');
      await context.sync();

      if (targetRange.text.trim() !== error.goc.trim()) {
        console.warn('Văn bản trong tài liệu đã thay đổi, hủy thao tác ghi để bảo đảm an toàn.');
        return false;
      }

      // Thực hiện thay thế (nếu Track Changes đang bật, Word tự động ghi nhận là thay đổi có theo dõi)
      targetRange.insertText(suggestion, window.Word.InsertLocation.replace);
      await context.sync();

      return true;
    });
  }

  /**
   * Sửa hàng loạt danh sách lỗi theo thứ tự từ cuối văn bản lên đầu (bottom-up)
   * để không bị lệch offset các vị trí phía trên
   */
  public static async batchReplace(
    items: WordErrorLocation[]
  ): Promise<number> {
    if (!items || items.length === 0) return 0;

    // Sắp xếp giảm dần theo chỉ số đoạn văn, và giảm dần theo vị trí batDau trong đoạn
    const sorted = [...items].sort((a, b) => {
      if (a.paragraphIndex !== b.paragraphIndex) {
        return b.paragraphIndex - a.paragraphIndex;
      }
      return b.error.batDau - a.error.batDau;
    });

    let successCount = 0;
    for (const item of sorted) {
      const ok = await this.replaceError(item.paragraphIndex, item.error, item.selectedSuggestion);
      if (ok) successCount++;
    }

    return successCount;
  }

  /**
   * Tìm đúng Word.Range trong danh sách search results ứng với vị trí offset mong muốn
   */
  private static findMatchingRange(
    paragraphText: string,
    word: string,
    targetOffset: number,
    ranges: Word.Range[]
  ): Word.Range | null {
    if (ranges.length === 1) return ranges[0];

    // Đếm số lần xuất hiện của từ trước targetOffset trong đoạn văn
    let countBefore = 0;
    let pos = 0;

    while (pos < targetOffset) {
      const idx = paragraphText.indexOf(word, pos);
      if (idx === -1 || idx >= targetOffset) break;
      countBefore++;
      pos = idx + word.length;
    }

    if (countBefore < ranges.length) {
      return ranges[countBefore];
    }

    return ranges[0];
  }
}
