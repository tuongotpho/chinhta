# HƯỚNG DẪN SỬ DỤNG ADD-IN SOÁT CHÍNH TẢ TIẾNG VIỆT
*(Dành cho cán bộ nhân viên văn phòng)*

Tác giả: **August87** - Điện thoại / Zalo hỗ trợ: **0982722036**

---

## 1. Cài Đặt Lần Đầu (Chỉ Làm 1 Lần Duy Nhất)

Không cần cài phần mềm, không cần quyền quản trị viên máy tính:

1. Nhấn phím **Windows**, gõ `cmd` rồi bấm **Enter** để mở cửa sổ Command Prompt màu đen.
2. Sao chép toàn bộ dòng lệnh dưới đây:
   ```cmd
   mkdir "%USERPROFILE%\SoatChinhTa" & curl -s -o "%USERPROFILE%\SoatChinhTa\manifest.xml" https://raw.githubusercontent.com/tuongotpho/chinhta/main/manifest.xml & reg add "HKCU\Software\Microsoft\Office\16.0\Wef\Developer" /v "0d864eeb-0939-4159-8800-21a3426119d2" /t REG_SZ /d "%USERPROFILE%\SoatChinhTa\manifest.xml" /f
   ```
3. Nhấp chuột phải vào cửa sổ Command Prompt để dán và nhấn **Enter**.
4. Mở Word lên: Trên thanh Ribbon xuất hiện tab **Chính Tả** với nút **Soát Chính Tả**.

---

## 2. Hướng Dẫn Sử Dụng Hằng Ngày

### Bước 1: Mở Bảng Soát Lỗi
- Mở tài liệu Word cần kiểm tra.
- Bấm vào tab **Chính Tả** trên thanh công cụ phía trên Word, sau đó bấm nút **Soát Chính Tả**.
- Cửa sổ add-in sẽ xuất hiện ở cạnh phải màn hình.

### Bước 2: Quét Tài Liệu
- **Quét toàn bộ:** Quét toàn bộ nội dung từ trang đầu đến trang cuối (kể cả chữ trong các bảng biểu).
- **Vùng chọn:** Chỉ quét đoạn văn bản bạn đang bôi đen bằng chuột.

### Bước 3: Xem & Sửa Lỗi
Add-in phân loại lỗi thành 3 nhóm rõ ràng:
- 🔴 **Chắc chắn:** Lỗi gõ nhầm Telex (ví dụ: `ddieefu` -> `điều`), kẹt phím (`hoạtt` -> `hoạt`), cặp từ sai tuyệt đối (`xản xuất` -> `sản xuất`), khoảng trắng trước dấu phẩy.
- 🟡 **Nên xem:** Lỗi ngữ cảnh (`dành giải` -> `giành giải`), lặp từ (`trong trong`), sai chuẩn viết hoa cơ quan nhà nước (`bộ tài chính` -> `Bộ Tài chính`).
- 🔵 **Gợi ý:** Kiểu bỏ dấu truyền thống/hiện đại (`hoà` -> `hòa`).

**Các thao tác trên từng lỗi:**
- Bấm **Xem**: Word sẽ tự động nhảy đến đúng vị trí và bôi đen từ lỗi trong văn bản.
- Bấm **Sửa**: Word sẽ thay thế từ sai bằng từ gợi ý đúng.
- Bấm **Bỏ qua**: Tạm thời bỏ qua từ này trong phiên làm việc.
- Bấm **Lưu từ điển**: Thêm từ này vào Từ điển cá nhân để add-in không bao giờ báo lỗi nữa.

> Add-in không dùng AI. Luật ngữ cảnh R8 dựa trên tần suất cặp âm tiết nên chỉ ở mức **Nên xem**: bạn phải đọc và tự quyết định. Add-in không thay được người đọc lại.

### Bước 4: Sửa Nhanh Hàng Loạt Lỗi Chắc Chắn
- Nếu tài liệu có nhiều lỗi hiển nhiên, bấm nút **Sửa nhanh ... lỗi chắc chắn**. Nút này chỉ sửa lỗi có đúng một cách sửa; lỗi còn lại cần bạn chọn.
- Một hộp thoại xác nhận sẽ hiện ra, bấm **Đồng ý sửa**. Add-in sẽ tự động sửa lần lượt từ cuối văn bản lên đầu một cách an toàn và chuẩn xác.

---

## 3. Quản Lý Từ Điển Cá Nhân
- Bấm vào biểu tượng cuốn sách trên thanh tiêu đề để mở Từ điển cá nhân.
- Bạn có thể gõ thêm các từ viết tắt riêng, tên riêng hoặc thuật ngữ đặc thù của phòng ban.
- Bấm **Xuất file** để lưu danh sách từ điển về máy tính làm bản sao lưu định kỳ.

---

## 4. Cách Gỡ Cài Đặt Khi Không Dùng Nữa
Mở cửa sổ `cmd` và dán lệnh sau:
```cmd
reg delete "HKCU\Software\Microsoft\Office\16.0\Wef\Developer" /v "0d864eeb-0939-4159-8800-21a3426119d2" /f
```
