import { BatchResult, FixStatus, ParagraphInfo, WordScanResult, WordErrorLocation } from './types';
import { detectOldFont } from './fontDetector';
import { SpellError } from '../engine/types';

// Mọi quan hệ có phần chung với vùng chọn. Bỏ sót quan hệ nào là đoạn đó bị quét thiếu mà không báo.
const SELECTED_RELATIONS = new Set<string>([
  'Equal', 'Inside', 'InsideStart', 'InsideEnd',
  'Contains', 'ContainsStart', 'ContainsEnd',
  'OverlapsBefore', 'OverlapsAfter'
]);

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
   * Đọc nội dung văn bản (toàn bộ tài liệu hoặc vùng chọn hiện tại).
   * 
   * ĐẢM BẢO AN TOÀN:
   * Cho dù quét vùng chọn (selection) hay toàn bộ tài liệu (all),
   * chỉ số `index` trả về cho mỗi đoạn văn LUÔN LÀ chỉ số tuyệt đối trong
   * `context.document.body.paragraphs`, tránh tình trạng sửa nhầm đoạn khi quét vùng chọn.
   */
  public static async readDocument(scope: 'all' | 'selection' = 'all'): Promise<WordScanResult> {
    if (!this.isWordAvailable()) {
      // Dữ liệu mẫu giả lập khi chạy trong trình duyệt độc lập để kiểm thử giao diện
      return {
        paragraphs: [
          {
            index: 0,
            text: 'Công ty xản xuất và xắp xếp lại lịch làm việc trân thành.',
            hasTrackedChanges: false,
            isOldFont: false,
            locationType: 'body'
          },
          {
            index: 1,
            text: 'Đội tuyển đã dành giải nhất cuộc thi năm nay.',
            hasTrackedChanges: false,
            isOldFont: false,
            locationType: 'body'
          },
          {
            index: 2,
            text: 'Vấn đề nằm trong trong báo cáo bộ tài chính .',
            hasTrackedChanges: false,
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
      const bodyParagraphs = context.document.body.paragraphs;
      bodyParagraphs.load(['text', 'font/name']);

      let selection: Word.Range | null = null;
      if (scope === 'selection') {
        selection = context.document.getSelection();
        selection.load('text');
      }

      await context.sync();

      // Quyết định đoạn nào cần đọc
      let wanted: number[] = [];
      for (let i = 0; i < bodyParagraphs.items.length; i++) {
        const text = bodyParagraphs.items[i].text;
        if (text && text.trim()) wanted.push(i);
      }

      if (scope === 'selection' && selection) {
        const comparisons = wanted.map(index => ({
          index,
          cmp: bodyParagraphs.items[index].getRange().compareLocationWith(selection!)
        }));
        await context.sync();
        wanted = comparisons.filter(item => SELECTED_RELATIONS.has(item.cmp.value)).map(item => item.index);
      }

      const reviewed = this.loadReviewedText(wanted.map(index => bodyParagraphs.items[index]));
      await context.sync();

      const resultParagraphs: ParagraphInfo[] = [];
      let oldFontCount = 0;

      wanted.forEach((index, position) => {
        const paragraph = bodyParagraphs.items[index];
        const raw = paragraph.text;
        const text = reviewed ? reviewed[position].value : raw;
        const fontName = paragraph.font?.name;
        const fontCheck = detectOldFont(fontName, text);
        if (fontCheck.isOldFont) oldFontCount++;
        if (!text.trim()) return;

        resultParagraphs.push({
          index, // Luôn là chỉ số thực tế trong body
          text,
          hasTrackedChanges: text !== raw,
          isOldFont: fontCheck.isOldFont,
          fontName,
          locationType: 'body'
        });
      });

      return {
        paragraphs: resultParagraphs,
        hasOldFontWarning: oldFontCount > 0,
        oldFontCount,
        totalParagraphs: resultParagraphs.length
      };
    });
  }

  /** Đọc lại một đoạn sau khi sửa để lấy nội dung và vị trí mới */
  public static async readParagraph(paragraphIndex: number): Promise<ParagraphInfo | null> {
    if (!this.isWordAvailable()) return null;

    return await window.Word.run(async (context) => {
      const paragraphs = context.document.body.paragraphs;
      paragraphs.load(['text', 'font/name']);
      await context.sync();

      const paragraph = paragraphs.items[paragraphIndex];
      if (!paragraph) return null;

      const reviewed = this.loadReviewedText([paragraph]);
      await context.sync();

      const raw = paragraph.text;
      const text = reviewed ? reviewed[0].value : raw;
      const fontName = paragraph.font?.name;
      return {
        index: paragraphIndex,
        text,
        hasTrackedChanges: text !== raw,
        isOldFont: detectOldFont(fontName, text).isOldFont,
        fontName,
        locationType: 'body'
      };
    });
  }

  /**
   * Đánh dấu và chọn lỗi trong Word. Đoạn đã đổi hoặc không định vị được đúng chỗ thì không chọn gì.
   */
  public static async selectError(
    paragraphIndex: number,
    error: SpellError,
    expectedText: string
  ): Promise<FixStatus> {
    if (!this.isWordAvailable()) {
      console.log(`[Mock Word] Selected error '${error.goc}' in paragraph ${paragraphIndex}`);
      return 'ok';
    }

    return await window.Word.run(async (context) => {
      const located = await this.locate(context, paragraphIndex, error, expectedText);
      if (typeof located === 'string') return located;
      located.select();
      await context.sync();
      return 'ok' as FixStatus;
    });
  }

  /**
   * Thay thế một lỗi bằng gợi ý được chọn. Chỉ ghi khi đoạn văn còn đúng như lúc quét.
   * Track Changes đang bật thì Word tự ghi nhận thành sửa đổi theo dõi.
   */
  public static async replaceError(
    paragraphIndex: number,
    error: SpellError,
    suggestion: string,
    expectedText: string
  ): Promise<FixStatus> {
    if (!this.isWordAvailable()) {
      console.log(`[Mock Word] Replaced '${error.goc}' -> '${suggestion}' in paragraph ${paragraphIndex}`);
      return 'ok';
    }

    return await window.Word.run(async (context) => {
      const located = await this.locate(context, paragraphIndex, error, expectedText);
      if (typeof located === 'string') return located;
      located.insertText(suggestion, window.Word.InsertLocation.replace);
      await context.sync();
      return 'ok' as FixStatus;
    });
  }

  /**
   * Sửa hàng loạt từ cuối văn bản lên đầu. Sửa từ cuối đoạn lên nên vị trí các lỗi phía trước còn đúng;
   * nội dung mong đợi của đoạn được cập nhật sau mỗi lần ghi.
   */
  public static async batchReplace(items: WordErrorLocation[]): Promise<BatchResult> {
    const result: BatchResult = { succeeded: [], failed: [] };
    if (!items || items.length === 0) return result;

    const sorted = [...items].sort((a, b) => {
      if (a.paragraphIndex !== b.paragraphIndex) return b.paragraphIndex - a.paragraphIndex;
      return b.error.batDau - a.error.batDau;
    });

    const expected = new Map<number, string>();
    for (const item of sorted) {
      const current = expected.get(item.paragraphIndex) ?? item.paragraphText;
      const status = await this.replaceError(item.paragraphIndex, item.error, item.selectedSuggestion, current);
      if (status === 'ok') {
        result.succeeded.push(item.id);
        expected.set(
          item.paragraphIndex,
          current.slice(0, item.error.batDau) + item.selectedSuggestion + current.slice(item.error.ketThuc)
        );
      } else {
        result.failed.push(item.id);
      }
    }

    return result;
  }

  /** getReviewedText thuộc WordApi 1.4; bản cũ hơn thì dùng text thô */
  private static loadReviewedText(paragraphs: Word.Paragraph[]): OfficeExtension.ClientResult<string>[] | null {
    if (!this.checkSupport().is1_4) return null;
    return paragraphs.map(p => p.getReviewedText('Current'));
  }

  /** Định vị lỗi trong đoạn. Mọi trường hợp không chắc chắn đều trả về lý do, không trả về range. */
  private static async locate(
    context: Word.RequestContext,
    paragraphIndex: number,
    error: SpellError,
    expectedText: string
  ): Promise<Word.Range | FixStatus> {
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load('items');
    await context.sync();

    const paragraph = paragraphs.items[paragraphIndex];
    if (!paragraph) return 'stale';

    paragraph.load('text');
    const reviewed = this.loadReviewedText([paragraph]);
    await context.sync();

    const raw = paragraph.text;
    const current = reviewed ? reviewed[0].value : raw;
    if (current !== expectedText) return 'stale';
    if (current.slice(error.batDau, error.ketThuc) !== error.goc) return 'stale';

    const results = paragraph.search(this.escapeSearch(error.goc), { matchCase: true, matchWholeWord: false });
    results.load('items');
    await context.sync();

    const occurrences = this.occurrenceOffsets(current, error.goc);
    const position = occurrences.indexOf(error.batDau);
    if (position === -1) return 'not-found';

    // Chữ đã xóa theo dõi vẫn nằm trong đoạn nên Word có thể tìm ra nhiều hơn số lần hiển thị
    if (results.items.length !== occurrences.length) {
      return raw !== current ? 'tracked' : 'not-found';
    }

    const target = results.items[position];
    target.load('text');
    await context.sync();
    return target.text === error.goc ? target : 'stale';
  }

  /** Vị trí các lần xuất hiện, không chồng lấn, khớp cách đếm của tìm kiếm trong Word */
  private static occurrenceOffsets(text: string, word: string): number[] {
    const offsets: number[] = [];
    let index = text.indexOf(word);
    while (index !== -1) {
      offsets.push(index);
      index = text.indexOf(word, index + word.length);
    }
    return offsets;
  }

  /** Dấu ^ là ký tự điều khiển trong ô tìm kiếm của Word */
  private static escapeSearch(text: string): string {
    return text.replace(/\^/g, '^^');
  }
}
