import { describe, expect, it } from 'vitest';
import { checkLayout, dominantFont, softBreakReplacements } from '../word/layoutCheck';
import { ParagraphInfo } from '../word/types';

const LONG = 'Công ty thực hiện rà soát toàn bộ kế hoạch sửa chữa lớn năm nay và báo cáo kết quả về phòng kỹ thuật đúng thời hạn được giao.';

const para = (index: number, text: string, extra: Partial<ParagraphInfo> = {}): ParagraphInfo => ({
  index,
  text,
  hasTrackedChanges: false,
  isOldFont: false,
  locationType: 'body',
  fontName: 'Times New Roman',
  fontSize: 13,
  alignment: 'Justified',
  outlineLevel: 10,
  tableNestingLevel: 0,
  style: 'Normal',
  ...extra
});

const kinds = (paragraphs: ParagraphInfo[]) => checkLayout(paragraphs, { checkFont: true }).map(i => i.kind);

describe('Soát trình bày', () => {
  it('báo đoạn dài căn trái, sửa được', () => {
    const [issue] = checkLayout([para(0, LONG, { alignment: 'Left' })], { checkFont: true });
    expect(issue.kind).toBe('align');
    expect(issue.fixable).toBe(true);
  });

  it('không báo căn đều với bảng, tiêu đề, căn giữa, dòng ngắn, chữ hoa, dòng biểu mẫu', () => {
    expect(kinds([
      para(0, LONG, { alignment: 'Left', tableNestingLevel: 1 }),
      para(1, LONG, { alignment: 'Left', outlineLevel: 1 }),
      para(2, LONG, { alignment: 'Left', style: 'Heading 2' }),
      para(3, LONG, { alignment: 'Centered' }),
      para(4, LONG, { alignment: 'Right' }),
      para(5, 'Nơi nhận:', { alignment: 'Left' }),
      para(6, LONG.toUpperCase(), { alignment: 'Left' }),
      para(7, `Họ và tên: ${'.'.repeat(120)}`, { alignment: 'Left' }),
      para(8, LONG, { alignment: 'Left', isOldFont: true })
    ])).toEqual([]);
  });

  it('báo dòng giãn khi đoạn căn đều có Shift+Enter, không báo khi căn trái', () => {
    expect(kinds([para(0, 'Dòng một\u000bdòng hai')])).toEqual(['soft-break']);
    expect(kinds([para(0, 'Dòng một\u000bdòng hai', { alignment: 'Left' })])).toEqual([]);
  });

  it('dòng giãn: hết câu thì xuống đoạn, giữa câu thì dấu cách', () => {
    expect(softBreakReplacements('Câu một.\u000bgiữa\u000bcâu')).toEqual(['\n', ' ']);
  });

  it('dấu cách đầu dòng sửa được, căn giữa dòng chỉ báo', () => {
    const issues = checkLayout([para(0, '   Đầu dòng'), para(1, 'Họ tên     Chức vụ'), para(2, 'Họ tên\t\tChức vụ')], { checkFont: true });
    expect(issues.map(i => [i.kind, i.fixable])).toEqual([['lead-space', true], ['gap', false], ['gap', false]]);
  });

  it('tìm font chủ đạo, báo đoạn khác cỡ, khác font, lẫn font và cả tên font sai dấu cách', () => {
    const issues = checkLayout([
      para(0, LONG),
      para(1, LONG),
      para(2, LONG),
      para(3, LONG),
      para(4, LONG),
      para(5, LONG),
      para(6, LONG, { fontSize: 12 }),
      para(7, LONG, { fontName: 'Arial' }),
      para(8, LONG, { fontName: '' }),
      para(9, LONG, { fontName: 'Times  New Roman' })
    ], { checkFont: true });
    expect(issues.map(i => i.paragraphIndex)).toEqual([6, 7, 8, 9]);
    expect(issues[0].font).toEqual({ name: 'Times New Roman', size: 13 });
  });

  it('không kết luận font khi không có font chiếm đa số, khi quét vùng chọn', () => {
    expect(dominantFont([para(0, LONG), para(1, LONG, { fontSize: 12 })])).toBeNull();
    expect(checkLayout([para(0, LONG), para(1, LONG, { fontSize: 12 })], { checkFont: false })).toEqual([]);
  });
});
