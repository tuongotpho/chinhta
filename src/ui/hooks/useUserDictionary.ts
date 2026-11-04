import { useState, useEffect } from 'react';

const STORAGE_KEY = 'soatchinhta_user_dictionary_v1';

export function useUserDictionary() {
  const [words, setWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch (e) {
      console.error('Không thể lưu từ điển người dùng vào localStorage:', e);
    }
  }, [words]);

  const addWord = (word: string) => {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) return;
    setWords(prev => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed].sort();
    });
  };

  const removeWord = (word: string) => {
    const trimmed = word.trim().toLowerCase();
    setWords(prev => prev.filter(w => w !== trimmed));
  };

  const exportToFile = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tu-dien-ca-nhan-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importFromFile = (jsonString: string): { success: boolean; count: number; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'File không đúng định dạng mảng JSON.' };
      }
      const validWords = parsed.filter(w => typeof w === 'string' && w.trim().length > 0).map(w => w.trim().toLowerCase());
      setWords(prev => Array.from(new Set([...prev, ...validWords])).sort());
      return { success: true, count: validWords.length };
    } catch (e) {
      return { success: false, count: 0, error: (e as Error).message };
    }
  };

  return {
    words,
    addWord,
    removeWord,
    exportToFile,
    importFromFile
  };
}
