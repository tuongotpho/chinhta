# [04] Báo cáo sửa lỗi và kết quả kiểm chứng add-in soát chính tả

04/11/2026 · Tiếp nối: [02-BAO-CAO-DANH-GIA-ADDIN-CHINH-TA.md](02-BAO-CAO-DANH-GIA-ADDIN-CHINH-TA.md) · Nguồn: mã nguồn sau khi sửa (chưa commit), bộ VSEC, Word 16.0.20527 trên máy phát triển

## 1. Kết luận

**Engine đã tốt lên rõ rệt trên dữ liệu chưa từng dùng để chỉnh, nhưng add-in chưa nghiệm thu được.** Tỷ lệ bắt lỗi chữ có nghĩa nhưng sai tăng từ 2,9% lên 54,8%, độ chính xác từ 60,6% lên 91,9%, gợi ý số 1 đúng từ 35,8% lên 84,5%.

Bản này đã triển khai lên `soatchinhta.web.app` ngày 04/11/2026, từ mã chưa commit. Hai việc vẫn thiếu:

- **Chưa chạy trên Word thật.** Tầng Word mới chỉ qua test với Word giả lập.
- **Chưa có số nghiệm thu.** Còn thiếu bộ 200 câu đã duyệt nhãn và 20 văn bản thật theo Mục 5 đề bài.

## 2. Kết quả trên dữ liệu chưa dùng để chỉnh

Bộ VSEC được chia cố định: dòng chẵn để chỉnh ngưỡng, dòng lẻ chỉ để chấm. Đã khóa mã rồi mới chạy nửa chấm, đúng một lần. Nửa chỉnh cho kết quả tương đương (55,4%, độ chính xác 92,2%), tức không có dấu hiệu quá khớp.

| Chỉ số trên VSEC | Bản trước khi sửa | Bản hiện tại (nửa chấm) |
| --- | --- | --- |
| Toàn bộ lỗi, trừ R4 | 18,2% | **60,0%** (3.358/5.601) |
| Chữ có nghĩa nhưng sai | 2,9% | **54,8%** (2.556/4.667) |
| Từ sai cấu tạo | 94,3% | **85,9%** (802/934) |
| Độ chính xác (mức sàn) | 60,6% | **91,9%** |
| Gợi ý số 1 đúng | 35,8% | **84,5%** |
| Lỗi bắt được không có gợi ý | 45,5% | **5,2%** |
| Báo ngoài nhãn trên 1.000 âm tiết | 4,71 | **2,10** |

Cột bên trái đo trên toàn bộ VSEC, cột bên phải trên nửa chấm.

Chỉ số từ sai cấu tạo giảm là có chủ đích: chữ cái lẻ và chữ không dấu không có gợi ý không còn bị báo, vì đề bài yêu cầu bỏ qua từ tiếng Anh. Phần sót lớn là chữ cái lẻ do VSEC cắt từ (`t`, `p`, `V`), đổi lại không còn báo nhầm `điểm b`, `b)`, `recloser`.

VSEC là văn bản đại chúng, không phải thước đo nghiệm thu.

## 3. Kết quả trên tệp Word mẫu

Tệp [VAN-BAN-MAU-KIEM-TRA-THUC-TE.docx](VAN-BAN-MAU-KIEM-TRA-THUC-TE.docx) soạn sau khi khóa mã: 2 trang, 702 từ, 30 lỗi cài. Đáp án ở [docs/DAP-AN-VAN-BAN-MAU.md](docs/DAP-AN-VAN-BAN-MAU.md). Chấm trên đúng các đoạn của tệp, bằng engine, chưa qua Word.

| Lượt | Phát hiện | Gợi ý số 1 đúng | Báo nhầm |
| --- | --- | --- | --- |
| Lượt đầu, khi mã đang khóa | **21/30** | 21 | **2** |
| Sau khi sửa hai lỗi lộ ra | 21/30 | 21 | 0 |

Chỉ lượt đầu có giá trị kiểm chứng độc lập. Tỷ lệ 70% chưa đạt ngưỡng 90% của đề bài, dù mẫu nhỏ và do người đánh giá tự chọn nên chỉ mang tính chỉ báo.

**9 lỗi bỏ sót:**

- Chữ có nghĩa nhưng lạc ngữ cảnh: `khách hành`, `vận hàng`, `đường giây`, `nghiêm thu`, `máy biến ấp`, `tháng → thánh`, `hệ thông`.
- `Nhuwngx` đứng sau `d)` bị coi là tên riêng.
- `2026.Phòng`: thiếu dấu cách sau số.

Lỗi lộ ra rồi đã sửa: số La Mã trong tiêu đề bị báo (`III`, `IV`), và đoạn có ba ký hiệu `®`, `½`, `©` bị coi nhầm là font cũ.

## 4. Những việc đã làm

| Việc | Kết quả |
| --- | --- |
| Dữ liệu nghi vấn | Gỡ 49 cặp R2 trùng nguyên văn danh sách của một phần mềm thương mại và cặp sai `sáng xuất`; còn 50 cặp |
| Kịch bản bóc tách, báo cáo 03 | Đưa vào `.gitignore`, không xóa |
| Hỏng văn bản | Sửa nhanh chỉ áp dụng lỗi có đúng một gợi ý; giữ chữ hoa; không còn gộp tab và dấu cách biểu mẫu; R2 có điều kiện ngữ cảnh |
| Báo sai kết quả | Chỉ bỏ khỏi danh sách lỗi đã sửa thật; lỗi không có gợi ý không còn nút Sửa; thất bại hiện thông báo |
| Word | Quét vùng chọn đủ mọi quan hệ vị trí; đọc lại đoạn trước khi ghi, đổi thì không ghi và quét lại; quét lại đoạn sau mỗi lần sửa; loại chữ đã xóa theo dõi; từ chối khi không xác định được vị trí |
| Giao diện | Có thông báo chưa quét đầu trang, chân trang, chú thích; có tùy chọn R7, R8; worker lỗi thì tự chạy trực tiếp |
| Tách từ, âm tiết | Hết cắt đôi `5 mét`; nhận đơn vị, mã hiệu, từ nối gạch; nhận `quýt`, `Quỳnh`; từ chối `coa` |
| Gợi ý | Xếp theo tần suất và chữ đứng cạnh; bỏ mẹo viết cứng `nghiem`, `nawm` |
| Luật mới R8 | Tần suất cặp âm tiết, mức Nên xem, không vào sửa hàng loạt |
| Bộ đo | `do-chinh-ta` chấm đúng từ gán nhãn, bỏ chữ "ĐẠT" viết cứng; thêm `danh-gia-vsec.ts`, `kiem-tra-mau.ts` |
| Hồ sơ | Các dòng "ĐẠT" không có ảnh chuyển về "Chưa kiểm chứng"; cập nhật nguồn dữ liệu |

Mô hình R8 tự dựng từ Wikipedia và Wikisource tiếng Việt: 20.741 âm tiết, 1.034.196 cặp, tệp 6,1 MB, tải một lần khi quét. Lệnh tải nằm ở lớp giao diện, nên `src/engine` vẫn không có đường ra mạng và test bảo mật không phải nới.

## 5. Tệp thử trên Word

Đã mở bằng Word thật qua COM, không báo lỗi.

| Tệp | Word đếm được | Dùng để thử |
| --- | --- | --- |
| [VAN-BAN-MAU-KIEM-TRA-THUC-TE.docx](VAN-BAN-MAU-KIEM-TRA-THUC-TE.docx) | 2 trang, 1 bảng, 2 sửa đổi theo dõi, 1 chú thích | Chữ đậm trong cụm, ô bảng, từ lặp, Track Changes, font cũ, biểu mẫu, đầu trang, chân trang |
| [VAN-BAN-MAU-50-TRANG.docx](VAN-BAN-MAU-50-TRANG.docx) | 50 trang, 9 bảng, 866 đoạn | Tốc độ và giao diện không đơ |

Tốc độ tệp 50 trang: 1,7 giây trong Node, chưa đo trên Word.

Danh sách kiểm tra khi thử trên Word:

1. Quét toàn bộ: so số lỗi với đáp án; không có báo lỗi trong đầu trang, chân trang, chú thích.
2. Đoạn có Track Changes: không báo `xản xuất hoạtt` trong phần đã xóa.
3. Đoạn `hoạtt` ba lần: sửa lần 2 trước, kiểm tra đúng chỗ.
4. Sửa nhanh, rồi Ctrl+Z: văn bản về nguyên trạng.
5. Sửa tay một đoạn rồi bấm Sửa ở lỗi cũ: add-in phải từ chối và quét lại.
6. Bôi đen từ đầu đoạn qua nhiều đoạn, quét vùng chọn: phải đủ các đoạn.
7. `vận hàng`: nếu được sửa, kiểm tra định dạng đậm.
8. Chụp ảnh từng bước vào [KIEM-THU-WORD.md](docs/KIEM-THU-WORD.md).

## 6. Giới hạn còn lại

- **Bộ mẫu 200 câu:** chỉ có 67 câu khác nhau, chưa được duyệt nhãn. Con số 100% hiện tại không phải số nghiệm thu.
- **Mẫu cũ đã bị dùng để sửa:** Quyết định mẫu còn 0 báo nhầm và bộ 68 lỗi đạt 85%, nhưng đây là số trên dữ liệu đã biết, không dùng để kết luận.
- **Lỗi đã biết:** `có công xuất lớn` chưa bắt được, ghi bằng `it.fails` trong test. Lỗi `đọc giả thuyết` có R8 báo nhầm ở mức Nên xem.
- **R8 chưa đo trên văn bản hành chính thật.** Dữ liệu học chủ yếu là bách khoa toàn thư, và có lẫn lỗi chính tả.
- **Tốc độ** đo trong Node trên máy phát triển.
- **Sửa chữ một phần in đậm:** chưa thử; Word có thể áp một định dạng cho cả cụm.

## 7. Cần chủ dự án quyết định

1. **Thử trên Word.** Đã triển khai; làm theo danh sách ở Mục 5.
2. **Commit và kho công khai.** Thay đổi chưa commit, nên trang đang chạy mới hơn mã trên GitHub. Site `soatchinhta` thuộc dự án `app-from-ai`, khớp với manifest; `.firebaserc` trong commit `bd7e26e` còn trỏ `soatchinhta-addin` nên bản đang sửa cần được commit.
3. **Giấy phép.** Bảng n-gram lấy từ nội dung CC BY-SA 4.0; cần pháp chế xác nhận nghĩa vụ ghi nguồn và chia sẻ tương tự.
4. **Dữ liệu nghiệm thu.** Duyệt nhãn 200 câu và cung cấp 20 văn bản thật. Có văn bản thật thì cũng nên đưa vào huấn luyện R8 cho nội bộ.
5. **Danh sách R2.** Duyệt danh sách mở rộng do người trong đơn vị lập, thay cho 49 cặp đã gỡ.

## Phụ lục. Cách chạy lại

```bash
npx tsc --noEmit
npx vitest run                              # 80 test
npx tsx scripts/do-chinh-ta.ts
npx tsx scripts/danh-gia-vsec.ts test 8     # cần data/ngoai/vsec.jsonl
npx tsx scripts/kiem-tra-mau.ts
python -I -X utf8 scripts/build-ngram.py public/assets/ngram-v1.bin
node scripts/tao-van-ban-mau.cjs            # cần: npm install --no-save docx
```

Công cụ đã cài trên máy: `rea-agents` 6.8.0 (npm toàn cục), OfficeCLI 1.0.160 (`~/.local/bin`, đã đối chiếu SHA256).
