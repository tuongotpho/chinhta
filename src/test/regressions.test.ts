import fs from 'fs';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { checkParagraph, matchCase } from '../engine/checker';
import { parseNgramModel, setNgramModel } from '../engine/ngram';
import { isValidSyllable, suggestCorrection } from '../engine/syllable';
import { tokenize } from '../engine/tokenizer';
import { detectOldFont } from '../word/fontDetector';

const words = (text: string) => tokenize(text).allTokens.map(t => t.text);
const gocs = (text: string) => checkParagraph(text).map(e => e.goc);

beforeAll(() => {
  const raw = fs.readFileSync(path.join(__dirname, '../../public/assets/ngram-v2.bin'));
  setNgramModel(parseNgramModel(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer));
});

describe('Không báo nhầm nội dung hành chính và kỹ thuật', () => {
  it.each([
    'Căn cứ điểm b khoản 2 Điều 5 Thông tư số 39/2015/TT-BCT.',
    'b) Trạm biến áp phân phối 22/0,4kV công suất từ 160kVA đến 630kVA;',
    'đ) Các công trình do Công ty quản lý vận hành.',
    'Căn cứ Quyết định số 428/QĐ-TTg ngày 18/3/2016.',
    'Tờ trình số 56/TTr-KT, ThS. Lê Thị Quỳnh làm đầu mối.',
    'Sản lượng 1.234 MWh, tương đương 1,234 GWh, tụ bù 600kVAr.',
    'Cáp 3x240mm2, dòng ngắn mạch 25kA trong 1s, đóng lại sau 500ms, chôn sâu 80cm.',
    'Đơn giá 2.103,11 đ/kWh, tổng dự toán 1.250.000.000đ.',
    'Phòng Tài chính-Kế toán, phát triển kinh tế-xã hội.',
    'Đ/c Khoa báo cáo về P.KT; K/g: Ban Giám đốc; T/M BAN CHỈ HUY.',
    'Công-tơ điện tử lắp trên ô-tô kiểm định.',
    'Recloser, inverter và container đã về kho.',
    'Hệ số công suất cosφ đạt 0,95.'
  ])('%s', text => {
    expect(checkParagraph(text).filter(e => e.mucDo === 'chac-chan')).toEqual([]);
  });

  it('không cắt đôi từ có dấu ngay sau số', () => {
    expect(words('Mỗi 5 mét')).toEqual(['Mỗi', '5', 'mét']);
    expect(words('Gồm 10 hợp đồng')).toEqual(['Gồm', '10', 'hợp', 'đồng']);
    expect(words('Đội 3 Vận hành')).toEqual(['Đội', '3', 'Vận', 'hành']);
    expect(words('Dài 5 m')).toEqual(['Dài', '5 m']);
  });
});

describe('R2 không sửa hỏng chữ đúng', () => {
  it.each([
    ['Tiếp xúc tích cực với khách hàng.', 'xúc tích'],
    ['Ông An được nhận chức vụ Trưởng phòng.', 'nhận chức'],
    ['Nhóm nghiên cứu đọc giả thuyết của tác giả.', 'đọc giả'],
    ['Hai đơn vị dùng chung thực hiện tiết kiệm.', 'chung thực']
  ])('%s', (text, phrase) => {
    expect(checkParagraph(text).find(e => e.luat === 'R2' && e.goc === phrase)).toBeUndefined();
  });

  it('vẫn bắt khi đúng là lỗi', () => {
    expect(checkParagraph('Văn phong rất xúc tích.').some(e => e.goc === 'xúc tích')).toBe(true);
    expect(checkParagraph('Lễ nhận chức của giám đốc.').some(e => e.goc === 'nhận chức')).toBe(true);
  });
});

describe('Gợi ý sửa', () => {
  it.each([
    ['đươc', 'được'], ['hoc', 'học'], ['lich', 'lịch'], ['tiep', 'tiếp'], ['viet', 'việt'],
    ['duoc', 'được'], ['thôgn', 'thông'], ['cogn', 'công'], ['củaa', 'của'],
    ['ddienj', 'điện'], ['nawm', 'năm'], ['cachh', 'cách']
  ])('%s -> %s đứng đầu', (word, expected) => {
    expect(suggestCorrection(word)[0]).toBe(expected);
  });

  it('xếp gợi ý theo chữ đứng cạnh', () => {
    expect(checkParagraph('Công ty dien lực tỉnh.').find(e => e.goc === 'dien')?.goiY[0]).toBe('điện');
    expect(checkParagraph('Cán bộ nghiem túc chấp hành.').find(e => e.goc === 'nghiem')?.goiY[0]).toBe('nghiêm');
  });

  it('giữ kiểu chữ hoa của chữ gốc', () => {
    expect(matchCase('Hoạtt', 'hoạt')).toBe('Hoạt');
    expect(matchCase('XẢN XUẤT', 'sản xuất')).toBe('SẢN XUẤT');
    expect(checkParagraph('Hoạtt động của đơn vị.')[0].goiY[0]).toBe('Hoạt');
    expect(checkParagraph('XẢN XUẤT KINH DOANH')[0].goiY[0]).toBe('SẢN XUẤT');
  });
});

describe('Âm tiết', () => {
  it('nhận vần y sau qu', () => {
    for (const w of ['quýt', 'quỳnh', 'quýnh', 'quỵt']) expect(isValidSyllable(w)).toBe(true);
  });

  it('từ chối c trước âm đệm', () => {
    for (const w of ['coa', 'cuyên', 'cuân']) expect(isValidSyllable(w)).toBe(false);
    for (const w of ['của', 'cuộc', 'cười', 'con', 'cuối']) expect(isValidSyllable(w)).toBe(true);
  });
});

describe('Luật ngữ cảnh R8', () => {
  it.each([
    ['Tăng năng xuất lao động.', 'xuất', 'suất']
  ])('%s', (text, wrong, right) => {
    const hit = checkParagraph(text).find(e => e.goc === wrong);
    expect(hit?.luat).toBe('R8');
    expect(hit?.mucDo).toBe('nen-xem');
    expect(hit?.goiY).toContain(right);
  });

  // Giới hạn đã biết: chênh lệch ngữ cảnh chưa tới ngưỡng. Khi engine bắt được, test này sẽ báo để gỡ dấu fails.
  it.fails('giới hạn đã biết: công xuất đứng trước chữ ít gặp cùng "suất"', () => {
    expect(checkParagraph('Máy biến áp có công xuất lớn.').find(e => e.goc === 'xuất')?.luat).toBe('R8');
  });

  it('không chạy khi người dùng tắt', () => {
    expect(checkParagraph('Anh ấy có kỷ thuật tốt.', { enableR8: false }).some(e => e.luat === 'R8')).toBe(false);
  });

  it('từ trong từ điển cá nhân không bị báo', () => {
    expect(checkParagraph('Anh ấy có kỷ thuật tốt.', { userDictionary: ['kỷ'] }).some(e => e.goc === 'kỷ')).toBe(false);
  });
});

describe('Tiêu đề in hoa', () => {
  it('bắt chữ sai trong tiêu đề, không đụng viết tắt', () => {
    expect(gocs('BÁO CÁO KÊT QUẢ SẢN XUẤT KINH DOANH')).toContain('KÊT');
    expect(gocs('KẾ HOACH CÔNG TÁC NĂM 2026')).toContain('HOACH');
    expect(gocs('TỔNG CÔNG TY ĐIỆN LỰC MIỀN BẮC EVNNPC')).toEqual([]);
  });
});

describe('R4 không phá biểu mẫu và viết tắt', () => {
  it('không gộp tab, căn lề sau dấu hai chấm, dấu dẫn mục lục', () => {
    const r4 = (t: string) => checkParagraph(t).filter(e => e.luat === 'R4');
    expect(r4('Họ tên:    Nguyễn Văn A\t\tĐơn vị:    Đội 1')).toEqual([]);
    expect(r4('Mục lục ..................... 5')).toEqual([]);
    expect(r4('File BaoCao.PDF, phần mềm ASP.NET, định dạng .docx, KS.Phạm Văn Huy, P.KT.')).toEqual([]);
    expect(r4('Ô đánh dấu (   ) nếu đồng ý.')).toEqual([]);
  });

  it('thừa dấu cách giữa câu chỉ ở mức Nên xem, nên không vào sửa hàng loạt', () => {
    const e = checkParagraph('Công ty  đã thực hiện.').find(x => x.luat === 'R4');
    expect(e?.mucDo).toBe('nen-xem');
  });

  it('bắt ngoặc kép có dấu cách và dấu câu lặp', () => {
    expect(gocs('Nội dung “ kế hoạch ” đã duyệt.').length).toBeGreaterThanOrEqual(2);
    expect(checkParagraph('Thực hiện đúng quy định..').some(e => e.luat === 'R4' && e.goc === '..')).toBe(true);
    expect(checkParagraph('Cứ thế mà làm...').some(e => e.luat === 'R4')).toBe(false);
  });
});

describe('Các luật ngữ cảnh khác', () => {
  it('R3 không bắt giành sự, giành thời cơ', () => {
    const r3 = (t: string) => checkParagraph(t).filter(e => e.luat === 'R3');
    expect(r3('Đấu tranh giành sự công bằng, giành thời cơ.')).toEqual([]);
    expect(r3('Cần giành thời gian cho gia đình.')).toHaveLength(1);
  });

  it('R5 không bắt từ láy', () => {
    for (const t of ['Đề nghị từ từ triển khai.', 'Hai tuyến chạy song song.', 'Báo cáo còn chung chung.']) {
      expect(checkParagraph(t).filter(e => e.luat === 'R5')).toEqual([]);
    }
  });

  it('R6 không bắt nghĩa chung', () => {
    const r6 = (t: string) => checkParagraph(t).filter(e => e.luat === 'R6');
    expect(r6('Nhiều chính phủ khuyến khích năng lượng tái tạo.')).toEqual([]);
    expect(r6('Ủy ban nhân dân các cấp có trách nhiệm phối hợp.')).toEqual([]);
    expect(r6('Văn bản của chính phủ ban hành.')).toHaveLength(1);
  });
});

describe('Nhận diện font cũ', () => {
  it('ký hiệu đơn lẻ không làm cả đoạn bị bỏ qua', () => {
    for (const t of ['Nhãn hiệu Microsoft® đã đăng ký.', 'Bản quyền © 2026 Công ty.', 'Tỷ lệ ½ công suất.']) {
      expect(detectOldFont('Times New Roman', t).isOldFont).toBe(false);
    }
  });

  it('vẫn nhận ra văn bản mã cũ', () => {
    expect(detectOldFont('Times New Roman', 'Coâng ty ñieän löïc Vieät Nam').isOldFont).toBe(true);
    expect(detectOldFont('Times New Roman', 'C«ng ty tr¸ch nhiÖm h÷u h¹n').isOldFont).toBe(true);
    expect(detectOldFont('.VnTime', 'bất kỳ').isOldFont).toBe(true);
  });

  it('từ tiếng Anh ngắn không bị hiểu là gõ Telex', () => {
    for (const text of ['Certificate of origin', 'Power lines and cables', 'Ông Leon đến thăm']) {
      expect(checkParagraph(text).filter(e => e.luat === 'R1')).toEqual([]);
    }
  });

  it('cụm hay sai trong văn bản hành chính được R2 bắt', () => {
    for (const [text, goc, dung] of [
      ['Đơn vị cần sử lý dứt điểm.', 'sử lý', 'xử lý'],
      ['Anh ấy có kỷ thuật tốt.', 'kỷ thuật', 'kỹ thuật'],
      ['Đây là việc đáng tiết.', 'đáng tiết', 'đáng tiếc']
    ]) {
      const hit = checkParagraph(text).find(e => e.goc === goc);
      expect(hit?.luat).toBe('R2');
      expect(hit?.goiY[0]).toBe(dung);
    }
  });

  it('không báo các cụm đúng dễ nhầm với lỗi', () => {
    for (const text of [
      'Công suất phát điện của tổ máy đạt định mức.',
      'Khả năng xuất hiện sự cố là rất thấp.',
      'Tần suất hiện tại đã giảm.'
    ]) {
      expect(checkParagraph(text).filter(e => e.luat === 'R2')).toEqual([]);
    }
  });
});
