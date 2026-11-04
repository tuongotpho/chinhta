# Nguồn Dữ Liệu Từ Điển & Quy Tắc Soát Chính Tả Tiếng Việt

Tài liệu ghi nhận nguồn gốc, giấy phép và phạm vi sử dụng của toàn bộ dữ liệu từ điển trong dự án theo yêu cầu tại Bước 1 của Kế hoạch (04/11/2026).

---

## 1. Kiểm tra âm tiết (Dùng cho Luật R1)
- **Cách làm:** quy tắc cấu tạo âm tiết trong `src/engine/syllable.ts` (phụ âm đầu, vần, thanh), không dùng danh sách. Tệp `data/am-tiet-tieng-viet.txt` hiện không được dùng.
- **Giới hạn:** quy tắc chấp nhận cả dạng đúng cấu tạo nhưng không có thật, phần này do luật R8 bù lại.

---

## 2. Từ điển chuyên ngành Điện lực (Dùng cho R1/R2/R3 whitelist)
- **File:** `data/nganh-dien.txt`.
- **Nguồn:** Thuật ngữ kỹ thuật ngành điện, các đơn vị, quy chuẩn thiết bị điện lực EVN và hệ thống điện quốc gia.
- **Ví dụ:** `MBA` (máy biến áp), `TBA` (trạm biến áp), `CBCNV`, `110kV`, `220kV`, `500kV`, `MC 171`, `dao cách ly`, `chống sét van`, `hòa đồng bộ`, `xuất tuyến`, `nhị thứ`, `nhất thứ`, `SCADA`, `EMS`.
- **Giấy phép:** Tài liệu nội bộ kỹ thuật ngành điện, mở cho công tác quản trị văn bản.
- **Cập nhật:** Có thể bổ sung trực tiếp vào `data/nganh-dien.txt`, mỗi dòng một từ/thuật ngữ, không cần sửa đổi mã nguồn.

---

## 3. Danh sách cụm từ nhầm lẫn đã kiểm duyệt (Dùng cho Luật R2 - Mức Chắc chắn)
- **File:** `data/cum-tu-nham-lan.json`.
- **Nguồn:** Tổng hợp các lỗi chính tả phổ biến trong văn bản hành chính Việt Nam đã được kiểm duyệt nghiêm ngặt (s/x, tr/ch, d/gi/r, l/n, c/t, hỏi/ngã dạng sai tuyệt đối).
- **Nguyên tắc:** Chỉ đưa vào các cặp mà dạng sai 100% không có nghĩa trong tiếng Việt chuẩn (ví dụ: `xản xuất` -> `sản xuất`, `xắp xếp` -> `sắp xếp`, `trân thành` -> `chân thành`).
- **Giấy phép:** Tự tổng hợp và biên tập nội bộ.
- **Ghi chú 04/11/2026:** đã gỡ 49 cặp trùng nguyên văn danh sách lỗi của một phần mềm thương mại, chưa rõ quyền sử dụng. Không thêm dữ liệu từ phần mềm khác vào tệp này.
- **Trường `khongDungTruoc`:** mẫu chữ đứng ngay sau khiến cụm không phải lỗi, ví dụ `xúc tích` trong `tiếp xúc tích cực`.

---

## 4. Danh sách cặp từ phụ thuộc ngữ cảnh (Dùng cho Luật R3 - Mức Nên xem)
- **File:** `data/cap-tu-ngu-canh.json`.
- **Nguồn:** Các trường hợp cả hai từ đều đúng dạng âm tiết nhưng hay dùng nhầm lẫn dựa vào ngữ cảnh đi kèm (ví dụ: `chia sẽ` [sai] đi với danh từ/động từ chia sẻ cảm xúc/tài liệu; `dành giải` -> `giành giải`).
- **Nguyên tắc:** Phải đi kèm ranh giới cụm từ ngữ cảnh để không báo nhầm (ví dụ: `Nguyễn Văn Chia` là tên riêng, không báo lỗi).

---

## 5. Danh sách tên cơ quan theo Nghị định 30/2020/NĐ-CP (Dùng cho Luật R6 - Mức Nên xem)
- **File:** `data/co-quan-nd30.json`.
- **Nguồn:** Nghị định số 30/2020/NĐ-CP ngày 05/03/2020 của Chính phủ về công tác văn thư (Phụ lục II: Quy định viết hoa trong văn bản hành chính).
- **Nội dung:** Danh mục các cơ quan, tổ chức cấp Trung ương, Bộ, Ban, Ngành (ví dụ: `Bộ Tài chính`, `Chính phủ`, `Thủ tướng Chính phủ`, `Bộ Công Thương`, `Tập đoàn Điện lực Việt Nam`).
- **Quy tắc kiểm tra:**
  - Viết thường hoàn toàn (ví dụ: `bộ tài chính`) -> Báo lỗi mức Nên xem.
  - Viết chuẩn (ví dụ: `Bộ Tài chính`) -> Không báo lỗi.
  - Viết hoa toàn bộ (ví dụ: `BỘ TÀI CHÍNH` trong tiêu đề) -> Không báo lỗi.

---

## 6. Bảng tần suất cặp âm tiết (Dùng cho Luật R8 và xếp hạng gợi ý)
- **File:** `public/assets/ngram-v2.bin`, sinh bằng `scripts/build-ngram.py`. Chỉ chứa số đếm, không chứa văn bản.
- **Thống kê từ bài viết:** Wikipedia, Wikisource, Wikibooks và Wiktionary tiếng Việt, bản kết xuất tải ngày 04/11/2026 từ dumps.wikimedia.org, giấy phép CC BY-SA 4.0. Bỏ các bài về loài sinh vật do máy sinh hàng loạt vì làm lệch thống kê.
- **Danh sách từ để không báo nhầm từ có thật:**
  - Wiktionary tiếng Việt, CC BY-SA 4.0.
  - Mục từ tiếng Việt của Wiktionary tiếng Anh, bản trích tại kaikki.org, CC BY-SA 4.0.
  - Viet74K của Hồ Ngọc Đức, https://informatik.uni-leipzig.de/~duc/software/misc/wordlist.html, bản sao https://github.com/duyet/vietnamese-wordlist, giấy phép GNU GPL. Tác giả đề nghị gửi lại nếu có sửa đổi danh sách; dự án không sửa nội dung danh sách, chỉ dùng các cặp âm tiết.
- **Giấy phép chung:** vì dùng dữ liệu GPL và CC BY-SA 4.0, toàn bộ add-in phát hành theo GNU GPL phiên bản 3 trở lên (tệp `LICENSE`). Trang gốc Viet74K không ghi số phiên bản GPL, còn bản sao trên GitHub ghi GPL-2.0, nên cần pháp chế xác nhận nếu dùng chính thức ở cơ quan.
- **Loại trừ:** các cặp trong `data/cum-tu-nham-lan.json` và `data/cap-am-tiet-sai.txt` bị bỏ khỏi bảng vì là lỗi phổ biến có xuất hiện trong kho.
- **Tham số:** âm tiết xuất hiện từ 30 lần, tối đa 1,8 triệu cặp. Ngưỡng R8 chọn trên nửa dev của VSEC bằng `scripts/danh-gia-vsec.ts`, không dùng nửa test để chỉnh.

## 7. Dữ liệu chỉ dùng để đánh giá, không đóng gói vào add-in
- **VSEC:** bộ lỗi chính tả có nhãn, https://github.com/VSEC2021/VSEC, tải về `data/ngoai/` (đã liệt kê ở `.gitignore`).

## 8. Nguồn không dùng
- **Từ điển tiếng Việt (Viện Ngôn ngữ học, GS. Hoàng Phê chủ biên):** sách còn bản quyền, ghi nguồn không thay được việc xin phép. Không có dữ liệu nào của sách trong add-in hay trong repo. Bản quét trên máy chỉ dùng một lần để đo độ phủ, không lưu lại.
