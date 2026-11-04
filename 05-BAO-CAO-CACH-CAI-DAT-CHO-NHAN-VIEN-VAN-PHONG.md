# [05] Báo cáo các cách cài add-in thuận tiện nhất cho nhân viên văn phòng

04/11/2026 · Tiếp nối: [04-BAO-CAO-SUA-LOI-VA-KET-QUA-KIEM-CHUNG.md](04-BAO-CAO-SUA-LOI-VA-KET-QUA-KIEM-CHUNG.md) · Nguồn: đo trên Word 16.0.20527 của máy phát triển, mã nguồn repo `chinhta`, tài liệu Microsoft, báo cáo lỗi OfficeDev/office-js#6973

## 1. Kết luận

**Cách thuận tiện nhất phụ thuộc vào một câu hỏi: nhân viên có đăng nhập Word bằng tài khoản Microsoft 365 của cơ quan không?**

- **Có (kèm Exchange Online):** nhờ CNTT đẩy từ trang quản trị Microsoft 365. Nhân viên không phải làm gì, tab tự hiện trong vòng 24 giờ.
- **Không (khả năng cao, vì hồ sơ gửi CNTT ghi đơn vị chưa có quản trị Microsoft 365 tập trung):** làm **add-in COM kèm bộ cài bấm đúp**, tức loại add-in cài vào Word như pH-type, nhưng bên trong vẫn dùng lại giao diện và bộ soát lỗi hiện có. Nhân viên bấm đúp một lần, từ đó tab hiện ở mọi tài liệu.

Cách đang làm (đăng ký `Wef\Developer`) **không nên dùng nữa**: từ bản cập nhật Microsoft 365 ngày 24–25/09/2026, add-in nạp kiểu này mất sau mỗi lần đóng Word, và Microsoft chưa công bố ngày sửa.

**Cập nhật cùng ngày:** Thư mục tin cậy đã đo đạt trên máy phát triển (tab còn sau khi đóng mở lại Word trống), nên dùng cho nhóm thử 5–10 máy. Bộ cài đã làm lại theo đường này.

Chưa có cách nào trong báo cáo này được thử đủ từ đầu đến cuối trên máy cơ quan. Mục 6 ghi rõ phần chưa đo.

## 2. Vì sao cách cũ hỏng

Đo trên máy phát triển ngày 04/11/2026:

| Phép đo | Kết quả |
| :--- | :--- |
| Đăng ký `Wef\Developer`, mở Word trống | Không có tab |
| Mở tệp Word có gắn sẵn add-in | Có tab, bảng soát lỗi tải đủ |
| Quét văn bản có 4 lỗi cố ý | Bắt 4/4 |
| Tìm mục Developer Add-ins trong Word | Người dùng không tìm thấy |

Như vậy phần soát lỗi chạy tốt. Chỗ hỏng chỉ là đường đưa add-in vào Word. Giống một thiết bị tốt nhưng không có chỗ đấu cố định vào thanh cái.

Báo cáo lỗi OfficeDev/office-js#6973 mô tả đúng hiện tượng này, Microsoft đang theo dõi (mã nội bộ 12428218). Tới hoạt động cuối trên trang ngày 13/10/2026 chưa có bản sửa hay ngày hẹn.

## 3. So sánh các cách, xếp theo độ thuận tiện cho nhân viên

| # | Cách | Nhân viên phải làm | Ai phải chuẩn bị | Vướng chính |
| :--- | :--- | :--- | :--- | :--- |
| A | Đẩy từ trang quản trị Microsoft 365 | Không làm gì | CNTT | Cần gói có Exchange Online và tài khoản cơ quan. Word bản mua đứt không nằm trong danh sách |
| B | **Add-in COM + bộ cài** | Bấm đúp 1 lần, có thể phải qua cảnh báo Windows | Làm thêm phần vỏ | Cảnh báo SmartScreen, CNTT cần duyệt |
| C | Đưa lên chợ Microsoft Marketplace | Vào Add-ins, tìm tên, bấm Add | Tài khoản công ty, qua kiểm duyệt | Cần pháp nhân và tài khoản công việc, add-in hiện công khai |
| D | Thư mục tin cậy | Bấm đúp 1 lần, rồi tự Add trong menu Word | Một thư mục dùng chung trên máy chủ | Microsoft ghi không dành cho sản phẩm chính thức |
| E | Tệp macro `.dotm` như pH-type | Bấm đúp 1 lần | Viết lại phần lớn add-in | Khối lượng lớn, có thể bị chính sách macro chặn |
| F | Đăng ký `Wef\Developer` (cách cũ) | Phải thêm lại sau mỗi lần mở Word | Không | Đang lỗi |
| G | SharePoint | Không xét | | Không hỗ trợ nút trên thanh công cụ |

## 4. Phân tích từng cách đáng cân nhắc

### A. Đẩy từ trang quản trị Microsoft 365

- **Ưu:** nhân viên không phải làm gì, đây là đường Microsoft khuyên dùng cho nội bộ, không dính lỗi sideload theo mô tả của báo cáo lỗi.
- **Điều kiện:** Microsoft 365 Business hoặc Enterprise, Exchange Online, tài khoản cơ quan. Gói chỉ có ứng dụng Office (Microsoft 365 Apps) không được hỗ trợ.
- **Việc cần làm:** hỏi CNTT một câu. Nếu có, đây là cách tốt nhất và gần như không tốn công lập trình.

### B. Add-in COM kèm bộ cài (đề xuất nếu không có A)

Add-in COM là loại cài thẳng vào Word, Word tự nạp mỗi lần mở, không phụ thuộc lỗi sideload. Giống cách pH-type được nạp tự động, nhưng dùng phần mềm thay vì macro.

- **Giữ được gì:** bên trong đặt một khung WebView2 (bộ hiển thị web của Microsoft) để chạy lại nguyên giao diện và bộ soát lỗi. Theo đếm mã: giữ 1.893 dòng bộ soát lỗi và 1.344 dòng giao diện, viết lại phần nối với Word (316 dòng) cộng một lớp vỏ mới.
- **Ưu lớn cho ngành điện:** tệp web và dữ liệu 6,2 MB có thể nằm ngay trên máy, nên **không cần internet và không cần CNTT mở tường lửa**. Lời cam kết "văn bản không rời máy" cũng dễ chứng minh hơn.
- **Cài không cần quyền quản trị:** đăng ký trong phần của từng người dùng (`HKCU`).
- **Nhược:**
  - Tệp chưa ký số sẽ có cảnh báo SmartScreen. Chứng chỉ ký số thông thường khoảng 150–300 USD/năm, và ký số cũng không xóa cảnh báo ngay với tệp mới. Dịch vụ ký rẻ của Microsoft chỉ nhận cá nhân ở Mỹ và Canada.
  - Mỗi lần sửa lỗi phải phát lại bộ cài, trừ khi làm thêm tự cập nhật. Đây là cái giá của việc chạy không cần mạng.
  - Phải xin CNTT duyệt lại, vì hồ sơ hiện tại ghi không cài `.exe`, `.msi`.
  - Chỉ chạy trên Windows, cần WebView2. Máy phát triển có sẵn bản 156, máy cơ quan chưa kiểm.

### C. Microsoft Marketplace

- **Ưu:** thao tác quen thuộc như cài ứng dụng trên điện thoại, không cần máy chủ nội bộ, không cần phát tệp.
- **Điều kiện:** tài khoản công ty, tài khoản công việc Microsoft Entra, có quyền ký thỏa thuận thay công ty. Kiểm duyệt 3–5 ngày làm việc.
- **Chưa rõ:** nhân viên có phải đăng nhập Word không, mạng cơ quan có chặn chợ không, có thực sự giữ được tab qua các phiên không.
- **Nhận xét:** add-in hiện công khai cho mọi người, không hợp lắm với công cụ nội bộ, nhưng add-in không chứa dữ liệu mật nên không phải vật cản. Chỉ nên xét nếu có pháp nhân đứng tên.

### D. Thư mục tin cậy

- **Ưu:** không viết thêm mã, thử được ngay.
- **Nhược:** vẫn còn một bước khó với nhân viên là vào Home > Add-ins > Advanced > SHARED FOLDER rồi bấm Add. Microsoft xếp đường này vào loại để thử. Giữ được qua các phiên đã đo đạt trên một máy.
- **Cần:** thư mục dùng chung trên máy chủ cơ quan, mọi người có quyền đọc.
- **Dùng khi:** chạy thử nhóm nhỏ trong lúc chờ quyết định.

### E. Tệp macro như pH-type

pH-type đơn giản vì nó vốn viết bằng macro. Add-in soát lỗi viết bằng web, trong khi đo trên Word không thấy lệnh nào để macro mở bảng web cho tài liệu đang mở. Bộ soát lỗi lại dùng các mẫu tìm chữ đời mới (15 chỗ lookbehind, 54 chỗ thuộc tính Unicode), nên muốn chạy trong macro gần như phải viết lại toàn bộ, kể cả giao diện. Chính sách chặn macro của cơ quan cũng có thể làm hỏng cách này. **Không đề xuất.**

## 4b. Lộ trình đề xuất

1. **Hỏi 3 câu ở mục 5.** Không tốn công, quyết định đi đường nào.
2. Có Microsoft 365 đủ điều kiện: chọn A, dừng ở đây.
3. Không có: làm thử bản B trên máy phát triển. Tiêu chí đạt: Word trống vẫn có tab sau khi đóng mở lại, quét bắt 4/4 lỗi mẫu, sửa lỗi và Ctrl+Z chạy đúng, rút mạng vẫn chạy.
4. Thử trên 5–10 máy thật, đo số người tự cài được không cần hỗ trợ, rồi mới phát rộng.
5. Cập nhật hồ sơ gửi CNTT và hướng dẫn người dùng theo đường đã chọn.

## 5. Ba câu cần hỏi CNTT hoặc anh em văn phòng

1. Nhân viên đăng nhập Word bằng tài khoản Microsoft 365 của cơ quan không, và có hòm thư Exchange Online không?
2. Máy văn phòng đang chạy Office bản nào: 2016, 2019, 2021 hay Microsoft 365?
3. Chính sách có chặn cài add-in, chạy `.exe`, macro không, và có máy chủ thư mục dùng chung không?

Word 2016 bản mua số lượng lớn chỉ hỗ trợ WordApi 1.1 nên bản web hiện tại có nguy cơ lỗi. Cách B dùng đường nối khác nên có thể tránh được, nhưng chưa thử.

Phép thử Thư mục tin cậy đã đạt ở máy phát triển, nhưng khi làm tay có hai chỗ vướng: ô Show in Menu dễ bị bỏ sót, và nút Add mờ cho tới khi bấm chọn add-in. Bộ cài tự xử lý chỗ đầu, chỗ sau đã ghi trong hướng dẫn.

## 6. Giới hạn của báo cáo

- **Chưa đo:** cách A, B, C chưa dựng thử. Cách D đạt khi làm tay trên một máy, bản bộ cài `.cmd` chưa chạy phần ghi registry.
- **Một máy:** Thư mục tin cậy mới đo trên một máy Microsoft 365 gói cá nhân, qua đường `\\localhost`, chưa qua máy chủ thật.
- **Suy luận, chưa kiểm:** A, B, C không dính lỗi sideload là suy ra từ việc chúng không đi qua đường sideload. Cách B chạy được Word 2016 và không có hộp cảnh báo tin cậy riêng cũng là suy luận.
- **Giá chứng chỉ ký số** lấy từ tài liệu tham khảo, chưa hỏi nhà cung cấp ở Việt Nam.

## 7. Nguồn

- [Báo cáo lỗi OfficeDev/office-js#6973](https://github.com/OfficeDev/office-js/issues/6973)
- [Điều kiện đẩy add-in từ trang quản trị](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/centralized-deployment-of-add-ins)
- [Các đường phát hành add-in](https://learn.microsoft.com/en-us/office/dev/add-ins/publish/publish)
- [Thư mục mạng dùng chung](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)
- [Đưa add-in lên Marketplace](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/submit-to-appsource-via-partner-center)
- [Mở tài khoản nhà phát triển](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/open-a-developer-account)
- [Chặn macro từ internet](https://learn.microsoft.com/en-us/microsoft-365-apps/security/internet-macros-blocked)
- [Mức hỗ trợ WordApi](https://learn.microsoft.com/en-us/javascript/api/requirement-sets/word/word-api-requirement-sets)
- [Khóa registry cho add-in cài theo người dùng](https://learn.microsoft.com/en-us/visualstudio/vsto/registry-entries-for-vsto-add-ins)
- [Các lựa chọn ký số](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options)

(C) August87 - 0982722036
