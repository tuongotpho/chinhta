import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sinh 200 câu mẫu có nhãn chuẩn xác
const samples = [];

// 1. Nhóm R1: Lỗi âm tiết, kẹt phím, gõ nhầm Telex (35 câu)
const r1Templates = [
  ['Quy định tại ddieefu 5 của nghị định này.', 'R1', 'ddieefu'],
  ['Công tác hoạtt động của chi nhánh cần tăng cường.', 'R1', 'hoạtt'],
  ['Trong thnags tới sẽ hoàn thành dự án.', 'R1', 'thnags'],
  ['Cần kiểmm tra lại số liệu trước khi nộp.', 'R1', 'kiểmm'],
  ['Hệ thống đượcc nâng cấp đồng bộ.', 'R1', 'đượcc'],
  ['Đơn vị ddieeu hành lưới điện an toàn.', 'R1', 'ddieeu'],
  ['Thời gian baos cáo là trước 17 giờ.', 'R1', 'baos'],
  ['Kế hoạch tieengs độ được theo dõi chặt chẽ.', 'R1', 'tieengs'],
  ['Đang xuấtt điện ra lưới quốc gia.', 'R1', 'xuấtt'],
  ['Các thieets bị đã được kiểm định.', 'R1', 'thieets']
];

for (let i = 0; i < 35; i++) {
  const item = r1Templates[i % r1Templates.length];
  samples.push({
    id: `R1-${i + 1}`,
    cau: `${item[0]} (Mẫu số ${i + 1})`,
    coLoi: true,
    loaiLoi: item[1],
    tuLoi: item[2]
  });
}

// 2. Nhóm R2: Cụm từ nhầm lẫn đã kiểm duyệt (45 câu)
const r2Pairs = [
  ['xản xuất', 'sản xuất', 'Công ty xản xuất thiết bị điện tử.'],
  ['xắp xếp', 'sắp xếp', 'Đã xắp xếp lịch làm việc tuần tới.'],
  ['trân thành', 'chân thành', 'Tôi trân thành cảm ơn sự hỗ trợ của anh.'],
  ['cứu dỗi', 'cứu rỗi', 'Hy vọng tìm thấy sự cứu dỗi tâm hồn.'],
  ['sơ xuất', 'sơ suất', 'Do sơ xuất trong quá trình tính toán.'],
  ['cọ sát', 'cọ xát', 'Tạo điều kiện cho cán bộ cọ sát thực tế.'],
  ['suông sẻ', 'suôn sẻ', 'Mọi công việc đều diễn ra suông sẻ.'],
  ['chín suồi', 'chín muồi', 'Thời cơ cách mạng đã chín suồi.'],
  ['đường xá', 'đường sá', 'Hạ tầng đường xá nông thôn được nâng cấp.'],
  ['phố sá', 'phố xá', 'Khu vực phố sá đông đúc người qua lại.'],
  ['sáng lạng', 'xán lạn', 'Tương lai sáng lạng của thế hệ trẻ.'],
  ['vô hình chung', 'vô hình trung', 'Hành động đó vô hình chung gây khó khăn.'],
  ['tựu chung', 'tựu trung', 'Tựu chung lại vấn đề vẫn là kinh phí.'],
  ['nhận chức', 'nhậm chức', 'Lễ nhận chức của tổng giám đốc.'],
  ['thăm quan', 'tham quan', 'Đoàn đi thăm quan nhà máy thủy điện.'],
  ['chuẩn đoán', 'chẩn đoán', 'Kết quả chuẩn đoán kỹ thuật TBA.'],
  ['bổ xung', 'bổ sung', 'Cần bổ xung thêm 2 nhân sự vận hành.'],
  ['xuất sứ', 'xuất xứ', 'Hàng hóa có nguồn gốc xuất sứ rõ ràng.'],
  ['đọc giả', 'độc giả', 'Nhiều đọc giả gửi thư khen ngợi.'],
  ['giành dụm', 'dành dụm', 'Khoản tiền giành dụm nhiều năm qua.']
];

for (let i = 0; i < 45; i++) {
  const item = r2Pairs[i % r2Pairs.length];
  samples.push({
    id: `R2-${i + 1}`,
    cau: `${item[2]} (Mục ${i + 1})`,
    coLoi: true,
    loaiLoi: 'R2',
    tuLoi: item[0]
  });
}

// 3. Nhóm R3: Nhầm theo ngữ cảnh (30 câu)
const r3Items = [
  ['Đội bóng đã dành giải nhất hội thao công ty.', 'R3', 'dành giải'],
  ['Cần chia sẽ kinh nghiệm quản lý lưới điện.', 'R3', 'chia sẽ'],
  ['Món quà này giành cho cán bộ xuất sắc.', 'R3', 'giành cho'],
  ['Tập thể giành tình cảm lớn cho các anh.', 'R3', 'giành tình cảm'],
  ['Phần thưởng đặc biệt dành giải vô địch.', 'R3', 'dành giải'],
  ['Hãy chia sẽ tài liệu này cho phòng ban.', 'R3', 'chia sẽ']
];

for (let i = 0; i < 30; i++) {
  const item = r3Items[i % r3Items.length];
  samples.push({
    id: `R3-${i + 1}`,
    cau: `${item[0]} (Ví dụ ${i + 1})`,
    coLoi: true,
    loaiLoi: item[1],
    tuLoi: item[2]
  });
}

// 4. Nhóm R4: Dấu câu và khoảng trắng (30 câu)
const r4Items = [
  ['Báo cáo công ty ,phòng tài chính duyệt .', 'R4', ' ,'],
  ['Hội đồng quản trị,ban giám đốc tham dự .', 'R4', ',b'],
  ['Kế hoạch quý 1 ,quý 2 đã thông qua.', 'R4', ' ,'],
  ['Hệ thống vận hành an toàn ,hiệu quả cao.', 'R4', ' ,'],
  ['Danh sách cán bộ gồm:Nguyễn Văn A,Trần Văn B.', 'R4', ':N'],
  ['Chỉ tiêu hoàn thành ,đạt kế hoạch giao.', 'R4', ' ,']
];

for (let i = 0; i < 30; i++) {
  const item = r4Items[i % r4Items.length];
  samples.push({
    id: `R4-${i + 1}`,
    cau: `${item[0]} (Số liệu ${i + 1})`,
    coLoi: true,
    loaiLoi: item[1],
    tuLoi: item[2]
  });
}

// 5. Nhóm R5: Lặp từ liền nhau (20 câu)
const r5Items = [
  ['Vấn đề nằm trong trong báo cáo quý.', 'R5', 'trong trong'],
  ['Công ty và và chi nhánh đã ký kết.', 'R5', 'và và'],
  ['Các đơn vị đã đã hoàn thành tốt.', 'R5', 'đã đã'],
  ['Đây là là nội dung rất quan trọng.', 'R5', 'là là'],
  ['Những những kết quả đạt được đáng ghi nhận.', 'R5', 'những những']
];

for (let i = 0; i < 20; i++) {
  const item = r5Items[i % r5Items.length];
  samples.push({
    id: `R5-${i + 1}`,
    cau: `${item[0]} (Đoạn ${i + 1})`,
    coLoi: true,
    loaiLoi: item[1],
    tuLoi: item[2]
  });
}

// 6. Nhóm R6: Viết hoa tên cơ quan Nghị định 30 (25 câu)
const r6Items = [
  ['Văn bản hướng dẫn của bộ tài chính ban hành.', 'R6', 'bộ tài chính'],
  ['Quy định từ bộ công thương về giá điện.', 'R6', 'bộ công thương'],
  ['Chỉ đạo của thủ tướng chính phủ về năng lượng.', 'R6', 'thủ tướng chính phủ'],
  ['Nghị quyết của chính phủ tại phiên họp.', 'R6', 'chính phủ'],
  ['Quyết định của tập đoàn điện lực việt nam năm 2026.', 'R6', 'tập đoàn điện lực việt nam']
];

for (let i = 0; i < 25; i++) {
  const item = r6Items[i % r6Items.length];
  samples.push({
    id: `R6-${i + 1}`,
    cau: `${item[0]} (Hồ sơ ${i + 1})`,
    coLoi: true,
    loaiLoi: item[1],
    tuLoi: item[2]
  });
}

// 7. Nhóm Câu sạch chuẩn (15 câu) - Kiểm tra False Positive (Báo nhầm)
const cleanItems = [
  'Chúng tôi chân thành cảm ơn quý khách hàng đã đồng hành.',
  'Bộ Tài chính đã ban hành thông tư mới ngày hôm qua.',
  'BỘ TÀI CHÍNH THÔNG BÁO KẾ HOẠCH NĂM 2026.',
  'Ông Nguyễn Văn Chia sẽ phụ trách điều hành trạm biến áp.',
  'Đường dây 500kV Bắc Nam vận hành an toàn tuyệt đối.',
  'Công tác quản lý kỹ thuật của TBA 220kV đạt chỉ tiêu.',
  'Tập đoàn Điện lực Việt Nam luôn chú trọng an toàn lao động.',
  'CBCNV nhiệt liệt hưởng ứng phong trào thi đua.',
  'Máy cắt MC 171 được đóng điện thành công lúc 10h.',
  'Mỗi ngày một phát triển mạnh mẽ và bền vững hơn.',
  'Bảo vệ rơle số của ngăn lộ xuất tuyến hoạt động chuẩn xác.',
  'Toàn bộ văn bản đã được soát xét kỹ lưỡng trước khi phát hành.',
  'Chính phủ yêu cầu các bộ ngành đẩy nhanh tiến độ.',
  'Hội đồng nghiệm thu cơ sở đánh giá cao chất lượng công trình.',
  'Hệ thống SCADA ghi nhận thông số phụ tải ổn định.'
];

for (let i = 0; i < 15; i++) {
  samples.push({
    id: `CLEAN-${i + 1}`,
    cau: cleanItems[i % cleanItems.length],
    coLoi: false,
    loaiLoi: null,
    tuLoi: null
  });
}

console.log(`Tổng số mẫu được sinh: ${samples.length} câu`);
fs.writeFileSync(path.join(__dirname, '../data/test-samples.json'), JSON.stringify(samples, null, 2), 'utf8');
console.log('Đã lưu thành công vào data/test-samples.json');
