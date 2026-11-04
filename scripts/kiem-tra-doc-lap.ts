// Kiểm tra độc lập: câu MỚI, không lấy từ bộ mẫu/test có sẵn.
import { checkParagraph } from '../src/engine/checker';

type Case = { cau: string; loi: string | null; nhom: string };

const cases: Case[] = [
  // --- Lỗi gõ phím / âm tiết sai (R1) - từ khác với mẫu ---
  { nhom: 'R1', cau: 'Đề nghị các phòng ban phoois hợp thực hiện.', loi: 'phoois' },
  { nhom: 'R1', cau: 'Kết quả kinh doanh nawm nay tăng trưởng tốt.', loi: 'nawm' },
  { nhom: 'R1', cau: 'Trạm biến áp vận hàng ổn định.', loi: null }, // "hàng" là âm tiết hợp lệ -> không bắt được là bình thường
  { nhom: 'R1', cau: 'Cán bộ cần nghiem túc chấp hành nội quy.', loi: 'nghiem' },
  { nhom: 'R1', cau: 'Tổng công ty đã phê duyêt kế hoạch.', loi: 'duyêt' },
  { nhom: 'R1', cau: 'Ban giám đốc chỉ đọa triển khai ngay.', loi: 'đọa' },
  { nhom: 'R1', cau: 'Đơn vị đảm bảo cung cấp điện liên tụcc.', loi: 'tụcc' },
  { nhom: 'R1', cau: 'Công nhân thục hiện thao tác đúng quy trình.', loi: 'thục' },
  { nhom: 'R1', cau: 'Báo cáo kêt quả kiểm tra định kỳ.', loi: 'kêt' },
  { nhom: 'R1', cau: 'Lịch cắt điện được thông baó trước.', loi: 'baó' },
  { nhom: 'R1', cau: 'Nhân viên trưcj ca phải ghi sổ nhật ký.', loi: 'trưcj' },
  { nhom: 'R1', cau: 'Kiểm tra hành lang tuyeesn đường dây.', loi: 'tuyeesn' },
  { nhom: 'R1', cau: 'Ngươì lao động được trang bị bảo hộ.', loi: 'Ngươì' },

  // --- Nhầm lẫn phổ biến (R2) - cặp KHÁC với mẫu ---
  { nhom: 'R2', cau: 'Công ty đã xử lý dứt điểm các tồn tại.', loi: null },
  { nhom: 'R2', cau: 'Đề nghị các đơn vị chấn chỉnh kịp thời.', loi: null },
  { nhom: 'R2', cau: 'Đây là vấn đề cấp bách cần giải quyết dức điểm.', loi: 'dức điểm' },
  { nhom: 'R2', cau: 'Cán bộ phải có trách nhiệm và chung thực.', loi: 'chung thực' },
  { nhom: 'R2', cau: 'Công tác giám sát được thực hiện sát xao.', loi: 'sát xao' },
  { nhom: 'R2', cau: 'Đơn vị cần dè dặt khi xử lý sự cố.', loi: null },
  { nhom: 'R2', cau: 'Hội nghị diễn ra trong không khí xôi nổi.', loi: 'xôi nổi' },
  { nhom: 'R2', cau: 'Công trình đã được nghiệm thu, bàn giao, đưa vào xử dụng.', loi: 'xử dụng' },
  { nhom: 'R2', cau: 'Đây là giải pháp mang tính đột phá và sáng xuất.', loi: 'sáng xuất' },
  { nhom: 'R2', cau: 'Các đơn vị cần nghiêm túc chấp hành, không được dấu diếm.', loi: 'dấu diếm' },
  { nhom: 'R2', cau: 'Hồ sơ dự thầu không hợp nệ.', loi: 'hợp nệ' },
  { nhom: 'R2', cau: 'Tăng cường công tác kiểm tra, dám sát.', loi: 'dám sát' },
  { nhom: 'R2', cau: 'Cần chuẩn bị chu đáo, tỷ mỉ cho hội nghị.', loi: 'tỷ mỉ' },
  { nhom: 'R2', cau: 'Ông ấy là người rất giản dị và gần gũi, chân chất.', loi: null },
  { nhom: 'R2', cau: 'Kết quả đạt được là rất đáng chân trọng.', loi: 'chân trọng' },
  { nhom: 'R2', cau: 'Cần giữ gìn và phát huy truyền thống, không để xảy ra xai sót.', loi: 'xai sót' },

  // --- Ngữ cảnh (R3) ---
  { nhom: 'R3', cau: 'Đơn vị đã dành được nhiều thành tích xuất sắc.', loi: 'dành được' },
  { nhom: 'R3', cau: 'Chúng tôi xin chia sẽ một số kinh nghiệm.', loi: 'chia sẽ' },

  // --- Dấu câu (R4) ---
  { nhom: 'R4', cau: 'Kính gửi : Ban Giám đốc Công ty.', loi: ' :' },
  { nhom: 'R4', cau: 'Đề nghị các đơn vị thực hiện nghiêm túc.Trân trọng!', loi: '.T' },
  { nhom: 'R4', cau: 'Nội dung gồm ( 03 ) phần chính.', loi: '( ' },

  // --- Viết hoa (R6) ---
  { nhom: 'R6', cau: 'Thực hiện chỉ đạo của ủy ban nhân dân tỉnh.', loi: 'ủy ban nhân dân' },
  { nhom: 'R6', cau: 'Báo cáo gửi bộ khoa học và công nghệ.', loi: 'bộ khoa học và công nghệ' },
  { nhom: 'R6', cau: 'Theo kế hoạch của tổng công ty điện lực miền bắc.', loi: 'tổng công ty điện lực miền bắc' },

  // --- Câu SẠCH văn bản hành chính thật (không được báo lỗi) ---
  { nhom: 'SACH', cau: 'Căn cứ Luật Điện lực ngày 03 tháng 12 năm 2004; Luật sửa đổi, bổ sung một số điều của Luật Điện lực ngày 20 tháng 11 năm 2012;', loi: null },
  { nhom: 'SACH', cau: 'Căn cứ Nghị định số 137/2013/NĐ-CP ngày 21/10/2013 của Chính phủ quy định chi tiết thi hành một số điều của Luật Điện lực.', loi: null },
  { nhom: 'SACH', cau: 'Theo đề nghị của Trưởng phòng Kỹ thuật, Giám đốc Công ty quyết định:', loi: null },
  { nhom: 'SACH', cau: 'Điều 1. Ban hành kèm theo Quyết định này Quy chế quản lý vận hành lưới điện phân phối.', loi: null },
  { nhom: 'SACH', cau: 'Quyết định có hiệu lực kể từ ngày ký. Các ông (bà) Trưởng các phòng, ban chịu trách nhiệm thi hành.', loi: null },
  { nhom: 'SACH', cau: 'Nơi nhận: Như Điều 3; Lưu: VT, KT.', loi: null },
  { nhom: 'SACH', cau: 'Thời gian: 08h00 ngày 15/11/2026, địa điểm: Hội trường tầng 3, số 20 Trần Nguyên Hãn.', loi: null },
  { nhom: 'SACH', cau: 'Liên hệ: ông Nguyễn Văn Khoa, SĐT 0912345678, email khoa.nv@evn.com.vn để biết thêm chi tiết.', loi: null },
  { nhom: 'SACH', cau: 'Tổng giá trị hợp đồng là 1.250.000.000 đồng (Bằng chữ: Một tỷ hai trăm năm mươi triệu đồng).', loi: null },
  { nhom: 'SACH', cau: 'Thay thế máy biến áp 250kVA - 22/0,4kV tại trạm Thôn Đông, xã Kim Sơn.', loi: null },
  { nhom: 'SACH', cau: 'Sản lượng điện thương phẩm đạt 1.234,56 triệu kWh, tăng 8,5% so với cùng kỳ.', loi: null },
  { nhom: 'SACH', cau: 'Đề nghị các đơn vị khẩn trương triển khai, báo cáo kết quả về Công ty trước ngày 30/11/2026.', loi: null },
  { nhom: 'SACH', cau: 'Công ty TNHH MTV Điện lực Hải Phòng phối hợp với Sở Công Thương tổ chức kiểm tra.', loi: null },
  { nhom: 'SACH', cau: 'Hệ thống phần mềm CMIS, OMS và PMIS được khai thác hiệu quả trên nền tảng Microsoft Teams.', loi: null },
  { nhom: 'SACH', cau: 'Khoa học và công nghệ là động lực phát triển của ngành.', loi: null },
  { nhom: 'SACH', cau: 'Anh ấy luôn luôn hoàn thành tốt nhiệm vụ được giao.', loi: null },
  { nhom: 'SACH', cau: 'Ông Chia sẽ tham dự cuộc họp chiều nay.', loi: null },
  { nhom: 'SACH', cau: 'Xuất xứ hàng hóa: Việt Nam; bảo hành 24 tháng.', loi: null },
  { nhom: 'SACH', cau: 'Kỹ sư Lê Thị Hoà và kỹ thuật viên Phạm Thuỷ cùng thực hiện.', loi: null },
  { nhom: 'SACH', cau: 'Đường xá được nâng cấp, phố xá sạch đẹp.', loi: null },
];

let bat = 0, tongLoi = 0, sot: string[] = [];
let nham = 0, tongSach = 0, nhamList: string[] = [];

for (const c of cases) {
  const errs = checkParagraph(c.cau);
  if (c.loi) {
    tongLoi++;
    const hit = errs.some(e => e.goc.toLowerCase().includes(c.loi!.toLowerCase().trim()) || c.loi!.toLowerCase().includes(e.goc.toLowerCase().trim()));
    if (hit) bat++; else sot.push(`[${c.nhom}] "${c.loi}" trong: ${c.cau}  -> engine trả: ${JSON.stringify(errs.map(e => e.luat + ':' + e.goc))}`);
  } else {
    tongSach++;
    if (errs.length) { nham += errs.length; nhamList.push(`[${c.nhom}] ${c.cau}\n      -> ${errs.map(e => `${e.luat}:"${e.goc}"→${JSON.stringify(e.goiY)}`).join(' | ')}`); }
  }
}

console.log(`\nBẮT ĐÚNG: ${bat}/${tongLoi} (${(bat / tongLoi * 100).toFixed(0)}%)`);
console.log(`BÁO NHẦM: ${nham} lỗi trên ${tongSach} câu không có lỗi cần bắt\n`);
console.log('--- BỎ SÓT ---'); sot.forEach(s => console.log('  ' + s));
console.log('\n--- BÁO NHẦM ---'); nhamList.forEach(s => console.log('  ' + s));

