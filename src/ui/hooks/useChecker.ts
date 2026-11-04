import { useState, useCallback, useRef } from 'react';
import { WordService } from '../../word/wordService';
import { isLegacyFontName } from '../../word/legacyEncoding';
import { checkLayout, LayoutIssue } from '../../word/layoutCheck';
import { checkParagraphsWithWorker } from '../../engine/workerClient';
import { prepareEngine } from '../loadModel';
import { SpellError, CheckOptions } from '../../engine/types';
import { FixStatus, ParagraphInfo, WordErrorLocation } from '../../word/types';

export interface DisplayErrorItem {
  id: string;
  paragraphIndex: number;
  paragraphText: string;
  error: SpellError;
  selectedSuggestion: string;
}

export interface Notice {
  intent: 'success' | 'warning' | 'error';
  text: string;
}

/** Dấu cách đầu dòng có thể đang căn biểu mẫu nên phải sửa từng mục */
export function isLayoutBatchEligible(issue: LayoutIssue): boolean {
  return issue.fixable && issue.kind !== 'lead-space';
}

const layoutKey = (issue: LayoutIssue) => `${issue.kind}|${issue.paragraphText}`;

/** Chỉ tự động sửa lỗi chắc chắn và có đúng một cách sửa; còn lại phải có người chọn */
export function isBatchEligible(item: DisplayErrorItem): boolean {
  return item.error.mucDo === 'chac-chan' && item.error.goiY.length === 1;
}

const FIX_FAILURE_TEXT: Record<Exclude<FixStatus, 'ok'>, string> = {
  stale: 'Đoạn văn đã thay đổi so với lúc quét nên chưa sửa. Danh sách lỗi của đoạn này đã được quét lại.',
  'not-found': 'Không xác định được đúng vị trí trong Word nên chưa sửa. Hãy sửa tay chỗ này.',
  tracked: 'Đoạn này có sửa đổi theo dõi nên không xác định được đúng vị trí. Hãy chấp nhận hoặc từ chối sửa đổi rồi quét lại.'
};

const ignoreKey = (item: DisplayErrorItem) => `${item.paragraphIndex}|${item.error.luat}|${item.error.goc}`;

function toItems(paragraph: ParagraphInfo, errors: SpellError[]): DisplayErrorItem[] {
  return errors.map((error, i) => ({
    id: `p${paragraph.index}-e${i}-${error.batDau}`,
    paragraphIndex: paragraph.index,
    paragraphText: paragraph.text,
    error,
    selectedSuggestion: error.goiY.length > 0 ? error.goiY[0] : error.goc
  }));
}

export function useChecker(userDictionary: string[]) {
  const [items, setItems] = useState<DisplayErrorItem[]>([]);
  const [ignored, setIgnored] = useState<Set<string>>(new Set());
  const [layoutIssues, setLayoutIssues] = useState<LayoutIssue[]>([]);
  const ignoredLayout = useRef<Set<string>>(new Set());
  const lastScope = useRef<'all' | 'selection'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [oldFontWarning, setOldFontWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Tùy chọn kiểm tra (R7 tắt theo đề bài, R8 chỉ ở mức Nên xem)
  const [options, setOptions] = useState<CheckOptions>({
    enableR1: true,
    enableR2: true,
    enableR3: true,
    enableR4: true,
    enableR5: true,
    enableR6: true,
    enableR7: false,
    enableR8: true
  });

  const checkOptions: CheckOptions = { ...options, userDictionary };

  const scan = useCallback(async (scope: 'all' | 'selection' = 'all', keepIgnored = false) => {
    lastScope.current = scope;
    if (!keepIgnored) ignoredLayout.current = new Set();
    setIsScanning(true);
    setOldFontWarning(null);
    setNotice(null);

    try {
      await prepareEngine();
      const scanResult = await WordService.readDocument(scope);
      if (scanResult.hasOldFontWarning) {
        const fonts = [...new Set(scanResult.paragraphs.filter(p => p.isOldFont && isLegacyFontName(p.fontName)).map(p => p.fontName))];
        setOldFontWarning(
          `Phát hiện ${scanResult.oldFontCount} đoạn dùng font hoặc bảng mã cũ${fonts.length ? ` (${fonts.join(', ')})` : ' (TCVN3 hoặc VNI)'}. Các đoạn này chưa được soát lỗi. Hãy đổi sang Unicode rồi quét lại.`
        );
      }

      const validParagraphs = scanResult.paragraphs.filter(p => !p.isOldFont);
      if (scope === 'selection' && validParagraphs.length === 0) {
        setNotice({ intent: 'warning', text: 'Không đọc được đoạn văn nào trong vùng chọn. Hãy chọn lại hoặc quét toàn bộ.' });
      }

      // Chạy kiểm tra bất đồng bộ trong Web Worker để không đơ giao diện
      const batchErrors = await checkParagraphsWithWorker(validParagraphs.map(p => p.text), checkOptions);
      const found = validParagraphs.flatMap((p, i) => toItems(p, batchErrors[i] || []));
      setItems(keepIgnored ? found.filter(item => !ignored.has(ignoreKey(item))) : found);
      if (!keepIgnored) setIgnored(new Set());
      // Vùng chọn quá ít đoạn để kết luận font chủ đạo của văn bản
      setLayoutIssues(
        checkLayout(scanResult.paragraphs, { checkFont: scope === 'all' })
          .filter(issue => !ignoredLayout.current.has(layoutKey(issue)))
      );
      setHasScanned(true);
    } catch (e) {
      console.error('Lỗi khi quét tài liệu Word:', e);
      setNotice({ intent: 'error', text: `Không quét được tài liệu: ${(e as Error).message ?? e}` });
    } finally {
      setIsScanning(false);
    }
  }, [options, userDictionary, ignored]);

  /** Quét lại các đoạn vừa đổi để danh sách lỗi và vị trí luôn khớp tài liệu */
  const rescanParagraphs = async (indexes: number[]) => {
    const fresh: ParagraphInfo[] = [];
    for (const index of new Set(indexes)) {
      const paragraph = await WordService.readParagraph(index);
      if (paragraph && !paragraph.isOldFont && paragraph.text.trim()) fresh.push(paragraph);
    }
    const errors = await checkParagraphsWithWorker(fresh.map(p => p.text), checkOptions);
    const replacement = fresh.flatMap((p, i) => toItems(p, errors[i] || []));
    const touched = new Set(indexes);
    setItems(prev => [
      ...prev.filter(i => !touched.has(i.paragraphIndex)),
      ...replacement.filter(i => !ignored.has(ignoreKey(i)))
    ].sort((a, b) => a.paragraphIndex - b.paragraphIndex || a.error.batDau - b.error.batDau));
  };

  const removeLocally = (ids: Set<string>) => setItems(prev => prev.filter(i => !ids.has(i.id)));

  const selectInWord = async (item: DisplayErrorItem) => {
    const status = await WordService.selectError(item.paragraphIndex, item.error, item.paragraphText);
    if (status !== 'ok') {
      setNotice({ intent: 'warning', text: FIX_FAILURE_TEXT[status] });
      if (status === 'stale') await rescanParagraphs([item.paragraphIndex]);
    }
  };

  const fixError = async (item: DisplayErrorItem, suggestion?: string) => {
    if (item.error.goiY.length === 0) return false;
    setNotice(null);

    try {
      const status = await WordService.replaceError(
        item.paragraphIndex,
        item.error,
        suggestion || item.selectedSuggestion,
        item.paragraphText
      );
      if (status === 'ok' && !WordService.isWordAvailable()) {
        removeLocally(new Set([item.id]));
      } else if (status === 'ok' || status === 'stale') {
        await rescanParagraphs([item.paragraphIndex]);
      }
      if (status !== 'ok') setNotice({ intent: 'warning', text: FIX_FAILURE_TEXT[status] });
      return status === 'ok';
    } catch (e) {
      setNotice({ intent: 'error', text: `Không sửa được: ${(e as Error).message ?? e}` });
      return false;
    }
  };

  const ignoreError = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) setIgnored(prev => new Set(prev).add(ignoreKey(item)));
    removeLocally(new Set([itemId]));
  };

  /** Từ vừa thêm vào từ điển không còn là lỗi, kể cả các chỗ khác trong tài liệu */
  const dropWord = (word: string) => {
    const lower = word.toLowerCase();
    setItems(prev => prev.filter(i => i.error.goc.toLowerCase() !== lower));
  };

  const batchFixSure = async (): Promise<void> => {
    const eligible = items.filter(isBatchEligible);
    if (eligible.length === 0) return;
    setNotice(null);

    const locations: WordErrorLocation[] = eligible.map(i => ({
      id: i.id,
      paragraphIndex: i.paragraphIndex,
      paragraphText: i.paragraphText,
      error: i.error,
      selectedSuggestion: i.selectedSuggestion
    }));

    try {
      const { succeeded, failed } = await WordService.batchReplace(locations);
      if (WordService.isWordAvailable()) {
        await rescanParagraphs(eligible.map(i => i.paragraphIndex));
      } else {
        removeLocally(new Set(succeeded));
      }
      setNotice(
        failed.length === 0
          ? { intent: 'success', text: `Đã sửa ${succeeded.length} lỗi.` }
          : { intent: 'warning', text: `Đã sửa ${succeeded.length} lỗi, ${failed.length} lỗi chưa sửa được và vẫn còn trong danh sách.` }
      );
    } catch (e) {
      setNotice({ intent: 'error', text: `Sửa hàng loạt bị gián đoạn: ${(e as Error).message ?? e}. Hãy quét lại.` });
    }
  };

  /** Đổi bảng mã cũ sang Unicode rồi quét lại, vì mọi vị trí lỗi cũ không còn đúng */
  const convertOldFonts = async (): Promise<void> => {
    setNotice(null);
    try {
      const result = await WordService.convertOldFonts();
      await scan('all');
      const skipped = [
        result.skippedTracked ? `${result.skippedTracked} đoạn có sửa đổi theo dõi` : '',
        result.skippedMixed ? `${result.skippedMixed} từ lẫn nhiều font` : ''
      ].filter(Boolean).join(', ');
      setNotice({
        intent: skipped ? 'warning' : 'success',
        text: `Đã đổi ${result.paragraphs} đoạn (${result.words} từ) sang Unicode${skipped ? `, bỏ qua ${skipped}` : ''}. Hãy đọc lại văn bản trước khi lưu.`
      });
    } catch (e) {
      setNotice({ intent: 'error', text: `Đổi bảng mã bị gián đoạn: ${(e as Error).message ?? e}. Bấm Ctrl+Z để hoàn tác rồi thử lại.` });
    }
  };

  const selectLayout = async (issue: LayoutIssue): Promise<void> => {
    setNotice(null);
    try {
      const status = await WordService.selectParagraph(issue.paragraphIndex, issue.paragraphText);
      if (status !== 'ok') await reportLayoutFailure(status);
    } catch (e) {
      setNotice({ intent: 'error', text: `Không chọn được đoạn: ${(e as Error).message ?? e}` });
    }
  };

  /** Đoạn đã đổi thì danh sách cũ không còn đúng, quét lại rồi mới báo */
  const reportLayoutFailure = async (status: Exclude<FixStatus, 'ok'>): Promise<void> => {
    await scan(lastScope.current, true);
    setNotice({ intent: 'warning', text: FIX_FAILURE_TEXT[status] });
  };

  /** Sửa trình bày có thể đổi số đoạn và vị trí chữ nên luôn quét lại */
  const fixLayout = async (issue: LayoutIssue): Promise<void> => {
    setNotice(null);
    try {
      const status = await WordService.fixLayout(issue);
      if (status === 'ok') await scan(lastScope.current, true);
      else await reportLayoutFailure(status);
    } catch (e) {
      setNotice({ intent: 'error', text: `Không sửa được: ${(e as Error).message ?? e}` });
    }
  };

  const ignoreLayout = (issue: LayoutIssue): void => {
    ignoredLayout.current.add(layoutKey(issue));
    setLayoutIssues(prev => prev.filter(i => i.id !== issue.id));
  };

  const batchFixLayout = async (): Promise<void> => {
    setNotice(null);
    // Từ cuối lên vì sửa dòng giãn có thể thêm đoạn. Trong một đoạn, mục không đổi chữ làm trước.
    const eligible = layoutIssues.filter(isLayoutBatchEligible).sort((a, b) =>
      b.paragraphIndex - a.paragraphIndex || Number(a.kind === 'soft-break') - Number(b.kind === 'soft-break'));
    let done = 0;
    try {
      for (const issue of eligible) {
        if ((await WordService.fixLayout(issue)) === 'ok') done++;
      }
      await scan(lastScope.current, true);
      const failed = eligible.length - done;
      setNotice(failed === 0
        ? { intent: 'success', text: `Đã sửa ${done} mục trình bày.` }
        : { intent: 'warning', text: `Đã sửa ${done} mục, ${failed} mục chưa sửa được và vẫn còn trong danh sách.` });
    } catch (e) {
      setNotice({ intent: 'error', text: `Sửa hàng loạt bị gián đoạn: ${(e as Error).message ?? e}. Hãy quét lại.` });
    }
  };

  const updateSuggestion = (itemId: string, suggestion: string) => {
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, selectedSuggestion: suggestion } : i))
    );
  };

  return {
    items,
    layoutIssues,
    isScanning,
    hasScanned,
    oldFontWarning,
    notice,
    options,
    setOptions,
    scan,
    selectInWord,
    fixError,
    ignoreError,
    dropWord,
    batchFixSure,
    convertOldFonts,
    selectLayout,
    fixLayout,
    ignoreLayout,
    batchFixLayout,
    updateSuggestion
  };
}
