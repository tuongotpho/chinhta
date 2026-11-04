// Sinh tệp Word mẫu và đáp án để kiểm tra add-in trên Word thật.
// Cần gói docx: npm install --no-save docx
// Cách chạy: node scripts/tao-van-ban-mau.cjs
//
// Văn bản viết dưới dạng mảng các mảnh: chuỗi là chữ đúng, L(sai, dung, loai) là lỗi cài vào.
// Đáp án sinh từ chính dữ liệu này nên không lệch với tệp Word.
const fs = require('fs');
const path = require('path');
const {
  AlignmentType, BorderStyle, DeletedTextRun, Document, Footer, FootnoteReferenceRun, Header, InsertedTextRun,
  LevelFormat, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TabStopType, TextRun, WidthType
} = require('docx');

const FONT = 'Times New Roman';
const SIZE = 26;
const TRACK = { id: 1, author: 'Người soát thử', date: '2026-11-04T08:00:00Z' };
const root = path.join(__dirname, '..');

let nextId = 1;
const L = (sai, dung, loai, opts = {}) => ({ sai, dung, loai, id: nextId++, ...opts });

// Mỗi phần tử: { p: mảnh[], style?, muc: mô tả tình huống }
const noiDung = [
  { kind: 'heading', p: ['BÁO CÁO TÌNH HÌNH ', L('THỰC HIÊN', 'THỰC HIỆN', 'Tiêu đề in hoa'), ' KẾ HOẠCH QUÝ III NĂM 2026'] },
  { kind: 'center', p: ['Kính gửi: Ban Giám đốc Công ty Điện lực Bắc Giang'] },
  { kind: 'h2', p: ['I. KẾT QUẢ THỰC HIỆN NHIỆM VỤ'] },
  { p: ['1. Công tác sản xuất kinh doanh'] },
  { p: ['Căn cứ Quyết định số 1825/QĐ-EVNNPC ngày 12/6/2026 của Tổng công ty Điện lực miền Bắc và điểm c khoản 3 Điều 8 Thông tư số 25/2016/TT-BCT, Công ty đã ', L('thi hàng', 'thi hành', 'Lạc ngữ cảnh'), ' đầy đủ các chỉ tiêu được giao. Sản lượng điện thương phẩm quý III đạt 412,6 triệu kWh, tăng 7,3% so với cùng kỳ; tổn ', L('thât', 'thất', 'Sai cấu tạo'), ' điện năng đạt 4,18%, thấp hơn kế hoạch 0,12%.'] },
  { p: ['Giá bán điện bình quân đạt 2.146,35 đ/kWh. Doanh thu ước đạt 885.000.000.000đ. Số khách ', L('hành', 'hàng', 'Lạc ngữ cảnh'), ' sử dụng điện tăng thêm 4.215 hộ, đưa tổng số lên 612.450 khách ', 'hàng.'] },
  { p: ['2. Công tác kỹ thuật và an toàn'] },
  { p: ['Đơn vị đã ', L('vận', 'vận', 'Không lỗi, phần sau đậm', { skip: true }), ' ', L('hàng', 'hành', 'Lạc ngữ cảnh, chữ đậm trong cụm', { bold: true }), ' an toàn 12 trạm biến áp 110kV, 4.860 trạm biến áp phân phối và 3.215 km ', L('đường giây', 'đường dây', 'Lạc ngữ cảnh'), ' trung áp. Trong quý không xảy ra tai nạn lao ', L('đông', 'động', 'Lạc ngữ cảnh'), '. Số vụ sự cố thoáng qua giảm 11 vụ, sự cố kéo dài giảm 3 vụ so với cùng kỳ.'] },
  { p: ['Các nhóm công tác đã thay 36 bộ recloser, 18 tủ RMU và 240 cột chiếu sáng; lắp đặt 2.150 công-tơ điện tử 3 pha; thử nghiệm định kỳ MBA T1, T2 tại TBA 110kV Đình Trám. Dây dẫn AC-120 được thay bằng cáp ngầm Cu/XLPE/PVC 3x240mm2, dòng ngắn mạch cho phép 25kA, thời gian cắt 500ms. Tụ bù trung áp 600kVAr đưa hệ số công suất cosφ lên 0,96.'] },
  { p: ['Tuy nhiên, công tác kiểm tra hiện trường còn chưa ', L('nghiêm thu', 'nghiệm thu', 'Lạc ngữ cảnh', { note: 'cụm thật phải là "nghiệm thu đúng hạn"' }), ' đúng hạn, một số hồ sơ phải ', L('bổ xung', 'bổ sung', 'Danh sách R2'), ' nhiều lần. Các đơn vị cần ', L('xắp xếp', 'sắp xếp', 'Danh sách R2'), ' lại lịch công tác', L(' ,', ',', 'Dấu câu'), ' bảo đảm đúng tiến độ.'] },
  { p: ['Phòng Kỹ thuật ', L('hoạtt', 'hoạt', 'Sai cấu tạo, lần 1 trong đoạn'), ' động độc lập, Phòng An toàn ', L('hoạtt', 'hoạt', 'Sai cấu tạo, lần 2 trong đoạn'), ' động theo chuyên đề, còn các Đội Quản lý điện ', L('hoạtt', 'hoạt', 'Sai cấu tạo, lần 3 trong đoạn'), ' động theo địa bàn.'] },
  { p: ['Đề nghị ', L('các các', 'các', 'Lặp từ'), ' đơn vị phối hợp với Sở Công Thương, Ủy ban nhân dân các cấp và ', L('bộ công thương', 'Bộ Công Thương', 'Viết hoa cơ quan'), ' để tháo gỡ vướng mắc. Văn bản trả lời của ', L('tập đoàn điện lực việt nam', 'Tập đoàn Điện lực Việt Nam', 'Viết hoa cơ quan'), ' đã được chuyển về đơn vị.'] },
  { kind: 'h2', p: ['II. KẾ ', L('HOACH', 'HOẠCH', 'Tiêu đề in hoa'), ' SỬA CHỮA LỚN QUÝ IV'] },
  { kind: 'table' },
  { p: ['Nội dung đầu tư gồm ', L('( 05 )', '(05)', 'Dấu câu'), ' hạng mục, tổng dự toán 36,2 tỷ đồng. Các đơn vị báo cáo trước ngày 15/12/2026.', L('Phòng', ' Phòng', 'Dấu câu', { prefixDot: true }), ' Kế hoạch-Đầu tư tổng hợp, Phòng Tài chính-Kế toán bố trí nguồn vốn, theo đúng quy ', L('đinh', 'định', 'Lạc ngữ cảnh'), ' hiện hành.'] },
  { kind: 'h2', p: ['III. CÁC VIỆC CẦN LÀM NGAY'] },
  { p: ['a) Rà soát, cập nhật dữ liệu khách hàng trên phần mềm CMIS trước ngày 30/11/2026;'] },
  { p: ['b) Đ/c Trần Văn Quỳnh, ThS. Lê Thị Thúy phụ trách ', L('chỉ tieu', 'chỉ tiêu', 'Thiếu dấu'), ' độ tin cậy cung cấp điện;'] },
  { p: ['c) Đội Quản lý điện Yên Dũng ', L('phoois', 'phối', 'Gõ Telex'), ' hợp kiểm tra hành lang tuyến 22kV, liên hệ email kt.bacgiang@npc.com.vn hoặc hotline 19006769;'] },
  { p: ['d) ', L('Nhuwngx', 'Những', 'Gõ Telex'), ' nội dung còn vướng mắc báo cáo về P.KT để tổng hợp;'] },
  { p: ['đ) Các đơn vị không được ', L('đã đã', 'đã', 'Lặp từ', { sua: 'kết hợp' }), ' chậm trễ trong việc báo cáo.'] },
  { p: ['Chúng tôi xin ', L('chia sẽ', 'chia sẻ', 'Cặp ngữ cảnh'), ' một số kinh nghiệm: tổ công tác đã ', L('dành được', 'giành được', 'Cặp ngữ cảnh'), ' giải nhất hội thi an toàn vệ sinh viên năm 2026.'] },
  { kind: 'tracked' },
  { kind: 'oldfont' },
  { kind: 'footnote' },
  { kind: 'form' },
  { kind: 'symbols' },
  { kind: 'sign' }
];

const bangHangMuc = [
  ['STT', 'Hạng mục', 'Khối lượng', 'Ghi chú'],
  ['1', ['Thay ', L('máy biến ấp', 'máy biến áp', 'Trong ô bảng'), ' T2'], '01 máy 25MVA', 'TBA 110kV Quang Châu'],
  ['2', ['Cải tạo đường dây 35kV lộ 371'], '12,5 km', ['Hoàn thành ', L('thánh', 'tháng', 'Trong ô bảng'), ' 12']],
  ['3', ['Sửa chữa ', L('hệ thông', 'hệ thống', 'Trong ô bảng'), ' tiếp địa'], '146 vị trí', 'Theo quy trình QCVN'],
  ['4', ['Thay cầu dao phụ tải LBS'], '24 bộ', 'Đội QLĐ Lạng Giang']
];

function pieces(parts, base = {}) {
  const runs = [];
  for (const part of parts) {
    if (typeof part === 'string') {
      runs.push(new TextRun({ text: part, font: FONT, size: SIZE, ...base }));
    } else {
      const text = part.prefixDot ? `${part.sai}` : part.sai;
      runs.push(new TextRun({ text, font: FONT, size: SIZE, ...base, bold: part.bold || base.bold }));
    }
  }
  return runs;
}

const plain = parts => parts.map(x => (typeof x === 'string' ? x : x.sai)).join('');

const key = [];
const paragraphs = [];

function record(parts, viTri) {
  const text = plain(parts);
  let offset = 0;
  for (const part of parts) {
    if (typeof part === 'string') { offset += part.length; continue; }
    if (!part.skip) {
      key.push({ id: part.id, viTri, sai: part.sai, dung: part.dung, loai: part.loai, batDau: offset, ketThuc: offset + part.sai.length, doan: text });
    }
    offset += part.sai.length;
  }
  paragraphs.push({ text, viTri });
  return text;
}

const body = [];
const para = (children, opts = {}) => new Paragraph({ children, spacing: { after: 120, line: 300 }, ...opts });

const cell = (content, width, header) => {
  const parts = Array.isArray(content) ? content : [content];
  record(parts, 'Bảng hạng mục');
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    shading: header ? { type: ShadingType.CLEAR, fill: 'D9E2F3' } : undefined,
    children: [new Paragraph({ children: pieces(parts, header ? { bold: true } : {}) })]
  });
};

noiDung.forEach((item, index) => {
  const viTri = `Mục ${index + 1}`;
  if (item.kind === 'table') {
    const widths = [800, 3800, 1900, 2571];
    const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
    body.push(new Table({
      width: { size: 9071, type: WidthType.DXA },
      columnWidths: widths,
      borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
      rows: bangHangMuc.map((row, r) => new TableRow({ children: row.map((c, i) => cell(c, widths[i], r === 0)) }))
    }));
    body.push(para([]));
  } else if (item.kind === 'tracked') {
    // Chữ xóa theo dõi chứa lỗi: add-in không được báo lỗi trong phần đã xóa
    const before = 'Phòng Tổng hợp đã ';
    const after = ' báo cáo tháng theo mẫu mới.';
    body.push(para([
      new TextRun({ text: before, font: FONT, size: SIZE }),
      new DeletedTextRun({ text: 'xản xuất hoạtt ', font: FONT, size: SIZE, ...TRACK }),
      new InsertedTextRun({ text: 'gửi', font: FONT, size: SIZE, ...TRACK, id: 2 }),
      new TextRun({ text: after, font: FONT, size: SIZE })
    ]));
    paragraphs.push({ text: `${before}gửi${after}`, viTri: 'Đoạn có Track Changes' });
  } else if (item.kind === 'oldfont') {
    body.push(para([new TextRun({ text: 'C«ng ty §iÖn lùc thùc hiÖn kÕ ho¹ch s¶n xuÊt kinh doanh n¨m 2026.', font: '.VnTime', size: SIZE })]));
    paragraphs.push({ text: 'C«ng ty §iÖn lùc thùc hiÖn kÕ ho¹ch s¶n xuÊt kinh doanh n¨m 2026.', viTri: 'Đoạn font cũ', fontCu: true });
  } else if (item.kind === 'footnote') {
    const text = 'Số liệu lấy theo báo cáo nhanh của Trung tâm Điều độ';
    body.push(para([new TextRun({ text, font: FONT, size: SIZE }), new FootnoteReferenceRun(1), new TextRun({ text: '.', font: FONT, size: SIZE })]));
    paragraphs.push({ text: `${text}.`, viTri: 'Đoạn có chú thích' });
  } else if (item.kind === 'form') {
    const texts = ['Họ và tên:\tNguyễn Thị Minh Hòa', 'Đơn vị:    Phòng Kỹ thuật', 'Mục lục ......................... 5', 'Đánh dấu (   ) nếu đồng ý.'];
    for (const text of texts) {
      const [a, b] = text.split('\t');
      body.push(para([
        new TextRun({ text: a, font: FONT, size: SIZE }),
        ...(b ? [new TextRun({ text: `\t${b}`, font: FONT, size: SIZE })] : [])
      ], { tabStops: [{ type: TabStopType.LEFT, position: 2400 }] }));
      paragraphs.push({ text, viTri: 'Dòng biểu mẫu' });
    }
  } else if (item.kind === 'symbols') {
    const text = 'Nhãn hiệu Microsoft® đã đăng ký, tỷ lệ ½ công suất, bản quyền © 2026.';
    body.push(para([new TextRun({ text, font: FONT, size: SIZE })]));
    paragraphs.push({ text, viTri: 'Đoạn có ký hiệu' });
  } else if (item.kind === 'sign') {
    for (const text of ['Nơi nhận:', '- Như trên;', '- HĐTV, BKS (để b/c);', '- Lưu: VT, KT.', 'KT. GIÁM ĐỐC', 'PHÓ GIÁM ĐỐC', 'Vũ Hải Đăng']) {
      body.push(para([new TextRun({ text, font: FONT, size: SIZE })]));
      paragraphs.push({ text, viTri: 'Phần ký' });
    }
  } else {
    record(item.p, viTri);
    const heading = item.kind === 'heading';
    const bold = heading || item.kind === 'h2';
    body.push(para(pieces(item.p, bold ? { bold: true } : {}), {
      alignment: heading || item.kind === 'center' ? AlignmentType.CENTER : AlignmentType.JUSTIFIED
    }));
  }
});

const page = { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } };
const header = new Header({ children: [new Paragraph({ children: [new TextRun({ text: 'CÔNG TY ĐIỆN LỰC BẮC GIANG - tài liệu thử add-in, xản xuất nội bộ', font: FONT, size: 20 })] })] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lỗi trong đầu trang và chân trang không được quét: xắp xếp', font: FONT, size: 20 })] })] });

async function save(children, file, footnotes) {
  const doc = new Document({
    creator: 'Soát Chính Tả',
    title: 'Văn bản mẫu kiểm tra add-in',
    features: { trackRevisions: false },
    numbering: { config: [{ reference: 'x', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT }] }] },
    footnotes,
    sections: [{ properties: { page }, headers: { default: header }, footers: { default: footer }, children }]
  });
  fs.writeFileSync(path.join(root, file), await Packer.toBuffer(doc));
}

(async () => {
  const footnotes = { 1: { children: [new Paragraph({ children: [new TextRun({ text: 'Chú thích có lỗi cố ý: bổ xung số liệu sau.', font: FONT, size: 20 })] })] } };
  await save(body, 'VAN-BAN-MAU-KIEM-TRA-THUC-TE.docx', footnotes);

  // Bản dài để đo tốc độ: lặp phần thân thành khoảng 50 trang, có bảng
  const clones = [];
  const cleanParts = noiDung.filter(x => !x.kind && x.p);
  for (let i = 0; i < 49; i++) {
    for (const item of cleanParts) clones.push(para(pieces(item.p), { alignment: AlignmentType.JUSTIFIED }));
    if (i % 6 === 0) {
      const widths = [4535, 4536];
      const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
      clones.push(new Table({
        width: { size: 9071, type: WidthType.DXA }, columnWidths: widths,
        borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
        rows: [0, 1, 2].map(r => new TableRow({ children: widths.map((w, c) => new TableCell({
          width: { size: w, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: `Ô ${r + 1}.${c + 1}: công suất 250kVA, xắp xếp lịch`, font: FONT, size: SIZE })] })]
        })) }))
      }));
    }
  }
  await save(clones, 'VAN-BAN-MAU-50-TRANG.docx', footnotes);

  fs.mkdirSync(path.join(root, 'data/mau'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/mau/dap-an.json'), JSON.stringify({ loi: key, doan: paragraphs }, null, 2));
  console.log(`Đã tạo: ${key.length} lỗi cài, ${paragraphs.length} đoạn`);
})();
