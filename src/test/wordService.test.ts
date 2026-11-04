import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WordService } from '../word/wordService';
import { SpellError } from '../engine/types';

/** Word giả lập đủ cho WordService: đoạn văn, tìm kiếm, thay thế, chữ đã xóa theo dõi. */
class FakeRange {
  constructor(private paragraph: FakeParagraph, public start: number, public text: string) {}
  load() {}
  select() { this.paragraph.selected = this.start; }
  insertText(value: string) {
    const raw = this.paragraph.text;
    this.paragraph.text = raw.slice(0, this.start) + value + raw.slice(this.start + this.text.length);
    this.paragraph.reviewed = this.paragraph.deleted ? this.paragraph.text.replace(this.paragraph.deleted, '') : this.paragraph.text;
  }
}

class FakeParagraph {
  selected: number | null = null;
  reviewed: string;
  font = { name: 'Times New Roman' };
  constructor(public text: string, public deleted = '', public relation = 'Inside') {
    this.reviewed = deleted ? text.replace(deleted, '') : text;
  }
  load() {}
  getReviewedText() { return { value: this.reviewed }; }
  getRange() { return { compareLocationWith: () => ({ value: this.relation }) }; }
  search(word: string) {
    const items: FakeRange[] = [];
    let at = this.text.indexOf(word);
    while (at !== -1) {
      items.push(new FakeRange(this, at, word));
      at = this.text.indexOf(word, at + word.length);
    }
    return { items, load() {} };
  }
}

function install(paragraphs: FakeParagraph[]) {
  const context = {
    sync: async () => {},
    document: {
      body: { paragraphs: { items: paragraphs, load() {} } },
      getSelection: () => ({ load() {} })
    }
  };
  vi.stubGlobal('window', {
    Word: { run: (fn: (c: typeof context) => unknown) => fn(context), InsertLocation: { replace: 'Replace' } },
    Office: { context: { requirements: { isSetSupported: () => true } } }
  });
}

const error = (goc: string, batDau: number, goiY = ['x']): SpellError => ({
  luat: 'R1', batDau, ketThuc: batDau + goc.length, goc, goiY, mucDo: 'chac-chan', lyDo: ''
});

describe('WordService', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('quét vùng chọn gồm cả đoạn đầu và cuối chỉ giao một phần', async () => {
    const relations = ['Before', 'InsideStart', 'Inside', 'OverlapsAfter', 'ContainsStart', 'After'];
    const paragraphs = relations.map((r, i) => new FakeParagraph(`Đoạn ${i}`, '', r));
    install(paragraphs);
    const result = await WordService.readDocument('selection');
    expect(result.paragraphs.map(p => p.index)).toEqual([1, 2, 3, 4]);
  });

  it('sửa đúng lần xuất hiện được yêu cầu', async () => {
    const p = new FakeParagraph('hoạtt a hoạtt b hoạtt');
    install([p]);
    const status = await WordService.replaceError(0, error('hoạtt', 8), 'hoạt', p.text);
    expect(status).toBe('ok');
    expect(p.text).toBe('hoạtt a hoạt b hoạtt');
  });

  it('đoạn đã đổi so với lúc quét thì không ghi', async () => {
    const p = new FakeParagraph('hoạtt và người dùng vừa sửa thêm');
    install([p]);
    const status = await WordService.replaceError(0, error('hoạtt', 0), 'hoạt', 'hoạtt và nội dung cũ');
    expect(status).toBe('stale');
    expect(p.text).toBe('hoạtt và người dùng vừa sửa thêm');
  });

  it('đoạn khác chèn vào làm lệch chỉ số thì không ghi nhầm đoạn', async () => {
    const inserted = new FakeParagraph('hoạtt ở đoạn mới chèn');
    const original = new FakeParagraph('hoạtt ở đoạn cũ');
    install([inserted, original]);
    const status = await WordService.replaceError(0, error('hoạtt', 0), 'hoạt', 'hoạtt ở đoạn cũ');
    expect(status).toBe('stale');
    expect(inserted.text).toBe('hoạtt ở đoạn mới chèn');
  });

  it('chữ đã xóa theo dõi làm lệch số lần xuất hiện thì từ chối, không đoán', async () => {
    const p = new FakeParagraph('hoạtt hoạtt còn lại', 'hoạtt ');
    install([p]);
    const status = await WordService.replaceError(0, error('hoạtt', 0), 'hoạt', 'hoạtt còn lại');
    expect(status).toBe('tracked');
    expect(p.text).toBe('hoạtt hoạtt còn lại');
  });

  it('quét bỏ chữ đã xóa theo dõi', async () => {
    install([new FakeParagraph('giữ lại xóa đi', 'xóa đi')]);
    const result = await WordService.readDocument('all');
    expect(result.paragraphs[0].text.trim()).toBe('giữ lại');
    expect(result.paragraphs[0].hasTrackedChanges).toBe(true);
  });

  it('sửa hàng loạt nhiều lỗi trong một đoạn và báo đúng lỗi thất bại', async () => {
    const a = new FakeParagraph('một hai ba');
    const b = new FakeParagraph('đoạn đã đổi');
    install([a, b]);
    const result = await WordService.batchReplace([
      { id: '1', paragraphIndex: 0, paragraphText: 'một hai ba', error: error('một', 0), selectedSuggestion: 'MỘT' },
      { id: '2', paragraphIndex: 0, paragraphText: 'một hai ba', error: error('ba', 8), selectedSuggestion: 'BA NĂM' },
      { id: '3', paragraphIndex: 1, paragraphText: 'nội dung cũ', error: error('nội', 0), selectedSuggestion: 'NỘI' }
    ]);
    expect(a.text).toBe('MỘT hai BA NĂM');
    expect(result.succeeded.sort()).toEqual(['1', '2']);
    expect(result.failed).toEqual(['3']);
  });

  it('thoát ký tự điều khiển khi tìm trong Word', async () => {
    const p = new FakeParagraph('a^b');
    const search = vi.spyOn(p, 'search').mockImplementation(() => ({ items: [new FakeRange(p, 1, '^')], load() {} }));
    install([p]);
    await WordService.replaceError(0, error('^', 1), 'x', 'a^b');
    expect(search.mock.calls[0][0]).toBe('^^');
  });
});
