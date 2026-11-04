import { describe, it, expect } from 'vitest';
import { checkParagraph } from '../engine/checker';

describe('Bộ kiểm tra chính tả tiếng Việt (src/engine)', () => {
  describe('Luật R1: Âm tiết không hợp lệ / Gõ nhầm Telex', () => {
    it('bắt đúng lỗi gõ nhầm Telex: ddieefu -> điều', () => {
      const errors = checkParagraph('Cần xem xét ddieefu này trước.');
      const r1 = errors.find(e => e.luat === 'R1');
      expect(r1).toBeDefined();
      expect(r1?.goc).toBe('ddieefu');
      expect(r1?.goiY).toContain('điều');
      expect(r1?.mucDo).toBe('chac-chan');
    });

    it('bắt đúng lỗi thừa phụ âm do kẹt phím: hoạtt -> hoạt', () => {
      const errors = checkParagraph('Kế hoạch hoạtt động của năm.');
      const r1 = errors.find(e => e.luat === 'R1');
      expect(r1).toBeDefined();
      expect(r1?.goc).toBe('hoạtt');
      expect(r1?.goiY).toContain('hoạt');
    });

    it('bỏ qua từ viết tắt và mã thiết bị ngành điện', () => {
      const errors = checkParagraph('Đường dây 110kV và TBA cùng MBA của CBCNV hoạt động tốt.');
      const r1Errors = errors.filter(e => e.luat === 'R1');
      expect(r1Errors).toHaveLength(0);
    });
  });

  describe('Luật R2: Cụm từ nhầm lẫn đã kiểm duyệt', () => {
    it('bắt đúng các cặp từ nhầm lẫn phụ âm s/x, tr/ch, d/r', () => {
      const text = 'Công ty xản xuất và xắp xếp lại trân thành cứu dỗi.';
      const errors = checkParagraph(text);

      const r2Errors = errors.filter(e => e.luat === 'R2');
      const gocList = r2Errors.map(e => e.goc);

      expect(gocList).toContain('xản xuất');
      expect(gocList).toContain('xắp xếp');
      expect(gocList).toContain('trân thành');
      expect(gocList).toContain('cứu dỗi');

      const xanXuat = r2Errors.find(e => e.goc === 'xản xuất');
      expect(xanXuat?.goiY).toContain('sản xuất');
      expect(xanXuat?.mucDo).toBe('chac-chan');
    });
  });

  describe('Luật R3: Nhầm cần xem ngữ cảnh & Các trường hợp ngoại lệ bắt buộc', () => {
    it('bắt đúng lỗi "dành giải" -> "giành giải"', () => {
      const errors = checkParagraph('Đội tuyển đã dành giải nhất cuộc thi.');
      const r3 = errors.find(e => e.luat === 'R3' && e.goc.includes('dành giải'));
      expect(r3).toBeDefined();
      expect(r3?.mucDo).toBe('nen-xem');
      expect(r3?.goiY[0]).toContain('giành giải');
    });

    it('bắt đúng lỗi "chia sẽ" -> "chia sẻ"', () => {
      const errors = checkParagraph('Chúng tôi muốn chia sẽ kinh nghiệm công tác.');
      const r3 = errors.find(e => e.luat === 'R3');
      expect(r3).toBeDefined();
      expect(r3?.goc).toBe('chia sẽ');
      expect(r3?.goiY).toContain('chia sẻ');
    });

    it('BẮT BUỘC: "chân thành cảm ơn" là ĐÚNG, KHÔNG được báo lỗi', () => {
      const errors = checkParagraph('Chúng tôi chân thành cảm ơn quý khách.');
      const chanThanhError = errors.find(e => e.goc.includes('chân thành'));
      expect(chanThanhError).toBeUndefined();
    });

    it('BẮT BUỘC: "Nguyễn Văn Chia" là tên riêng, KHÔNG được dính luật của "chia"', () => {
      const errors = checkParagraph('Ông Nguyễn Văn Chia sẽ phụ trách dự án.');
      const chiaError = errors.find(e => e.goc.toLowerCase().includes('chia'));
      expect(chiaError).toBeUndefined();
    });
  });

  describe('Luật R4: Lỗi dấu câu và khoảng trắng', () => {
    it('bắt đúng lỗi khoảng trắng trước dấu phẩy và chấm: công ty ,trách nhiệm .', () => {
      const errors = checkParagraph('công ty ,trách nhiệm .');
      const r4Errors = errors.filter(e => e.luat === 'R4');
      expect(r4Errors.length).toBeGreaterThanOrEqual(2);

      const commaErr = r4Errors.find(e => e.goc === ' ,');
      expect(commaErr).toBeDefined();
      expect(commaErr?.goiY).toEqual([',']);

      const dotErr = r4Errors.find(e => e.goc === ' .');
      expect(dotErr).toBeDefined();
      expect(dotErr?.goiY).toEqual(['.']);
    });

    it('bắt đúng lỗi thiếu khoảng trắng sau dấu phẩy: công ty,trách nhiệm', () => {
      const errors = checkParagraph('công ty,trách nhiệm');
      const r4 = errors.find(e => e.luat === 'R4' && e.goc.includes(',t'));
      expect(r4).toBeDefined();
      expect(r4?.goiY).toEqual([', t']);
    });
  });

  describe('Luật R5: Lặp từ liền nhau', () => {
    it('bắt đúng lỗi lặp từ vô ý: "trong trong"', () => {
      const errors = checkParagraph('Vấn đề nằm trong trong báo cáo này.');
      const r5 = errors.find(e => e.luat === 'R5');
      expect(r5).toBeDefined();
      expect(r5?.goc).toBe('trong trong');
      expect(r5?.goiY).toContain('trong');
      expect(r5?.mucDo).toBe('nen-xem');
    });

    it('bỏ qua từ láy hoặc điệp từ tiếng Việt hợp lệ như "ngày ngày"', () => {
      const errors = checkParagraph('Mỗi ngày ngày một phát triển hơn.');
      const r5 = errors.find(e => e.luat === 'R5' && e.goc === 'ngày ngày');
      expect(r5).toBeUndefined();
    });
  });

  describe('Luật R6: Viết hoa tên cơ quan Nghị định 30/2020 (3 trường hợp kiểm thử bắt buộc)', () => {
    it('Trường hợp 1: viết thường "bộ tài chính" -> PHẢI báo lỗi', () => {
      const errors = checkParagraph('Quyết định số 10 của bộ tài chính ban hành.');
      const r6 = errors.find(e => e.luat === 'R6');
      expect(r6).toBeDefined();
      expect(r6?.goc.toLowerCase()).toBe('bộ tài chính');
      expect(r6?.goiY).toContain('Bộ Tài chính');
      expect(r6?.mucDo).toBe('nen-xem');
    });

    it('Trường hợp 2: viết chuẩn "Bộ Tài chính" -> KHÔNG được báo lỗi', () => {
      const errors = checkParagraph('Quyết định số 10 của Bộ Tài chính ban hành.');
      const r6 = errors.find(e => e.luat === 'R6' && e.goc.toLowerCase().includes('bộ tài chính'));
      expect(r6).toBeUndefined();
    });

    it('Trường hợp 3: viết hoa toàn bộ trong tiêu đề "BỘ TÀI CHÍNH" -> KHÔNG được báo lỗi', () => {
      const errors = checkParagraph('BỘ TÀI CHÍNH BÁO CÁO CÔNG TÁC.');
      const r6 = errors.find(e => e.luat === 'R6' && e.goc.toLowerCase().includes('bộ tài chính'));
      expect(r6).toBeUndefined();
    });
  });

  describe('Luật R7: Thống nhất kiểu bỏ dấu (mặc định tắt)', () => {
    it('không báo lỗi khi enableR7 = false (mặc định)', () => {
      const errors = checkParagraph('Tạo lập hoà bình và thuỷ điện.');
      const r7 = errors.find(e => e.luat === 'R7');
      expect(r7).toBeUndefined();
    });

    it('báo gợi ý khi enableR7 = true', () => {
      const errors = checkParagraph('Tạo lập hoà bình và thuỷ điện.', { enableR7: true });
      const r7List = errors.filter(e => e.luat === 'R7');
      expect(r7List.length).toBeGreaterThanOrEqual(1);

      const hoaErr = r7List.find(e => e.goc === 'hoà');
      expect(hoaErr).toBeDefined();
      expect(hoaErr?.goiY).toContain('hòa');
      expect(hoaErr?.mucDo).toBe('goi-y');
    });
  });
});
