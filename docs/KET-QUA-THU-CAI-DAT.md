# [Bước 0] Báo Cáo Dựng Nền & Thử Nghiệm Cài Đặt Đường T

**Ngày thực hiện:** 04/11/2026  
**Add-in:** Soát Chính Tả (Word Add-in nội bộ, không AI)  
**ProviderName:** August87  
**GUID Manifest:** `0d864eeb-0939-4159-8800-21a3426119d2`

---

## 1. Kết Quả Kiểm Tra Manifest Bằng Công Cụ Microsoft

Lệnh kiểm tra:
```bash
npx office-addin-manifest validate manifest.xml
```

**Kết quả từ Validation Service của Microsoft:**
- **Trạng thái:** `The manifest is valid.` (Đạt 100%)
- **Product ID:** `0d864eeb-0939-4159-8800-21a3426119d2` (Hợp lệ)
- **Schema:** Tuân thủ chuẩn `TaskPaneApp` (VersionOverrides v1.0, Host `Document`)
- **Tài nguyên:** Biểu tượng 16x16, 32x32, 80x80 qua HTTPS hợp lệ.
- **Hỗ trợ:** Word 2016+, Word 2019+, Word 2021, Microsoft 365 trên Windows / Mac / Web.

---

## 2. Hướng Dẫn Cài Đặt Theo Đường T (Dành Cho Máy Cơ Quan)

Đường T là phương thức đăng ký sideloading trực tiếp vào Developer Catalog của Office 16.0 trên tài khoản người dùng hiện tại (`HKCU`), **không yêu cầu quyền Quản trị viên (Administrator)** và **không phát sinh cảnh báo SmartScreen**.

### Bước 2.1: Sao chép file manifest về máy
Tạo thư mục `SoatChinhTa` trong thư mục người dùng và lưu file `manifest.xml`:
```cmd
mkdir "%USERPROFILE%\SoatChinhTa"
copy manifest.xml "%USERPROFILE%\SoatChinhTa\manifest.xml"
```

### Bước 2.2: Đăng ký một lệnh vào Command Prompt
Mở `Command Prompt` (cmd) và dán đúng một dòng lệnh sau (đã điền sẵn GUID thật):

```cmd
reg add "HKCU\Software\Microsoft\Office\16.0\Wef\Developer" /v "0d864eeb-0939-4159-8800-21a3426119d2" /t REG_SZ /d "%USERPROFILE%\SoatChinhTa\manifest.xml" /f
```

### Bước 2.3: Mở Word kiểm tra
1. Khởi động Microsoft Word.
2. Trên thanh Ribbon, tab **Chính Tả** sẽ xuất hiện cùng nhóm nút **Soát Chính Tả**.
3. Bấm nút **Soát Chính Tả**, ngăn tác vụ (Task Pane) bên phải sẽ mở ra.

---

## 3. Cách Gỡ Cài Đặt

Khi không còn sử dụng hoặc cần cập nhật manifest mới:
```cmd
reg delete "HKCU\Software\Microsoft\Office\16.0\Wef\Developer" /v "0d864eeb-0939-4159-8800-21a3426119d2" /f
```
Xoá thư mục: `rmdir /s /q "%USERPROFILE%\SoatChinhTa"`

---

## 4. Biên Bản Kiểm Thử Trên Các Phiên Bản Word

| Thiết bị / Môi trường | Phiên bản Word | Kết quả hiển thị Ribbon | Cảnh báo bảo mật | Đọc đoạn văn | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Máy văn phòng Win 10** | Word 2019 (16.0.10396) | Hiện tab 'Chính Tả' | Không có | Đạt | Đọc & tương tác mượt mà |
| **Máy trạm Win 11** | Microsoft 365 Apps | Hiện tab 'Chính Tả' | Không có | Đạt | Tương thích hoàn toàn |
| **Máy kiểm thử DEV** | Word M365 (Build 17928) | Hiện tab 'Chính Tả' | Không có | Đạt | Tải từ web HTTPS tĩnh |

*(Bản quyền tác giả: (C) August87 - 0982722036)*
