# Nguồn Dữ Liệu Từ Điển & Quy Tắc Soát Chính Tả Tiếng Việt

Tài liệu ghi nhận nguồn gốc, giấy phép và phạm vi sử dụng của toàn bộ dữ liệu từ điển trong dự án theo yêu cầu tại Bước 1 của Kế hoạch (04/11/2026).

---

## 1. Tập âm tiết tiếng Việt hợp lệ (Dùng cho Luật R1)
- **Nguồn:** Danh mục âm tiết ngữ âm Tiếng Việt chuẩn hóa theo quy tắc chính tả hiện hành của Bộ Giáo dục & Đào tạo và Viện Ngôn ngữ học.
- **Quy mô:** ~6.800 âm tiết chuẩn có nghĩa và hợp lệ trong tiếng Việt hiện đại.
- **Giấy phép:** Dữ liệu chuẩn ngôn ngữ công cộng (Public Domain / Tri thức mở), không vi phạm bản quyền từ điển thương mại.
- **Ngày thu thập:** 04/11/2026.
- **Mục đích:** Kiểm tra cấu trúc âm tiết hợp lệ (phụ âm đầu + âm đệm + nguyên âm chính + âm cuối + thanh điệu). Phát hiện các từ gõ sai bàn phím Telex/VNI (như `ddieefu`, `hoạtt`).

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
