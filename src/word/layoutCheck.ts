/**
 * Soát trình bày văn bản: căn đều, dòng bị giãn, dấu cách căn lề, font không đồng nhất.
 * Chỉ xét đoạn thân bài. Bảng, tiêu đề và đoạn căn giữa thường có chủ ý nên không báo.
 */
import { ParagraphInfo } from './types';

export type LayoutKind = 'align' | 'soft-break' | 'lead-space' | 'gap' | 'font';

export interface LayoutIssue {
  id: string;
  kind: LayoutKind;
  paragraphIndex: number;
  paragraphText: string;
  title: string;
  detail: string;
  /** Có sửa tự động được không. Dấu cách giữa dòng thường dùng căn biểu mẫu nên chỉ báo. */
  fixable: boolean;
  /** Font và cỡ chữ đích khi sửa loại font */
  font?: { name: string; size: number };
}

/** Đoạn ngắn hơn một dòng chữ thì căn trái hay căn đều trông như nhau */
const MIN_JUSTIFY_CHARS = 100;
/** Dòng ngắn thường là nhãn, ghi chú nên không xét font */
const MIN_FONT_CHARS = 20;
/** Chỉ kết luận có font chủ đạo khi nó chiếm đa số rõ ràng */
const DOMINANT_SHARE = 0.6;

const LINE_BREAK = '\u000b';
const SENTENCE_END = /[.;:!?]\s*$/;
/** Dòng biểu mẫu: tab, dấu cách căn cột, dấu chấm dẫn, gạch điền */
const FORM_LINE = /\t| {3,}|\.{4,}|…{2,}|_{4,}/;

function isAllCaps(text: string): boolean {
  return /\p{L}/u.test(text) && text === text.toLocaleUpperCase('vi');
}

function isBody(p: ParagraphInfo): boolean {
  return !p.isOldFont
    && p.tableNestingLevel === 0
    && p.outlineLevel === 10
    && !/^(heading|title|toc)/i.test(p.style ?? '')
    && !isAllCaps(p.text);
}

function normalizeFont(name: string): string {
  return name.replace(/\s+/g, ' ').trim();
}

/** Font và cỡ chữ chiếm nhiều chữ nhất trong thân bài, không rõ ràng thì trả về null */
export function dominantFont(paragraphs: ParagraphInfo[]): { name: string; size: number } | null {
  const counts = new Map<string, { name: string; size: number; chars: number }>();
  let total = 0;
  for (const p of paragraphs) {
    if (!isBody(p) || p.alignment === 'Centered' || !p.fontName || !p.fontSize) continue;
    const name = normalizeFont(p.fontName);
    const key = `${name}|${p.fontSize}`;
    const entry = counts.get(key) ?? { name, size: p.fontSize, chars: 0 };
    entry.chars += p.text.length;
    counts.set(key, entry);
    total += p.text.length;
  }
  const best = [...counts.values()].sort((a, b) => b.chars - a.chars)[0];
  return best && best.chars / total >= DOMINANT_SHARE ? { name: best.name, size: best.size } : null;
}

export function checkLayout(paragraphs: ParagraphInfo[], options: { checkFont: boolean }): LayoutIssue[] {
  const issues: LayoutIssue[] = [];
  const dominant = options.checkFont ? dominantFont(paragraphs) : null;

  for (const p of paragraphs) {
    const add = (kind: LayoutKind, title: string, detail: string, fixable: boolean, font?: LayoutIssue['font']) =>
      issues.push({ id: `${kind}-${p.index}`, kind, paragraphIndex: p.index, paragraphText: p.text, title, detail, fixable, font });

    const justified = p.alignment === 'Justified' || p.alignment === 'Distributed';
    if (!p.isOldFont && justified && p.text.includes(LINE_BREAK)) {
      add('soft-break', 'Dòng bị giãn', 'Đoạn căn đều có xuống dòng mềm (Shift+Enter) nên dòng phía trên bị kéo giãn chữ.', true);
    }

    if (!isBody(p)) continue;

    if (p.alignment === 'Left' && p.text.trim().length >= MIN_JUSTIFY_CHARS && !FORM_LINE.test(p.text)) {
      add('align', 'Đoạn chưa căn đều', 'Đoạn văn dài đang căn trái, văn bản hành chính thường căn đều hai bên.', true);
    }

    const lead = /^ {2,}/.exec(p.text);
    if (lead) {
      add('lead-space', 'Dấu cách ở đầu dòng', `Có ${lead[0].length} dấu cách đầu đoạn, nên dùng thụt đầu dòng.`, true);
    }

    if (/\S {3,}\S/.test(p.text) || /\t{2,}/.test(p.text)) {
      add('gap', 'Căn lề bằng dấu cách hoặc tab', 'Dòng dùng nhiều dấu cách hoặc tab liên tiếp để căn, đổi cỡ chữ là lệch. Nên dùng bảng không viền hoặc tab stop.', false);
    }

    if (dominant && p.alignment !== 'Centered' && p.alignment !== 'Right' && p.text.trim().length >= MIN_FONT_CHARS) {
      const target = `${dominant.name} cỡ ${dominant.size}`;
      if (!p.fontName || !p.fontSize) {
        add('font', 'Lẫn font hoặc cỡ chữ', `Trong đoạn có chữ khác font hoặc cỡ. Phần lớn văn bản dùng ${target}.`, true, dominant);
      } else if (p.fontName !== dominant.name || p.fontSize !== dominant.size) {
        add('font', 'Khác font hoặc cỡ chữ', `Đoạn dùng ${p.fontName} cỡ ${p.fontSize}, phần lớn văn bản dùng ${target}.`, true, dominant);
      }
    }
  }

  return issues;
}

/** Tách đoạn tại các dấu xuống dòng mềm, quyết định thay bằng gì: hết câu thì xuống đoạn, giữa câu thì dấu cách */
export function softBreakReplacements(text: string): string[] {
  const parts = text.split(LINE_BREAK);
  return parts.slice(0, -1).map(part => (SENTENCE_END.test(part) ? '\n' : ' '));
}
