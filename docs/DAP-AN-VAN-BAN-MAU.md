# Đáp án văn bản mẫu kiểm tra thực tế

04/11/2026 · Dùng cho [VAN-BAN-MAU-KIEM-TRA-THUC-TE.docx](../VAN-BAN-MAU-KIEM-TRA-THUC-TE.docx) · Sinh từ `data/mau/dap-an.json` và `data/mau/ket-qua.json`

Cột "Engine dự kiến" là kết quả chấm bằng engine, chưa qua Word. Khi thử trên Word, ghi kết quả thật vào cột cuối.

| STT | Vị trí | Chữ sai | Chữ đúng | Loại | Engine dự kiến | Kết quả trên Word |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Mục 1 | `THỰC HIÊN` | `THỰC HIỆN` | Tiêu đề in hoa | R8, gợi ý `HIỆN` | |
| 2 | Mục 5 | `thi hàng` | `thi hành` | Lạc ngữ cảnh | R8, gợi ý `hành` | |
| 3 | Mục 5 | `thât` | `thất` | Sai cấu tạo | R1, gợi ý `thất` | |
| 4 | Mục 6 | `hành` | `hàng` | Lạc ngữ cảnh | Bỏ sót | |
| 5 | Mục 8 | `hàng` | `hành` | Lạc ngữ cảnh, chữ đậm trong cụm | Bỏ sót | |
| 6 | Mục 8 | `đường giây` | `đường dây` | Lạc ngữ cảnh | Bỏ sót | |
| 7 | Mục 8 | `đông` | `động` | Lạc ngữ cảnh | R8, gợi ý `động` | |
| 8 | Mục 10 | `nghiêm thu` | `nghiệm thu` | Lạc ngữ cảnh | Bỏ sót | |
| 9 | Mục 10 | `bổ xung` | `bổ sung` | Danh sách R2 | R2, gợi ý `bổ sung` | |
| 10 | Mục 10 | `xắp xếp` | `sắp xếp` | Danh sách R2 | R2, gợi ý `sắp xếp` | |
| 11 | Mục 10 | ` ,` | `,` | Dấu câu | R4, gợi ý `,` | |
| 12 | Mục 11 | `hoạtt` | `hoạt` | Sai cấu tạo, lần 1 trong đoạn | R1, gợi ý `hoạt` | |
| 13 | Mục 11 | `hoạtt` | `hoạt` | Sai cấu tạo, lần 2 trong đoạn | R1, gợi ý `hoạt` | |
| 14 | Mục 11 | `hoạtt` | `hoạt` | Sai cấu tạo, lần 3 trong đoạn | R1, gợi ý `hoạt` | |
| 15 | Mục 12 | `các các` | `các` | Lặp từ | R5, gợi ý `các` | |
| 16 | Mục 12 | `bộ công thương` | `Bộ Công Thương` | Viết hoa cơ quan | R6, gợi ý `Bộ Công Thương` | |
| 17 | Mục 12 | `tập đoàn điện lực việt nam` | `Tập đoàn Điện lực Việt Nam` | Viết hoa cơ quan | R6, gợi ý `Tập đoàn Điện lực Việt Nam` | |
| 18 | Mục 13 | `HOACH` | `HOẠCH` | Tiêu đề in hoa | R1, gợi ý `HOẠCH` | |
| 19 | Bảng hạng mục | `máy biến ấp` | `máy biến áp` | Trong ô bảng | Bỏ sót | |
| 20 | Bảng hạng mục | `thánh` | `tháng` | Trong ô bảng | Bỏ sót | |
| 21 | Bảng hạng mục | `hệ thông` | `hệ thống` | Trong ô bảng | Bỏ sót | |
| 22 | Mục 15 | `( 05 )` | `(05)` | Dấu câu | R4, gợi ý `(0` | |
| 23 | Mục 15 | `Phòng` | `Phòng` | Dấu câu | Bỏ sót | |
| 24 | Mục 15 | `đinh` | `định` | Lạc ngữ cảnh | R8, gợi ý `định` | |
| 25 | Mục 18 | `chỉ tieu` | `chỉ tiêu` | Thiếu dấu | R1, gợi ý `tiêu` | |
| 26 | Mục 19 | `phoois` | `phối` | Gõ Telex | R1, gợi ý `phối` | |
| 27 | Mục 20 | `Nhuwngx` | `Những` | Gõ Telex | Bỏ sót | |
| 28 | Mục 21 | `đã đã` | `đã` | Lặp từ | R5, gợi ý `đã` | |
| 29 | Mục 22 | `chia sẽ` | `chia sẻ` | Cặp ngữ cảnh | R3, gợi ý `chia sẻ` | |
| 30 | Mục 22 | `dành được` | `giành được` | Cặp ngữ cảnh | R3, gợi ý `giành được` | |

## Tình huống không được báo lỗi

| Vị trí | Yêu cầu |
| --- | --- |
| Đầu trang, chân trang | Có `xản xuất`, `xắp xếp` cố ý; add-in không quét và phải có dòng thông báo chưa quét |
| Chú thích cuối trang | Có `bổ xung` cố ý; add-in không quét |
| Đoạn "Phòng Tổng hợp đã gửi báo cáo" | Phần đã xóa theo dõi có `xản xuất hoạtt`; không được báo |
| Đoạn font .VnTime | Có cảnh báo font cũ, đoạn bị bỏ qua |
| Dòng biểu mẫu | Không báo tab, căn lề, dấu dẫn mục lục, ô `(   )` |
| Đoạn có `®`, `½`, `©` | Không bị coi là font cũ, không báo lỗi |
| Các dòng a) đến đ), số liệu, mã hiệu, đơn vị | Chỉ báo các lỗi cài trong bảng trên |
