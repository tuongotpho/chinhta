import { SpellError } from '../engine/types';

export interface ParagraphInfo {
  index: number;
  text: string;
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
  paragraphIndex: number;
  error: SpellError;
  selectedSuggestion: string;
}
