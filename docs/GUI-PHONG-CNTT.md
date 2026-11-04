# BÁO CÁO THUYẾT MINH KỸ THUẬT & ĐỀ NGHỊ PHÊ DUYỆT
## V/v: Triển khai thử nghiệm Add-in Microsoft Word "Soát Chính Tả Tiếng Việt Nội Bộ" (Không AI)

**Kính gửi:** Lãnh đạo Phòng Công nghệ Thông tin / Quản trị An toàn Thông tin  
**Người đề xuất:** August87 - SĐT/Zalo: 0982722036  
**Ngày báo cáo:** 04/11/2026

---

### 1. Mục Đích Sử Dụng
Phục vụ cán bộ nhân viên trong đơn vị tự động rà soát lỗi chính tả, lỗi gõ bàn phím (Telex/VNI), lỗi khoảng trắng, dấu câu và quy chuẩn viết hoa tên cơ quan hành chính theo Nghị định số 30/2020/NĐ-CP trên Microsoft Word, nâng cao chất lượng văn bản nội bộ và văn bản phát hành.

### 2. Cam Kết An Toàn & Bảo Mật Dữ Liệu (Quan trọng nhất)
- **Văn bản 100% không rời khỏi máy tính người dùng:** Toàn bộ thuật toán tách từ, tra cứu âm tiết và kiểm tra ngữ quy tắc đều được thực thi trực tiếp trong sandbox trình duyệt (WebView2) trên máy trạm của người dùng.
- **Không sử dụng AI / LLM / Máy chủ đám mây:** Hệ thống thuần túy là bộ máy quy tắc xác định (deterministic rule engine), không gọi bất kỳ API bên thứ ba hay máy chủ AI nào.
- **Chính sách mạng (CSP) nghiêm ngặt:** Cấu hình Content Security Policy đặt `connect-src 'self'`, tuyệt đối không cho phép gửi bất kỳ gói tin nào ra internet.

### 3. Yêu Cầu Kết Nối Mạng
Add-in chỉ cần tải các tệp giao diện web tĩnh (HTML, CSS, JS) khi khởi động từ địa chỉ:
1. `https://soatchinhta-addin.web.app` (Firebase Hosting tĩnh của add-in).
2. `https://appsforoffice.microsoft.com` (Thư viện Office.js chính thức được ký số bởi Microsoft).
Máy trạm không cần mở thêm bất kỳ port hay kết nối socket/database nào.

### 4. Giải Trình Về Quyền Hạn (Permission)
Manifest yêu cầu quyền: `<Permissions>ReadWriteDocument</Permissions>`.
- **Mục đích:** Add-in cần đọc nội dung các đoạn văn trong tài liệu Word đang mở để phát hiện lỗi, và thay thế cụm từ sai bằng cụm từ đúng khi người dùng bấm nút "Sửa" hoặc "Sửa hàng loạt".
- Add-in **không** can thiệp vào hệ thống tệp bên ngoài Word, không truy cập macro, không chỉnh sửa Registry hệ thống.

### 5. Chi Tiết Thay Đổi Trên Máy Trạm Của Người Dùng (Đường Cài Đặt T)
Add-in không yêu cầu quyền Quản trị viên (Admin) và không chạy bất kỳ tệp thực thi (`.exe`, `.msi`, `.bat`, `.ps1`) nào. Quá trình đăng ký chỉ thực hiện đúng 2 thay đổi cục bộ trong không gian người dùng hiện tại:
1. **Lưu trữ tệp manifest cấu hình:** Lưu tại đường dẫn `%USERPROFILE%\SoatChinhTa\manifest.xml`.
2. **Khai báo sideloading với Word:** Thêm 1 khóa chuỗi (String Value) vào nhánh Registry người dùng hiện tại:
   - **Khóa:** `HKCU\Software\Microsoft\Office\16.0\Wef\Developer`
   - **Tên:** `0d864eeb-0939-4159-8800-21a3426119d2`
   - **Giá trị:** `%USERPROFILE%\SoatChinhTa\manifest.xml`
   *(Đây là cơ chế sideloading chính thức được Microsoft tài liệu hóa cho Office 16.0/M365).*

### 6. Cách Thức Gỡ Bỏ Hoàn Toàn (Uninstall)
Khi cần thu hồi hoặc ngừng dùng thử, chỉ cần dán lệnh sau vào Command Prompt:
```cmd
reg delete "HKCU\Software\Microsoft\Office\16.0\Wef\Developer" /v "0d864eeb-0939-4159-8800-21a3426119d2" /f
rmdir /s /q "%USERPROFILE%\SoatChinhTa"
```
Hệ thống máy trạm sẽ trở lại nguyên trạng 100%, không để lại bất kỳ tiến trình chạy ngầm hay tệp rác nào.

### 7. Lưu Ý Giới Hạn Kỹ Thuật
Đường cài T là cơ chế đăng ký trực tiếp trên từng máy trạm dành cho môi trường phát triển/thử nghiệm nội bộ (Microsoft không cam kết bảo hành như qua Microsoft 365 Admin Center). Do đơn vị chưa có hệ thống quản lý tenant M365 tập trung, giải pháp này là tối ưu nhất về mặt an ninh và tính khả thi triển khai.

*Kính mong Phòng CNTT xem xét và chấp thuận cho phép thử nghiệm trên nhóm 5 - 10 máy trạm.*
