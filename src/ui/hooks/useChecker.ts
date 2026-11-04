import { useState, useCallback } from 'react';
import { WordService } from '../../word/wordService';
import { checkParagraph } from '../../engine/checker';
import { SpellError, CheckOptions } from '../../engine/types';
import { WordErrorLocation } from '../../word/types';

export interface DisplayErrorItem {
  id: string;
  paragraphIndex: number;
  error: SpellError;
  selectedSuggestion: string;
}

export function useChecker(userDictionary: string[]) {
  const [items, setItems] = useState<DisplayErrorItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [oldFontWarning, setOldFontWarning] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalParagraphs: 0, totalErrors: 0 });

  // Tùy chọn kiểm tra (mặc định R7 tắt theo đề bài)
  const [options, setOptions] = useState<CheckOptions>({
    enableR1: true,
    enableR2: true,
    enableR3: true,
    enableR4: true,
    enableR5: true,
    enableR6: true,
    enableR7: false
  });

  const scan = useCallback(async (scope: 'all' | 'selection' = 'all') => {
    setIsScanning(true);
    setOldFontWarning(null);

    try {
      const scanResult = await WordService.readDocument(scope);
      if (scanResult.hasOldFontWarning) {
        setOldFontWarning(
          `Phát hiện ${scanResult.oldFontCount} đoạn văn bản sử dụng font chữ hoặc bảng mã cũ (TCVN3 / .VnTime hoặc VNI). Các đoạn này đã được tự động bỏ qua để tránh báo lỗi ảo.`
        );
      }

      const checkOpts: CheckOptions = {
        ...options,
        userDictionary
      };

      const collected: DisplayErrorItem[] = [];

      for (const p of scanResult.paragraphs) {
        if (p.isOldFont) continue; // Bỏ qua font cũ theo đúng đề bài

        const errors = checkParagraph(p.text, checkOpts);
        for (let i = 0; i < errors.length; i++) {
          const err = errors[i];
          collected.push({
            id: `p${p.index}-e${i}-${err.batDau}`,
            paragraphIndex: p.index,
            error: err,
            selectedSuggestion: err.goiY.length > 0 ? err.goiY[0] : err.goc
          });
        }
      }

      setItems(collected);
      setStats({
        totalParagraphs: scanResult.totalParagraphs,
        totalErrors: collected.length
      });
      setHasScanned(true);
    } catch (e) {
      console.error('Lỗi khi quét tài liệu Word:', e);
    } finally {
      setIsScanning(false);
    }
  }, [options, userDictionary]);

  const selectInWord = async (item: DisplayErrorItem) => {
    await WordService.selectError(item.paragraphIndex, item.error);
  };

  const fixError = async (item: DisplayErrorItem, suggestion?: string) => {
    const textToReplace = suggestion || item.selectedSuggestion;
    const ok = await WordService.replaceError(item.paragraphIndex, item.error, textToReplace);
    if (ok) {
      // Xoá lỗi đã sửa khỏi danh sách hiển thị
      setItems(prev => prev.filter(i => i.id !== item.id));
    }
    return ok;
  };

  const ignoreError = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const batchFixSure = async (): Promise<number> => {
    const sureItems = items.filter(i => i.error.mucDo === 'chac-chan');
    if (sureItems.length === 0) return 0;

    const locations: WordErrorLocation[] = sureItems.map(i => ({
      paragraphIndex: i.paragraphIndex,
      error: i.error,
      selectedSuggestion: i.selectedSuggestion
    }));

    const count = await WordService.batchReplace(locations);
    if (count > 0) {
      // Loại bỏ các lỗi đã sửa
      const sureIds = new Set(sureItems.map(i => i.id));
      setItems(prev => prev.filter(i => !sureIds.has(i.id)));
    }
    return count;
  };

  const updateSuggestion = (itemId: string, suggestion: string) => {
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, selectedSuggestion: suggestion } : i))
    );
  };

  return {
    items,
    isScanning,
    hasScanned,
    oldFontWarning,
    stats,
    options,
    setOptions,
    scan,
    selectInWord,
    fixError,
    ignoreError,
    batchFixSure,
    updateSuggestion
  };
}
