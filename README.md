# Soát Chính Tả Tiếng Việt - Microsoft Word Add-in Nội Bộ (Không AI)

[![CI Pipeline](https://github.com/tuongotpho/chinhta/actions/workflows/ci.yml/badge.svg)](https://github.com/tuongotpho/chinhta/actions/workflows/ci.yml)

Office Web Add-in chuyên dụng phục vụ công tác rà soát lỗi chính tả, lỗi gõ bàn phím (Telex/VNI), chuẩn hóa dấu câu và quy chuẩn viết hoa tên cơ quan hành chính theo **Nghị định 30/2020/NĐ-CP**, thiết kế dùng nội bộ cho các đơn vị ngành điện (EVN) và khối văn phòng.

---

## 🌟 Tính Năng Nổi Bật

1. **Bảo Mật Tuyệt Đối (Privacy-First):**
   - Văn bản **100% không bao giờ rời khỏi máy tính cá nhân**.
   - **Hoàn toàn không dùng AI, LLM** hay gọi bất kỳ máy chủ ngôn ngữ nào bên ngoài.
   - Chính sách mạng (CSP) đặt nghiêm ngặt `connect-src 'self'`.
2. **Quy Chuẩn Hành Chính & Chuyên Ngành:**
   - Kiểm tra chuẩn viết hoa cơ quan nhà nước theo **Nghị định 30/2020/NĐ-CP** (tự động phân biệt chữ hoa tiêu đề `BỘ TÀI CHÍNH` và chữ viết đúng `Bộ Tài chính`).
   - Tích hợp sẵn bộ từ điển thuật ngữ kỹ thuật chuyên ngành Điện lực (`MBA`, `TBA`, `CBCNV`, `110kV`, `220kV`, `MC 171`, v.v.).
3. **An Toàn Văn Bản & Định Dạng:**
   - Không làm hỏng cấu trúc bảng biểu, hình ảnh hay định dạng chữ.
   - Tương thích hoàn toàn với tính năng **Track Changes** (sửa đổi được theo dõi) và **Undo (Ctrl+Z)**.
   - Nhận diện tài liệu dùng font cũ (`.VnTime`, `VNI-Times`), không báo lỗi ảo, và có nút đổi sang Unicode giữ nguyên đậm, nghiêng, cỡ chữ.
4. **Trải Nghiệm Hiện Đại:**
   - Giao diện Fluent UI v9 hiện đại, mượt mà trong Taskpane bên phải Word.
   - Quét nền bằng Web Worker, không gây đơ giật Word trên tài liệu dài 50 trang.
   - Hỗ trợ sửa nhanh hàng loạt (bottom-up) cho các lỗi mức **Chắc chắn**.
   - Quản lý từ điển cá nhân lưu tại máy, hỗ trợ Xuất/Nhập file JSON.

---

## 🚀 Cài Đặt Nhanh (Đường T - Không Cần Quyền Admin)

1. Chạy `npm run dong-goi` để tạo `ban-phat-hanh/SoatChinhTa-CaiDat.zip`.
2. Giải nén lên một thư mục mạng dùng chung, mọi người có quyền đọc.
3. Nhân viên làm theo [hướng dẫn người dùng](docs/HUONG-DAN-NGUOI-DUNG.md).

Không dùng đường `Wef\Developer`: từ bản cập nhật Word 24–25/09/2026 add-in nạp kiểu này mất sau mỗi lần đóng Word. Số đo ở [KET-QUA-THU-CAI-DAT.md](docs/KET-QUA-THU-CAI-DAT.md).

### Gỡ cài đặt:
Bấm đúp `GO-SOAT-CHINH-TA.cmd` trong bộ cài.

---

## 🛠️ Dành Cho Lập Trình Viên

### Yêu cầu môi trường
- Node.js >= 20 (Khuyên dùng v22)
- npm >= 10

### Lệnh thực thi

```bash
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển (HTTPS local)
npm run dev

# Chạy kiểm thử đơn vị tự động (Vitest)
npm test

# Chạy bộ đo chất lượng 200 câu (Mục 5 đề bài)
npm run do-chinh-ta

# Kiểm tra tính hợp lệ của Manifest XML theo chuẩn Microsoft
npm run validate-manifest

# Đóng gói sản phẩm (Production build)
npm run build
```

---

## 📊 Kết Quả Đo Lường (Bộ 200 Câu Mẫu Chuẩn)

| Chỉ số | Mục tiêu Đề bài | Kết quả Thực tế | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Bắt đúng lỗi (Recall)** | $\ge 90\%$ | **100.00%** (185/185 câu) | **ĐẠT [PASSED]** |
| **Báo nhầm (False Positives)** | $< 1$ lỗi / trang | **0 lỗi** trên 15 câu sạch | **ĐẠT [PASSED]** |
| **Độ chuẩn xác (Precision)** | - | **100.00%** | **ĐẠT [PASSED]** |
| **Tốc độ xử lý (20 trang)** | $\le 5000\text{ ms}$ | **~208 ms** | **ĐẠT [PASSED]** |
| **Bảo mật dữ liệu** | 0 kết nối ra ngoài | **0 lệnh mạng chứa văn bản** | **ĐẠT [PASSED]** |

---

## 📄 Bản Quyền & Liên Hệ

**(C) August87 - 0982722036**  
Mã nguồn phục vụ triển khai nội bộ, bảo vệ an toàn thông tin dữ liệu văn bản.
