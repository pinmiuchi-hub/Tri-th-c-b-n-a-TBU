# PHỤ LỤC

## Phụ lục A — Bảng trường dữ liệu của 7 nhóm tri thức — tài nguyên

**Bảng A.1. Cấu trúc trường dữ liệu (schema) từng nhóm đối tượng [30]**

| Nhóm dữ liệu | Số đối tượng | Các trường dữ liệu chính |
|---|---|---|
| rivers (sông suối) | 7 | id, ten, ten_dia_phuong, coords, trang_thai, nguon, mo_ta, ghi_chu |
| irrigation (thủy lợi truyền thống) | 6 | id, ten, ten_dia_phuong, loai, lat, lng, mo_ta, trang_thai, nguon, ghi_chu |
| villages (bản làng tiêu biểu) | 25 | id, ten, ten_xa, ten_huyen, ten_tinh, dan_toc, lat, lng, mo_ta, nguon, trang_thai, ghi_chu, anh, anh_ghichu, ma_xa |
| forests (rừng và khu bảo tồn) | 11 | id, ten, ten_dia_phuong, loai, dien_tich_ha, mo_ta, coords, trang_thai, nguon, nam_cong_bo |
| vac_models (mô hình VAC/VACR) | 8 | id, ten, loai, lat, lng, mo_ta, thanh_phan, trang_thai, nguon, ghi_chu |
| medicinal_plants (dược liệu) | 11 | id, ten, ten_dia_phuong, ten_khoa_hoc, cong_dung, tinh_trang, dan_toc_dung, mo_ta, coords, trang_thai, nguon |
| customary_zones (luật tục — vùng phong tục) | 5 | id, ten, loai, mo_ta, coords, trang_thai, nguon, ghi_chu, dia_ban_hien_tai, ma_xa |

**Ghi chú:**

- Tất cả nhóm đều có ba trường chung: trang_thai (co_nguon / mot_phan / du_doan / minh_hoa), nguon (liên kết đối chiếu) và mo_ta — là dữ liệu hiển thị trong khung truy thực nguồn (mục 2.3.2).
- Tổng số đối tượng: 73; tính đến ngày 16/10/2026, toàn bộ 73/73 ở trạng thái co_nguon [30].
- Hai nhóm villages và customary_zones hiển thị dạng văn bản theo từng xã (ghép trường ma_xa) trong bảng “Thông tin địa bàn”, không phải lớp bản đồ riêng.
- Kèm theo: 5 lớp raster chuyên đề (độ cao SRTM, khí hậu mô hình, mật độ dân số, v.v.) [24], dữ liệu cơ cấu dân tộc theo đơn vị hành chính [1], [5] và bộ hồ sơ 18 dân tộc.

## Phụ lục B — Danh mục nguồn tham khảo phân hạng

**Bảng B.1. Phân hạng nguồn theo khung A–B–C–D (mục 2.2.3)**

| Hạng | Tiêu chí | Các nguồn |
|---|---|---|
| A — Chính thống, đọc toàn văn | Văn bản nhà nước, số liệu thống kê chính thức, cơ sở dữ liệu quốc tế chính thức | [1], [2], [3], [4], [5], [6], [7], [9], [24] |
| B — Khoa học | Bài báo, công trình nghiên cứu; tài liệu kỹ thuật của thư viện phần mềm | [10], [11], [12], [17], [19], [26], [27], [28] |
| C — Báo chí chính thống / nguồn mở | Báo, cổng thông tin chính thống; dữ liệu mở dùng cho hình học; ảnh minh họa | [8], [13], [14], [15], [16], [18], [20], [21], [22], [23], [25] |
| D — Đối chiếu | Chỉ dùng khi không có nguồn cao hơn, hoặc chỉ để kiểm tra | Dùng nội bộ cho thông tin đối chiếu (không đưa vào danh mục) |

**Ghi chú:** Mỗi đối tượng dữ liệu trước khi đưa vào bản đồ phải qua quy trình đối chiếu tối thiểu hai nguồn độc lập hoặc một nguồn mức A/B. Nguồn [29] và [30] là dữ liệu gốc của đề tài (khảo sát thực địa và bộ dữ liệu không gian), được đối soát nội bộ và công bố kèm báo cáo.

## Phụ lục C — Kịch bản kiểm tra và kết quả

**Bảng C.1. Các nhóm kiểm tra và kết quả**

| STT | Nhóm kiểm tra | Nội dung | Kết quả |
|---|---|---|---|
| 1 | Khởi động hệ thống | Truy cập ứng dụng WebGIS trên trình duyệt tại môi trường phát triển | Đạt — HTTP 200 |
| 2 | Kiểm tra dữ liệu | Đọc layers.json: đủ 7 nhóm, 73 đối tượng, 73/73 ở trạng thái có nguồn | Đạt — 7 nhóm / 73 đối tượng / 100% co_nguon |
| 3 | Kiểm tra mã nguồn | Chạy kiểm tra kiểu (typecheck) toàn dự án | Đạt — không lỗi kiểu |
| 4 | Kiểm thử tự động giao diện | Các luồng chú giải theo khung nhìn/vùng chọn, composer xuất bản đồ, kiểm tra hiển thị biểu đồ và marker — thực hiện bằng Playwright trong quá trình phát triển | Đạt — toàn bộ kịch bản PASS (ghi nhận 11/11 và 12/12) |
| 5 | Đối soát nguồn dữ liệu | Rà soát định kỳ trường nguon và trang_thai của từng đối tượng (vòng cập nhật 16/10/2026) | Đạt — 73/73 co_nguon; 11 đối tượng không tra được nguồn đã bị loại bỏ |
| 6 | Kiểm tra hiển thị | Chụp màn hình giao diện chính (Hình 3.4) | Đạt — giao diện hiển thị đủ công cụ tìm kiếm, lớp bản đồ, chế độ 3D, biên tập |

**Ghi chú:** kết quả kiểm tra mục 1–3 và 5 được thực hiện lại tại thời điểm lập báo cáo; mục 4 ghi nhận từ nhật ký kiểm thử trong quá trình phát triển hệ thống.

## Phụ lục D — Hướng dẫn tra cứu và xuất bản đồ trên hệ thống WebGIS

**Bảng D.1. Các bước sử dụng chính**

| Bước | Thao tác | Kết quả |
|---|---|---|
| 1 | Mở trình duyệt, truy cập địa chỉ hệ thống | Hiển thị bản đồ tỉnh Sơn La với ranh giới đơn vị hành chính |
| 2 | Dùng thanh tìm kiếm, gõ tên xã/tỉnh | Bản đồ bay tới đơn vị hành chính tương ứng; bật vùng chọn |
| 3 | Bấm vào vùng trên bản đồ (hoặc chọn từ danh sách) | Mở bảng “Thông tin địa bàn”: dân tộc, tài nguyên, dữ liệu bản làng/luật tục theo mã hành chính |
| 4 | Mở khung “Lớp bản đồ”, bật/tắt các lớp theo chủ đề | Chỉ hiển thị lớp được chọn; chú giải tự cập nhật theo khung nhìn và vùng chọn |
| 5 | Chuyển chế độ xem 3D | Quan sát địa hình theo chiều cao |
| 6 | Bấm vào đối tượng trên bản đồ | Hiển thị mô tả, trạng thái nguồn và liên kết đối chiếu |
| 7 | Chọn chức năng xuất bản đồ (A4/A3, dọc/ngang) | Tải bản đồ giấy kèm khung, chú giải, tỷ lệ, nguồn dữ liệu theo QCVN 80 [6] |
| 8 | (Nhóm biên tập) đăng nhập chức năng nhập liệu | Thêm/sửa đối tượng; đối tượng hiển thị công khai sau khi có nguồn và được phê duyệt |

**Ghi chú vận hành:** mô hình quản lý nội dung theo đề xuất khảo sát — trưởng bản/người có uy tín quyết định nội dung (73,8% người dân đề nghị [29]), nhóm kỹ thuật xử lý phần mềm, nhà nước bảo trợ dữ liệu tham chiếu.

## Phụ lục E — Bộ phiếu khảo sát thực địa và quy tắc xử lý

**Bảng E.1. Cấu trúc bộ phiếu hỏi [29]**

| Phần | Nội dung | Dạng câu hỏi |
|---|---|---|
| Phần I. Thông tin chung | Mã phiếu, ngày phỏng vấn, người phỏng vấn; họ tên, giới tính, năm sinh, dân tộc, địa chỉ, số năm sinh sống, điện thoại, học vấn, hoạt động thu nhập chính | Điền tự do, danh mục chọn |
| Phần II.1. Đất | Tham gia quản lý đất; ngưng sử dụng đất và nguyên nhân; cách áp dụng quản lý — bảo tồn đất; nguồn biện pháp; biện pháp hiệu quả nhất | Chọn 1, chọn nhiều, số, thang 5 mức |
| Phần II.2. Nước | Công trình sử dụng; quy định và luật tục về nước; tri thức quản lý nước cộng đồng; nguy cơ mai mốt | Chọn 1, chọn nhiều, thang 5 mức |
| Phần II.3. Rừng | Cách phân loại rừng; hương ước/quy ước; tình trạng giao khoán trùng rừng truyền thống; biện pháp bảo vệ rừng | Chọn 1, chọn nhiều, thang 5 mức |
| Phần III. Nhu cầu bản đồ | Mức cần số hóa từng nhóm tài nguyên; hình thức bản đồ mong muốn; người quản lý bản đồ; nội dung ưu tiên hiển thị; sẵn sàng sử dụng | Thang 5 mức, chọn 1, chọn nhiều |

**Bảng E.2. Quy tắc nhập liệu và xử lý (tóm tắt từ hướng dẫn của bộ phiếu)**

| Quy tắc | Nội dung |
|---|---|
| Mẫu | 65 phiếu hợp lệ tại huyện Phù Yên (cũ); mỗi phiếu = 1 dòng; bảng tính chuẩn bị 500 dòng |
| Câu chọn 1 | Chọn từ danh mục thả xuống; chọn “Khác” thì ghi rõ vào cột “Khác (ghi rõ)” |
| Câu chọn nhiều | Mỗi đáp án một cột riêng; tích = điền số 1, không tích = để trống |
| Câu số / năm | Ghi trực tiếp (năm sinh 4 chữ số, ngày phỏng vấn dd/mm/yyyy, điện thoại giữ số 0 đầu) |
| Câu bỏ trống | Không trả lời thì để trống toàn bộ câu đó |
| Thống kê | Sheet “Thống kê” tự đếm tần suất, tỷ lệ % và điểm trung bình thang 5 mức; % câu chọn 1 tính trên số phiếu trả lời câu đó, % câu chọn nhiều tính trên tổng số phiếu |
| Danh mục | Sheet “Danh mục” chứa các danh sách trả lời cho ô thả xuống; sửa danh mục phải cập nhật kèm sheet Thống kê |

Kèm theo: 4 bảng tính của bộ phiếu (Hướng dẫn, Nhập liệu, Thống kê, Danh mục) [29] — số liệu tổng hợp được trích dẫn trong Chương 3.

Để bảo đảm tính tái lập của số liệu, toàn bộ câu hỏi trong bộ phiếu được gán mã cố định, tạo thành chuỗi đối soát từ phiếu gốc đến bảng tính nhập liệu và đến từng kết quả thống kê được trình bày trong Chương 2 và Chương 3. Bảng E.3 trình bày danh mục đầy đủ của bộ phiếu theo bốn phần nội dung, kèm thang đo tương ứng và cách xử lý số liệu của từng câu.

**Bảng E.3. Danh mục câu hỏi theo nhóm, thang đo và cách xử lý số liệu**

| Mã câu | Nội dung câu hỏi | Thang đo | Cách xử lý |
|---|---|---|---|
| I.1 | Họ và tên người trả lời | Điền tự do | Chỉ dùng để đối chiếu phiếu, không tham gia thống kê |
| I.2 | Giới tính của người trả lời | Danh mục chọn một (Nam, Nữ, Khác) | Tần suất và tỷ lệ trên 65 phiếu hợp lệ |
| I.3 | Năm sinh | Điền số, bốn chữ số | Đối chiếu chéo với số năm sinh sống tại địa phương |
| I.4 | Dân tộc | Danh mục chọn một (Thái, Mông, Mường, Khác) | Tần suất, tỷ lệ; dùng làm biến chéo trong kiểm định |
| I.5 | Địa chỉ thường trú | Điền tự do | Gán mã hành chính của đơn vị cư trú để tra cứu thông tin địa bàn |
| I.6 | Số năm sinh sống tại địa phương | Danh mục chọn một, ba mức | Tần suất, tỷ lệ hợp lệ; làm điều kiện chọn mẫu người trả lời có tri thức bản địa |
| I.7 | Số điện thoại liên hệ | Điền số | Giữ số 0 ở đầu; chỉ dùng để liên hệ bổ sung, không công bố |
| I.8 | Trình độ học vấn | Danh mục chọn một, năm mức | Tần suất và tỷ lệ hợp lệ |
| I.9 | Hoạt động tạo ra thu nhập chính | Danh mục chọn một, tám phương án | Tần suất, tỷ lệ hợp lệ; nhóm có tần suất nhỏ được gộp khi trình bày |
| Đ.1.1 | Tham gia quản lý, sử dụng đất canh tác của gia đình | Danh mục chọn một, ba phương án | Tần suất, tỷ lệ hợp lệ; số phiếu thiếu được tách riêng |
| Đ.1.2 | Hoạt động cụ thể đã từng tham gia canh tác | Điền tự do | Dùng làm căn cứ nội dung cho câu Đ.1.1, không thống kê |
| Đ.1.3 | Số năm đã ngừng sử dụng đất canh tác | Điền số | Ghi nhận giá trị cụ thể của từng phiếu đã ngừng sử dụng đất |
| Đ.1.4 | Lý do chính khiến ngừng sử dụng đất canh tác | Danh mục chọn một, bốn phương án | Tần suất, tỷ lệ hợp lệ; chỉ tính người trả lời đã từng tham gia |
| Đ.2 | Các biện pháp thực hành quản lý và bảo tồn đất canh tác | Chọn nhiều, mười phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| Đ.3 | Nguồn gốc của biện pháp quản lý, cải tạo đất | Chọn nhiều, sáu phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| Đ.4 | Biện pháp mang lại hiệu quả quản lý, bảo tồn đất tốt nhất | Chọn nhiều, mười phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| Đ.5 | Nguyên nhân mai một tri thức bản địa về đất | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| Đ.6 | Mức độ cần thiết của việc ghi chép, số hóa bản đồ hướng dẫn về đất | Thang năm mức, từ hoàn toàn không cần thiết đến rất cần thiết | Tần suất, tỷ lệ hợp lệ; tổng nhóm cần thiết và rất cần thiết dùng làm chỉ số nhu cầu |
| N.1 | Loại nguồn nước gia đình đang sử dụng trong sinh hoạt và sản xuất | Chọn nhiều, bảy phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.2.1 | Cách khai thác và sử dụng nguồn nước hiện nay | Chọn nhiều, ba phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống | Thang năm mức, từ rất hiếm khi đến rất thường xuyên | Tần suất, tỷ lệ hợp lệ; dùng làm chỉ số mức vận hành của hệ thống truyền thống |
| N.2.3 | Biện pháp bảo vệ, vệ sinh và phục hồi thủy lợi truyền thống | Chọn nhiều, bảy phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.3 | Hình thức quy định điều chỉnh việc quản lý, bảo vệ nguồn nước | Chọn nhiều, ba phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.4 | Biện pháp cộng đồng trong phân chia, sử dụng và bảo vệ nguồn nước | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.5 | Tần suất thực hiện biện pháp bảo vệ sau khi phân chia, sử dụng nước | Thang năm mức, từ không bao giờ đến luôn luôn | Tần suất, tỷ lệ hợp lệ; dùng làm chỉ số duy trì thực hành cộng đồng |
| N.6 | Nguyên nhân mai một tri thức bản địa về nước | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.7 | Mức độ cần thiết của việc ghi chép, số hóa bản đồ hướng dẫn về nước | Thang năm mức | Tần suất, tỷ lệ hợp lệ; tổng nhóm cần thiết và rất cần thiết dùng làm chỉ số nhu cầu |
| R.1 | Duy trì song song cách phân loại rừng theo phong tục | Hai phương án: có hoặc không | Tần suất và tỷ lệ trên toàn bộ phiếu |
| R.2 | Cách phân loại rừng theo phong tục đã được ghi vào hương ước, quy ước | Hai phương án: có hoặc không | Tần suất và tỷ lệ trên toàn bộ phiếu |
| R.3 | Rừng Nhà nước giao hoặc khoán trùng với rừng thiêng, rừng ma, rừng cấm của bản | Hai phương án: có hoặc không | Tần suất và tỷ lệ trên toàn bộ phiếu; dùng làm chỉ số chồng lấn cần gỡ |
| R.4.1 | Thường vào rừng khác để thu hái, tận dụng sản phẩm từ rừng | Hai phương án: có hoặc không | Tần suất và tỷ lệ trên toàn bộ phiếu |
| R.4.2 | Loại sản phẩm thường thu hái từ rừng | Điền tự do | Dùng làm căn cứ nội dung cho câu R.4.1, không thống kê |
| R.5.1 | Áp dụng biện pháp giúp cây rừng tự phục hồi sau khi thu hái | Hai phương án: có hoặc không | Tần suất, tỷ lệ hợp lệ; số phiếu thiếu được tách riêng |
| R.5.2 | Mô tả ngắn gọn cách làm giúp cây rừng tự phục hồi | Điền tự do | Tổng hợp theo nội dung; trích dẫn tiêu biểu khi phân tích |
| R.6 | Nguyên nhân mai một tri thức bản địa về rừng | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| R.7 | Mức độ cần thiết của việc ghi chép, số hóa bản đồ hướng dẫn về rừng | Thang năm mức | Tần suất, tỷ lệ hợp lệ; tổng nhóm cần thiết và rất cần thiết dùng làm chỉ số nhu cầu |
| B.1 | Đã từng biết đến hoặc sử dụng loại bản đồ | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| B.2 | Loại tài nguyên và thông tin cần thể hiện trên bản đồ | Chọn nhiều, tám phương án | Mỗi phương án một cột riêng; tỷ lệ dùng để xếp hạng nội dung ưu tiên hiển thị |
| B.3 | Hình thức bản đồ mong muốn sử dụng | Danh mục chọn một, bốn phương án | Tần suất, tỷ lệ hợp lệ; làm căn cứ thiết kế chức năng xuất bản đồ |
| B.4 | Người nên là người quản lý bản đồ | Chọn nhiều, bốn phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| B.5 | Mức độ sẵn sàng sử dụng bản đồ nếu được cung cấp | Danh mục chọn một, ba mức | Tần suất, tỷ lệ hợp lệ; tổng hai nhóm sẵn sàng dùng làm chỉ số chấp nhận |
| B.6 | Góp ý thêm về việc lập bản đồ tri thức bản địa | Điền tự do | Tổng hợp nội dung góp ý theo chủ đề |

Trong quá trình nhập liệu, mỗi phiếu được đối chiếu với quy tắc xử lý nêu ở Bảng E.2; các tình huống phát sinh thêm được xử lý theo nguyên tắc chung ghi ở Bảng E.4. Mục đích của bộ quy tắc này là bảo đảm mọi con số trình bày trong báo cáo đều tra ngược được đến từng dòng dữ liệu gốc.

**Bảng E.4. Quy tắc xác định câu trả lời hợp lệ và xử lý dữ liệu bất thường**

| Tình huống phát hiện | Quy tắc xử lý | Ảnh hưởng tới thống kê |
|---|---|---|
| Phiếu có đủ mã phiếu, ngày phỏng vấn và đã điền xong phần thông tin chung | Coi là phiếu hợp lệ, nhập vào bảng tính | Nằm trong mẫu 65 phiếu phân tích |
| Phiếu trùng mã phiếu hoặc trùng người trả lời, người phỏng vấn, ngày phỏng vấn | Giữ phiếu ghi trước, loại các phiếu trùng | Không tham gia phân tích |
| Phiếu bỏ trống quá nửa số câu điều tra chính | Loại khỏi bộ dữ liệu thống kê | Không tham gia phân tích |
| Câu chọn một mà người trả lời đánh dấu nhiều hơn một phương án | Ghi nhận phương án được đánh dấu rõ ràng nhất theo hướng dẫn của bộ phiếu | Làm giảm số phiếu hợp lệ của câu đó |
| Câu chọn một, chọn phương án khác nhưng không ghi nội dung | Đếm vào nhóm khác và ghi chú thiếu nội dung | Vẫn tính trong số phiếu hợp lệ |
| Câu chọn một để trống hoàn toàn | Ghi nhận là câu thiếu | Loại khỏi mẫu số khi tính tỷ lệ; tỷ lệ tính trên số phiếu đã trả lời câu đó |
| Câu chọn nhiều mà không đánh dấu phương án nào và cũng không ghi phương án khác | Ghi nhận là câu thiếu | Loại khỏi mẫu số khi tính tỷ lệ trên số phiếu trả lời |
| Câu điền số có giá trị bất hợp lý so với lứa tuổi hoặc địa bàn | Rà soát lại phiếu gốc; nếu không xác minh được thì để trống | Không tham gia tính thống kê mô tả |
| Câu thang năm mức mà người trả lời chọn hai mức liền kề | Giữ mức được đánh dấu rõ ràng hơn; trường hợp không xác định được thì để trống | Làm giảm số phiếu hợp lệ của câu đó |
| Phiếu có nội dung trả lời không nhất quán giữa câu tổng và câu chi tiết | Giữ phần trả lời không mâu thuẫn, loại phần mâu thuẫn khỏi phân tích tương ứng | Ghi chú vào phiếu đối soát |
| Phiếu có phần góp ý ở câu cuối | Giữ nguyên nội dung, tổng hợp theo chủ đề khi phân tích | Phần góp ý không tham gia tính tỷ lệ |

## Phụ lục F — Bảng tổng hợp chỉ số khảo sát chính

Phụ lục này tổng hợp các chỉ số chính của bộ khảo sát thực địa 65 phiếu tại huyện Phù Yên (cũ) [29], đối chiếu trực tiếp với kết quả tính toán bằng phần mềm thống kê PSPP. Toàn bộ số liệu dưới đây đều được lấy nguyên trạng từ kết quả đầu ra thống kê, không suy diễn thêm; các tỷ lệ được tính trên mẫu số hợp lệ của từng câu hỏi và được ghi rõ trong nội dung bảng.

**Bảng F.1. Đặc điểm nhân khẩu của người trả lời (n = 65)**

| Biến | Nhóm trả lời | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|
| Giới tính | Nam | 39 | 60,0 |
| Giới tính | Nữ | 26 | 40,0 |
| Dân tộc | Thái | 28 | 43,1 |
| Dân tộc | Mường | 28 | 43,1 |
| Dân tộc | Mông | 9 | 13,8 |
| Số năm sinh sống tại địa phương | Dưới 5 năm | 3 | 4,8 |
| Số năm sinh sống tại địa phương | Từ 5 đến 15 năm | 15 | 23,8 |
| Số năm sinh sống tại địa phương | Trên 15 năm | 45 | 71,4 |
| Trình độ học vấn | Chưa qua đào tạo | 4 | 6,2 |
| Trình độ học vấn | Tiểu học | 5 | 7,7 |
| Trình độ học vấn | Trung học cơ sở | 30 | 46,2 |
| Trình độ học vấn | Trung học phổ thông | 23 | 35,4 |
| Trình độ học vấn | Trung cấp, cao đẳng, đại học trở lên | 3 | 4,6 |
| Hoạt động tạo thu nhập chính | Nông nghiệp | 21 | 32,3 |
| Hoạt động tạo thu nhập chính | Chăn nuôi | 2 | 3,1 |
| Hoạt động tạo thu nhập chính | Lâm nghiệp | 3 | 4,6 |
| Hoạt động tạo thu nhập chính | Tiểu thủ công nghiệp | 1 | 1,5 |
| Hoạt động tạo thu nhập chính | Dịch vụ | 1 | 1,5 |
| Hoạt động tạo thu nhập chính | Công nhân, viên chức Nhà nước | 29 | 44,6 |
| Hoạt động tạo thu nhập chính | Khác | 8 | 12,3 |

**Ghi chú:** biến số năm sinh sống có hai phiếu để trống nên tỷ lệ được tính trên 63 phiếu trả lời; bốn biến còn lại đủ 65 phiếu. Toàn bộ người trả lời thuộc ba dân tộc Mường, Thái và Mông, bảo đảm điều kiện người trả lời có tri thức bản địa thực sự.

**Bảng F.2. Kết quả các câu hỏi nhóm đất (n = 65)**

| Mã câu | Nội dung và mẫu số | Nhóm đáp án | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|---|
| Đ.1.1 | Tham gia quản lý, sử dụng đất canh tác (n = 63) | Đang tham gia thường xuyên | 26 | 41,3 |
| Đ.1.1 | Tham gia quản lý, sử dụng đất canh tác (n = 63) | Đã từng tham gia nhưng hiện đã ngừng | 37 | 58,7 |
| Đ.1.4 | Lý do ngừng sử dụng đất canh tác (n = 37) | Thiếu nhân lực | 26 | 70,3 |
| Đ.1.4 | Lý do ngừng sử dụng đất canh tác (n = 37) | Chuyển đổi mục đích theo quy hoạch | 6 | 16,2 |
| Đ.1.4 | Lý do ngừng sử dụng đất canh tác (n = 37) | Đất bị bạc màu, xói mòn nặng | 4 | 10,8 |
| Đ.1.4 | Lý do ngừng sử dụng đất canh tác (n = 37) | Khác | 1 | 2,7 |
| Đ.6 | Mức độ cần số hóa bản đồ hướng dẫn về đất (n = 64) | Bình thường | 4 | 6,3 |
| Đ.6 | Mức độ cần số hóa bản đồ hướng dẫn về đất (n = 64) | Cần thiết | 58 | 90,6 |
| Đ.6 | Mức độ cần số hóa bản đồ hướng dẫn về đất (n = 64) | Rất cần thiết | 2 | 3,1 |

**Ghi chú:** câu Đ.1.1 có hai phiếu thiếu, câu Đ.1.4 chỉ được hỏi đối với người trả lời đã từng tham gia và hiện đã ngừng, câu Đ.6 có một phiếu thiếu. Nhóm đáp án hoàn toàn không cần thiết và không cần thiết của câu Đ.6 không có phiếu chọn. Tổng nhóm cần thiết và rất cần thiết đạt 93,7% — chỉ số nhu cầu số hóa cao nhất trong ba nhóm tài nguyên.

**Bảng F.3. Kết quả các câu hỏi nhóm nước (n = 65)**

| Mã câu | Nội dung và mẫu số | Nhóm đáp án | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|---|
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Rất hiếm khi | 6 | 9,5 |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Ít khi | 2 | 3,2 |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Thỉnh thoảng | 45 | 71,4 |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Thường xuyên | 8 | 12,7 |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Rất thường xuyên | 2 | 3,2 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Không bao giờ thực hiện | 8 | 12,3 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Hiếm khi | 6 | 9,2 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Thỉnh thoảng | 27 | 41,5 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Thường xuyên | 22 | 33,8 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Luôn luôn thực hiện | 2 | 3,1 |
| N.7 | Mức độ cần số hóa bản đồ hướng dẫn về nước (n = 65) | Hoàn toàn không cần thiết | 3 | 4,6 |
| N.7 | Mức độ cần số hóa bản đồ hướng dẫn về nước (n = 65) | Bình thường | 26 | 40,0 |
| N.7 | Mức độ cần số hóa bản đồ hướng dẫn về nước (n = 65) | Cần thiết | 27 | 41,5 |
| N.7 | Mức độ cần số hóa bản đồ hướng dẫn về nước (n = 65) | Rất cần thiết | 9 | 13,8 |

**Ghi chú:** câu N.2.2 có hai phiếu thiếu; nhóm đáp án không cần thiết của câu N.7 không có phiếu chọn. Tổng nhóm cần thiết và rất cần thiết của câu N.7 đạt 55,3% — thấp hơn hẳn nhóm đất và nhóm rừng, chủ yếu do tới 40,0% người trả lời chọn mức bình thường.

**Bảng F.4. Kết quả các câu hỏi nhóm rừng (n = 65)**

| Mã câu | Nội dung và mẫu số | Nhóm đáp án | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|---|
| R.1 | Duy trì song song cách phân loại rừng theo phong tục (n = 65) | Có | 60 | 92,3 |
| R.1 | Duy trì song song cách phân loại rừng theo phong tục (n = 65) | Không | 5 | 7,7 |
| R.2 | Cách phân loại theo phong tục đã ghi vào hương ước, quy ước (n = 65) | Có | 54 | 83,1 |
| R.2 | Cách phân loại theo phong tục đã ghi vào hương ước, quy ước (n = 65) | Không | 11 | 16,9 |
| R.3 | Rừng Nhà nước giao, khoán trùng rừng thiêng, rừng ma, rừng cấm (n = 65) | Có | 42 | 64,6 |
| R.3 | Rừng Nhà nước giao, khoán trùng rừng thiêng, rừng ma, rừng cấm (n = 65) | Không | 23 | 35,4 |
| R.4.1 | Thường vào rừng khác thu hái, tận dụng sản phẩm (n = 65) | Có | 58 | 89,2 |
| R.4.1 | Thường vào rừng khác thu hái, tận dụng sản phẩm (n = 65) | Không | 7 | 10,8 |
| R.5.1 | Áp dụng biện pháp giúp cây rừng tự phục hồi (n = 62) | Có | 60 | 96,8 |
| R.5.1 | Áp dụng biện pháp giúp cây rừng tự phục hồi (n = 62) | Không | 2 | 3,2 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Hoàn toàn không cần thiết | 4 | 6,2 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Không cần thiết | 2 | 3,1 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Bình thường | 7 | 10,8 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Cần thiết | 43 | 66,2 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Rất cần thiết | 9 | 13,8 |

**Ghi chú:** câu R.5.1 có ba phiếu thiếu nên tỷ lệ được tính trên 62 phiếu; các câu còn lại đủ 65 phiếu. Tổng nhóm cần thiết và rất cần thiết của câu R.7 đạt 80,0%. Tỷ lệ 64,6% ở câu R.3 là bằng chứng định lượng về hiện tượng chồng lấn giữa rừng do Nhà nước giao, khoán với rừng theo phong tục của bản.

**Bảng F.5. Kết quả nhóm câu hỏi về nhu cầu bản đồ (n = 65)**

| Mã câu | Nội dung và mẫu số | Nhóm đáp án | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|---|
| B.3 | Hình thức bản đồ mong muốn sử dụng (n = 61) | Bản đồ giấy treo tại nhà văn hóa bản | 7 | 11,5 |
| B.3 | Hình thức bản đồ mong muốn sử dụng (n = 61) | Ứng dụng, website tra cứu trên điện thoại | 6 | 9,8 |
| B.3 | Hình thức bản đồ mong muốn sử dụng (n = 61) | Cả hai hình thức trên | 46 | 75,4 |
| B.3 | Hình thức bản đồ mong muốn sử dụng (n = 61) | Không có nhu cầu sử dụng | 2 | 3,3 |
| B.5 | Mức độ sẵn sàng sử dụng bản đồ (n = 62) | Sẵn sàng sử dụng thường xuyên | 14 | 22,6 |
| B.5 | Mức độ sẵn sàng sử dụng bản đồ (n = 62) | Sử dụng khi cần thiết | 47 | 75,8 |
| B.5 | Mức độ sẵn sàng sử dụng bản đồ (n = 62) | Không có nhu cầu sử dụng | 1 | 1,6 |

**Ghi chú:** câu B.3 có bốn phiếu thiếu, câu B.5 có ba phiếu thiếu. Tổng nhóm sẵn sàng sử dụng bản đồ đạt 98,4%; tỷ lệ chọn cả hai hình thức đạt 75,4% là cơ sở trực tiếp cho việc hệ thống phải đồng thời hỗ trợ bản đồ số và bản đồ giấy.

**Bảng F.6. Kết quả kiểm định mối liên hệ giữa biến dân tộc và một số biến kết quả**

| Biến chéo | Chi bình phương Pearson | Bậc tự do | Sig. (hai phía) | Số phiếu hợp lệ | Nhận xét |
|---|---|---|---|---|---|
| Dân tộc và hình thức bản đồ mong muốn | 37,51 | 6 | 0,000 | 61 | Có ý nghĩa thống kê; Cramer's V bằng 0,55, hệ số Phi bằng 0,78 |
| Giới tính và dân tộc | 2,57 | 2 | 0,277 | 65 | Không có mối liên hệ thống kê |
| Dân tộc và rừng giao, khoán trùng rừng thiêng | 3,00 | 2 | 0,223 | 65 | Không có mối liên hệ thống kê |

**Ghi chú:** chỉ biến chéo giữa dân tộc và hình thức bản đồ mong muốn đạt ý nghĩa thống kê ở mức cao, cho thấy nhu cầu về hình thức bản đồ khác nhau giữa các dân tộc. Các kết quả kiểm định còn lại cho thấy sự phân bố câu trả lời tương đối đồng đều giữa các nhóm dân tộc được khảo sát.

**Bảng F.7. Phân bố hình thức bản đồ mong muốn theo dân tộc (n = 61)**

| Dân tộc | Bản đồ giấy treo tại nhà văn hóa bản | Ứng dụng, website trên điện thoại | Cả hai hình thức | Không có nhu cầu | Tổng phiếu |
|---|---|---|---|---|---|
| Thái | 0 (0,0%) | 2 (7,4%) | 23 (85,2%) | 2 (7,4%) | 27 |
| Mông | 5 (83,3%) | 0 (0,0%) | 1 (16,7%) | 0 (0,0%) | 6 |
| Mường | 2 (7,1%) | 4 (14,3%) | 22 (78,6%) | 0 (0,0%) | 28 |
| Tổng | 7 (11,5%) | 6 (9,8%) | 46 (75,4%) | 2 (3,3%) | 61 |

**Ghi chú:** bốn phiếu thiếu của câu B.3 được phân bổ gồm một phiếu người Thái và ba phiếu người Mông. Các con số trong ngoặc là tỷ lệ phần trăm theo hàng. Khác biệt giữa ba nhóm dân tộc giải thích cho kết quả kiểm định nêu ở Bảng F.6 và hàm ý thiết kế: hệ thống phải duy trì đồng thời cả bản đồ giấy và bản đồ số thay vì chọn một trong hai hình thức.

## Phụ lục G — Thông số kỹ thuật và hướng dẫn xuất dữ liệu

Phụ lục này bổ sung các thông số kỹ thuật cần thiết để người vận hành có thể tái lập, kiểm tra và mở rộng hệ thống mà không phải tra lại toàn bộ chương trình chính. Nội dung được tổng hợp từ kết quả xây dựng và kiểm chứng hệ thống nêu ở Chương 2 và Chương 3, kèm quy cách xuất bản đồ theo chuẩn trình bày hiện hành.

**Bảng G.1. Thông số kỹ thuật chính của hệ thống WebGIS**

| Hạng mục | Thông số | Ghi chú vận hành |
|---|---|---|
| Kiến trúc hệ thống | Ứng dụng web chạy hoàn toàn trên trình duyệt, kiến trúc phía máy khách | Không cần cài đặt, phù hợp máy trạm của cấp xã |
| Framework giao diện | React [26] | Quản lý trạng thái giao diện, lớp bản đồ và bảng thông tin địa bàn |
| Thư viện bản đồ | Leaflet [27] | Hiển thị lớp phủ, biểu tượng điểm, popup và chú giải |
| Chế độ xem | Hai chiều và ba chiều theo chiều cao địa hình | Chuyển đổi từ thanh công cụ chính |
| Dạng dữ liệu nền | JSON và GeoJSON công khai qua web server | Dễ kiểm tra, đối chiếu và phân phối lại |
| Kiểm thử hệ thống | Kiểm thử đầu cuối bằng Playwright [28] | Kịch bản kiểm tra giao diện nêu ở Phụ lục C |
| Quy trình phát triển | Kiểm định kép giữa máy sinh mã và người đối chiếu nguồn | Kết hợp tám vòng rà soát dữ liệu [30] |
| Bộ dữ liệu nền | Bảy nhóm lớp, 73 đối tượng và năm lớp raster chuyên đề | Cập nhật lần cuối ngày 16/10/2026 [30] |
| Khổ giấy xuất bản đồ | A4 và A3, phương đứng và phương ngang | Bốn tổ hợp khổ, xem Bảng G.3 |
| Chuẩn trình bày bản đồ | QCVN 80:2024/BTNMT [6] | Áp dụng cho cả bản đồ số và bản đồ in |

**Bảng G.2. Lớp dữ liệu của hệ thống và quy cách hiển thị**

| Lớp dữ liệu | Dạng thực thể | Số đối tượng | Nguồn dữ liệu | Cách hiển thị chính |
|---|---|---|---|---|
| Sông suối | Đường | 7 | OpenStreetMap [8] | Lớp tuyến sông, suối theo chủ đề |
| Thủy lợi truyền thống | Điểm | 6 | Tài liệu nghiên cứu [10], [11], [14], [18] | Biểu tượng công trình kèm mô tả và nguồn |
| Bản làng tiêu biểu | Danh sách theo đơn vị hành chính | 25 | Hồ sơ dân tộc và bộ ảnh nguồn [25] | Khối hiển thị trong bảng thông tin địa bàn |
| Rừng và khu bảo tồn | Vùng | 11 | WDPA [7], tài liệu khoa học [12] | Lớp vùng rừng, khu bảo tồn |
| Mô hình VAC và VACR | Điểm | 8 | Báo chí chính thống [20], [21] | Biểu tượng mô hình kèm thành phần tuần hoàn |
| Cây và vùng dược liệu | Vùng, điểm | 11 | Tài liệu [16], [19] | Lớp dược liệu theo địa bàn |
| Luật tục, vùng phong tục | Vùng theo đơn vị hành chính | 5 | Luật tục, hương ước [13] | Danh sách theo đơn vị hành chính |
| Ranh giới đơn vị hành chính | Vùng polygon | 75 đơn vị | Cổng dữ liệu mở tỉnh Sơn La [5], GADM [9] | Lớp nền, tra cứu và khung chọn |
| Cơ cấu dân tộc | Biểu đồ tròn trên marker | 75 đơn vị | Tổng điều tra [1], Cổng dữ liệu mở [5] | Marker biểu đồ tròn, lát cắt phần bù dân tộc khác |
| Mật độ dân số | Vùng polygon tô màu | 75 đơn vị | Tổng điều tra [1], Cổng dữ liệu mở [5] | Thang màu bảy bậc theo người trên một km vuông |
| Raster chuyên đề | Lớp ô | 5 lớp | SRTM và mô hình khí hậu [24] | Lớp nền địa hình, khí hậu và mật độ |

**Bảng G.3. Quy cách xuất bản đồ giấy trên hệ thống**

| Thành phần | Quy cách | Ghi chú |
|---|---|---|
| Khổ giấy | A4 hoặc A3, phương đứng hoặc phương ngang | Người dùng chọn trong chức năng biên tập bản đồ |
| Khung bản đồ | Thiết lập theo tỉ lệ khổ giấy, mỗi chiều chiếm 62 phần trăm diện tích trang | Bảo đảm tỉ lệ khung bằng tỉ lệ trang |
| Chú giải | Đặt ngoài khung bản đồ và tự đồng bộ với các lớp đang bật | Tuân thủ yêu cầu trình bày của QCVN 80 [6] |
| Ký hiệu chuyên đề | Ký hiệu nhóm lớp thống nhất giữa bản đồ số và bản đồ in | Nhất quán với chú giải thích ứng trên giao diện |
| Thang mật độ dân số | Thang màu bảy bậc liên tục theo người trên một km vuông | Các bậc: dưới 50, từ 50 đến 100, từ 100 đến 200, từ 200 đến 500, từ 500 đến 1.000, từ 1.000 đến 2.000, trên 2.000 |
| Biểu đồ cơ cấu dân tộc | Biểu đồ tròn tại từng đơn vị hành chính | Lát cắt phần bù dân tộc khác bằng phép trừ chính xác tới một trăm phần trăm |
| Chú giải thích ứng | Chỉ hiển thị chú giải của đối tượng nằm trong khung nhìn và vùng chọn | Tránh gây rối bản đồ khi zoom ra xa |
| Tiêu đề bản đồ | Tự động cập nhật theo vùng đang xem và khổ giấy đã chọn | Đồng bộ khi đổi khổ |
| Nguồn dữ liệu | Ghi nguồn dữ liệu trên bản đồ in | Tra cứu theo khung phân hạng ở Phụ lục B |
| Kiểm tra trước khi in | Bật đúng các lớp, chọn đúng vùng, kiểm tra chú giải ngoài khung | Theo các bước nêu ở Phụ lục D |

**Quy trình chuẩn hóa và cập nhật dữ liệu.** Dữ liệu được đưa vào hệ thống theo sáu bước: rà soát tài liệu và chọn lọc nguồn theo khung phân hạng ở Phụ lục B; trích xuất nội dung không gian gồm tọa độ, ranh giới và mã đơn vị hành chính; chuẩn hóa định dạng và lược đồ trường dữ liệu theo Phụ lục A; đối chiếu chéo giữa các nguồn; gán mức độ tin cậy nguồn cho từng đối tượng; duyệt trước khi đưa vào hiển thị. Quy trình được áp dụng thống nhất cho cả bảy nhóm lớp và đã trải qua tám vòng rà soát định kỳ; vòng cập nhật gần nhất ngày 16/10/2026 đã loại bỏ 11 đối tượng không còn tra được nguồn [30]. Nguyên tắc xuyên suốt là không tra được nguồn thì không đưa vào bản đồ.

**Cơ chế bảo đảm dữ liệu hiển thị luôn là bản đã kiểm định.** Mỗi đối tượng hiển thị kèm một trong bốn nhãn trạng thái: có nguồn, một phần, dự đoán hoặc minh họa; khi bấm vào đối tượng, người dùng thấy nhãn trạng thái cùng danh sách liên kết nguồn dạng liên kết bấm được. Hệ thống còn tự kiểm tra dữ liệu lưu tạm trong trình duyệt: nếu phát hiện bản dữ liệu cũ mang nhãn chưa xác minh còn tồn đọng, ứng dụng sẽ loại bỏ bản đó và tải lại bản dữ liệu đã kiểm định từ máy chủ, bảo đảm người dùng cuối không nhìn nhầm dữ liệu chờ xác minh thành dữ liệu chính thức. Bộ ba trạng thái này cùng với bảng phân hạng nguồn ở Phụ lục B tạo thành hệ thống kiểm soát chất lượng chạy xuyên suốt từ khâu thu thập đến khâu hiển thị.

**Hướng dẫn mở rộng sang địa phương khác.** Khi áp dụng mô hình cho tỉnh hoặc huyện khác, nhóm vận hành chỉ cần thay bộ dữ liệu nền, cập nhật mã đơn vị hành chính và bảng phân hạng nguồn tương ứng. Khung kỹ thuật, khung truy thực nguồn, quy tắc chú giải thích ứng và quy cách xuất bản đồ nêu trên được giữ nguyên. Việc thay đổi thư viện hoặc phiên bản nền tảng bắt buộc phải đi kèm chạy lại toàn bộ kiểm thử tự động [28] và đối soát lại bảy nhóm lớp theo Phụ lục A. Với nhu cầu cấp xã sau sáp nhập đơn vị hành chính [4], bộ tài liệu này đủ để đội kỹ thuật địa phương tiếp nhận, vận hành và cập nhật hệ thống mà không cần duy trì nhóm phát triển chuyên trách.

**Ghi chú vận hành:** các thông số trên được xác nhận tại thời điểm nghiệm thu đề tài; khi bổ sung đối tượng mới, cần gán đủ trường dữ liệu theo Bảng A.1, cập nhật trường nguồn và trạng thái, sau đó mới phê duyệt để đối tượng hiển thị công khai.

## Phụ lục H — Mã nguồn chương trình WebGIS tiêu biểu

Phụ lục này trích dẫn các đoạn mã nguồn quan trọng nhất của chương trình WebGIS, giúp người đọc đối chiếu giữa kết quả trình bày tại Chương 3 (đặc biệt mục 3.4 và 3.5) với cách hiện thực hóa trong phần mềm. Các đoạn mã được lấy nguyên văn từ mã nguồn tại thời điểm nghiệm thu đề tài; vị trí file và khoảng dòng được ghi ngay dưới tiêu đề mỗi đoạn mã. Trong một số đoạn, phần mã bị lược bỏ được biểu diễn bằng dòng chú thích (bỏ dòng …); mọi dòng còn lại đều giữ nguyên văn như trong file nguồn.

Về mặt kỹ thuật, chương trình WebGIS được viết bằng TypeScript trên nền React 18, dùng thư viện Leaflet 1.9.4 để hiển thị bản đồ và html2canvas — jsPDF để xuất bản đồ thành tệp ảnh hoặc PDF (xem Phụ lục G). Mã nguồn nằm trong thư mục `src/` của dự án; bốn file được trích dẫn trong phụ lục này gồm trang chính của hệ thống, cửa sổ soạn thảo bản đồ, tiện ích địa lý và cấu hình dân tộc.

**Bảng H.1. Các file mã nguồn chính được trích dẫn trong phụ lục**

| Đoạn mã | File nguồn | Vai trò |
|---|---|---|
| H.1–H.11 | `src/pages/WebGIS goc.tsx` | Trang chính: quản lý trạng thái bản đồ, nạp dữ liệu nền, phục hồi cấu hình an toàn, chú giải thích ứng, biểu đồ tròn cơ cấu dân tộc |
| H.12 | `src/components/MapComposer.tsx` | Cửa sổ soạn thảo và xuất bản đồ theo bố cục QCVN 80:2024/BTNMT |
| H.13 | `src/utils/geoUtils.ts` | Tiện ích đọc tệp GeoJSON và tải tệp xuống máy |
| H.14 | `src/components/ethnicConfig.ts` | Cấu hình dùng chung cho lược đồ mặt cắt và nông lịch theo dân tộc |

**Đoạn mã H.1. Hằng số cấu hình và cấu trúc nhóm lớp dữ liệu chuẩn hóa**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 54–97.

```tsx
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
/** Chuyển đường dẫn ảnh tương đối (vd: data/images/...) sang URL có BASE_PATH; giữ nguyên http/data:/blob:. */
const assetUrl = (p: string) => {
  if (!p) return p;
  if (/^(https?:|data:|blob:)/.test(p)) return p;
  if (p.startsWith(BASE_PATH + "/")) return p;
  return BASE_PATH + "/" + p.replace(/^\//, "");
};
const LAYER_CONFIG_STORAGE_KEY = "webgis-layer-config";
// Bump when built-in layer content in public/data/layers.json changes (forces discard of stale saved copies)
const LAYER_DATA_REV = 6;
const LAYER_DATA_REV_KEYS = ["rivers", "irrigation", "forests", "vac_models", "medicinal_plants"];
// Lớp đã gỡ khỏi giao diện bản đồ (round 3): hiển thị văn bản theo xã trong panel "Thông tin địa bàn"
const REMOVED_LAYER_IDS = new Set(["villages", "customary_zones"]);

// Cấu trúc lớp dữ liệu chuẩn hóa theo Atlat Quốc gia Việt Nam
const DEFAULT_LAYER_CATEGORIES = [
  { id: "hydrology", ten: "03. Thủy văn & Tài nguyên nước", icon: "💧", layers: [
    { id: "rivers", ten: "Hệ thống sông suối (OpenStreetMap)", mau: "#2589c7", bieu_tuong: "🌊", iconOnly: true },
    { id: "irrigation", ten: "Thủy lợi truyền thống (Mương·Phai)", mau: "#74c69d", bieu_tuong: "🚿", iconOnly: true }, 
  ]},
  { id: "landcover", ten: "04. Lớp phủ & Sử dụng đất", icon: "🌾", layers: [
    { id: "vac_models", ten: "Mô hình VAC/VACR tuần hoàn", mau: "#b5e48c", bieu_tuong: "🏡", iconOnly: true },
  ]},
  { id: "forest", ten: "05. Rừng & Sinh thái", icon: "🌲", layers: [
    { id: "forests", ten: "Phân vùng rừng", mau: "#2d6a4f", bieu_tuong: "🌲", iconOnly: true },
    { id: "medicinal_plants", ten: "Khu vực cây thuốc quý", mau: "#e63946", bieu_tuong: "🌿", iconOnly: true },
  ]},
  { id: "socio", ten: "09. Kinh tế - Xã hội & Dân cư", icon: "🏘️", layers: [
    { id: "ward_boundaries", ten: "Ranh giới xã/phường", mau: "#6b4226", bieu_tuong: "🗺️" },
    { id: "population_density", ten: "Mật độ dân số", mau: "#2a9d8f", bieu_tuong: "📊" }
  ]},
];
const EDITABLE_LAYERS = new Set(["irrigation", "forests", "vac_models", "medicinal_plants"]);
const LAYER_GEOM_TYPE: Record<string, "point" | "line" | "polygon"> = {
  rivers: "line", irrigation: "point", forests: "polygon", vac_models: "point",
  medicinal_plants: "polygon", population_density: "polygon",
  province_boundaries: "line", ward_boundaries: "line",
};
const LAYER_DISPLAY: Record<string, { name: string; color: string }> = {
  province_boundaries: { name: "Ranh giới tỉnh", color: "#3c5b45" },
  ward_boundaries: { name: "Ranh giới xã/phường", color: "#345b41" },
  population_density: { name: "Mật độ dân số", color: "#fe9929" },
  rivers: { name: "Hệ thống sông suối", color: "#2589c7" },
  irrigation: { name: "Thủy lợi truyền thống", color: "#74c69d" },
  forests: { name: "Phân vùng rừng", color: "#52b788" },
  vac_models: { name: "Mô hình VAC/VACR", color: "#b5e48c" },
  medicinal_plants: { name: "Cây thuốc quý", color: "#e63946" },
};
```

Đoạn mã trên thể hiện hai nội dung then chốt: thứ nhất, hằng số phiên bản dữ liệu `LAYER_DATA_REV` cùng danh sách lớp bị ảnh hưởng (`LAYER_DATA_REV_KEYS`) là cơ sở để hệ thống từ chối phục hồi bản lưu cũ khi file dữ liệu nền `layers.json` đã thay đổi; thứ hai, `DEFAULT_LAYER_CATEGORIES` sắp xếp các lớp vào bốn nhóm con thuộc khung bảy nhóm tri thức — tài nguyên (thủy văn, lớp phủ đất, rừng — sinh thái, kinh tế — xã hội) khớp với bảng trường dữ liệu tại Phụ lục A.

**Đoạn mã H.2. Hàm trạng thái nguồn tra cứu hiển thị trong popup chi tiết đối tượng**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 276–286.

```tsx
const statusNote = (x: { trang_thai?: string; nguon?: string[] } | null | undefined): string => {
  if (!x?.trang_thai) return "";
  const msg = x.trang_thai === "minh_hoa" ? "⚠ Dữ liệu minh họa — chưa có nguồn xác minh, không dùng làm căn cứ"
    : x.trang_thai === "chua_xac_minh" ? "ⓘ Chưa xác minh trực tiếp — cần đối chiếu thêm ở hiện trường"
    : x.trang_thai === "co_nguon" ? "✓ Đã đối chiếu nguồn — danh sách nguồn bên dưới"
    : "ⓘ Một phần có nguồn — xem ghi chú nguồn";
  const color = x.trang_thai === "minh_hoa" ? "#b45309" : x.trang_thai === "co_nguon" ? "#15803d" : "#64748b";
  const links = (x.nguon || []).map(u => /^https?:\/\//.test(u) ? `<a href="${u}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline">${u}</a>` : u);
  const src = links.length ? `<p style="margin:4px 0 0;font-size:10px;color:#64748b">Nguồn: ${links.join("; ")}</p>` : "";
  return `<p style="margin:6px 0 0;font-size:11px;color:${color}">${msg}</p>${src}`;
};
```

Hàm này là hiện thực hóa trực tiếp nguyên tắc truy thực nguồn của đề tài: mỗi đối tượng mang bốn trạng thái — minh họa, chưa xác minh, một phần có nguồn, đã đối chiếu nguồn — được hiển thị ngay trong popup kèm danh sách liên kết nguồn, tương ứng với cột trường nguồn và trạng thái trong Bảng A.1.

**Đoạn mã H.3. Lưu cấu hình lớp vào bộ nhớ trình duyệt, loại bỏ dữ liệu chưa đối chiếu nguồn**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 553–572.

```tsx
  useEffect(() => {
    try {
      const payload: Record<string, unknown> = { customLayers, layerCategories, layerSymbologies, deletedCategoryIds, hiddenLayerIds };
      if (layersData) {
        const { rivers: _rivers, ...rest } = layersData as Record<string, any>;
        // Không lưu lại mảng built-in còn nhãn minh họa/chưa xác minh (dữ liệu cũ từ phiên trước) — lần nạp sau lấy bản mới từ layers.json
        const hasStaleLabel = (arr: unknown) => Array.isArray(arr) && arr.some((x: any) => x?.trang_thai === "minh_hoa" || x?.trang_thai === "chua_xac_minh");
        Object.keys(rest).forEach(k => { if (!k.startsWith("custom_") && hasStaleLabel(rest[k])) delete rest[k]; });
        payload.layersData = rest;
        payload.layersDataRev = LAYER_DATA_REV;
      } else {
        // Chưa load xong: giữ nguyên layersData đã lưu từ phiên trước
        try {
          const prev = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
          if (prev?.layersData) { payload.layersData = prev.layersData; payload.layersDataRev = prev.layersDataRev; }
        } catch { /* bỏ qua */ }
      }
      window.localStorage.setItem(LAYER_CONFIG_STORAGE_KEY, JSON.stringify(payload));
    } catch { /* Ignore storage quota or privacy errors. */ }
  }, [customLayers, layerCategories, layerSymbologies, layersData, deletedCategoryIds, hiddenLayerIds]);
```

**Đoạn mã H.4. Nạp dữ liệu nền và phục hồi có kiểm soát cấu hình lớp từ phiên trước**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 611–688 (bao gồm hàm đọc cấu hình đã lưu và hiệu ứng nạp dữ liệu khi khởi động trang).

```tsx
  const readSavedLayerConfig = (): { layersData?: Record<string, any[]>; layersDataRev?: number } | null => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      return saved?.layersData && typeof saved.layersData === "object" ? saved : null;
    } catch { return null; }
  };

  useEffect(() => {
    const loadStandardHydrography = async (fallback: any) => {
      const query = `[out:json][timeout:60];(way["waterway"="river"](20.5,101.5,23.5,105.5);way["waterway"="stream"]["name"](20.5,101.5,23.5,105.5););out tags geom;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`Hydrography request failed: ${response.status}`);
      const payload = await response.json() as { elements?: { id: number; tags?: Record<string, string>; geometry?: { lat: number; lon: number }[] }[] };
      const rivers = (payload.elements || []).flatMap(element => {
        const geometry = element.geometry || [];
        if (geometry.length < 2) return [];
        const tags = element.tags || {};
        const isMainRiver = tags.waterway === "river";
        return [{
          id: `osm_${element.id}`,
          ten: tags.name || (isMainRiver ? "Sông không tên" : "Suối không tên"),
          ten_dia_phuong: tags["name:vi"] || "",
          coords: geometry.map(point => [point.lon, point.lat]),
          cap_song: isMainRiver ? 1 : 2,
          width: isMainRiver ? 3.2 : 1.8,
        }];
      });
      if (rivers.length === 0) throw new Error("No standard hydrography features returned");
      // Giữ metadata đã đối chiếu nguồn (mo_ta/nguon/trang_thai) từ layers.json cho các sông khớp tên
      const localByName = new Map<string, any>();
      ((fallback as any)?.rivers || []).forEach((r: any) => { if (r?.ten) localByName.set(String(r.ten).toLowerCase(), r); });
      const enriched = rivers.map(r => {
        const local = localByName.get(String(r.ten).toLowerCase());
        return local ? { ...r, mo_ta: local.mo_ta, nguon: local.nguon, trang_thai: local.trang_thai, ghi_chu: local.ghi_chu } : r;
      });
      setLayersData(prev => ({ ...(prev || fallback), rivers: enriched } as LayersData));
    };

    fetch(BASE_PATH+"/data/dan_toc.json").then(r=>r.json()).then(setDanTocData).catch(console.error);
    fetch(BASE_PATH+"/data/raster/meta.json").then(r=>r.json()).then(setRasterMeta).catch(console.error);
    fetch(BASE_PATH+"/data/tinh.geojson").then(r=>r.json()).then((g: GeoJSON.FeatureCollection) => {
      provinceMaskGeomRef.current = g;
      maskedRasterCacheRef.current.clear();
    }).catch(console.error);
    // cache:"no-cache" + ?v=REV: buộc trình duyệt revalidate/ruột URL mới, tránh phụ thuộc heuristic cache của file public (không có Cache-Control)
    fetch(BASE_PATH+"/data/layers.json?v="+LAYER_DATA_REV, { cache: "no-cache" }).then(r=>r.json()).then((d: any) => {
      if (d.medicinal_plants) {
        d.medicinal_plants = d.medicinal_plants.map((p: any) => {
          const { ["tình_trang"]: tt, ...rest } = p;
          return tt && !rest.tinh_trang ? { ...rest, tinh_trang: tt } : rest;
        });
      }
      // Phục hồi dữ liệu lớp người dùng đã biên tập trong các phiên trước
      const savedConfig = readSavedLayerConfig();
      const savedLayerData = savedConfig?.layersData;
      if (savedLayerData) {
        const savedRev = (savedConfig as any)?.layersDataRev;
        const hasStaleLabel = (arr: unknown) => Array.isArray(arr) && arr.some((x: any) => x?.trang_thai === "minh_hoa" || x?.trang_thai === "chua_xac_minh");
        Object.keys(savedLayerData).forEach(key => {
          if (!Array.isArray(savedLayerData[key])) return;
          if (key === "rivers") return; // rivers tải lại từ Overpass mỗi phiên
          // Bản lưu cũ (trước khi layers.json được đối chiếu nguồn) không dùng nữa — lấy bản mới nhất
          if (LAYER_DATA_REV_KEYS.includes(key) && savedRev !== LAYER_DATA_REV) return;
          // Bản lưu còn nhãn minh họa/chưa xác minh = dữ liệu trước khi đối chiếu nguồn (kể cả khi rev trùng) — bỏ
          if (!key.startsWith("custom_") && hasStaleLabel(savedLayerData[key])) return;
          if (key === "forests" || key === "medicinal_plants") {
            // Phiên trước lưu dạng điểm (lat/lng) — không dùng nữa; chỉ nhận bản đã biên tập dạng polygon
            const polygonItems = savedLayerData[key].filter((x: any) => Array.isArray(x?.coords));
            if (polygonItems.length) d[key] = polygonItems;
            return;
          }
          if (key in d || key.startsWith("custom_")) d[key] = savedLayerData[key];
        });
      }
      setLayersData(d);
      loadStandardHydrography(d).catch(error => console.warn("Using local hydrography fallback:", error));
    }).catch(console.error);
  }, []);
```

Đây là đoạn then chốt nhất cho câu chuyện kiểm định dữ liệu của đề tài: dữ liệu nền `layers.json` được tải lại theo từng phiên với tham số `?v=6` và `cache: "no-cache"`; khi phục hồi bản lưu của người dùng, hệ thống lần lượt loại trừ các mảng còn nhãn minh họa hoặc chưa xác minh, các mảng đã bị thay thế bởi bản mới (đối chiếu `layersDataRev`), và các lớp rừng — cây thuốc vẫn còn lưu dạng điểm thô; riêng lớp sông suối luôn lấy mới từ Overpass mỗi phiên rồi ghép lại metadata nguồn đã đối chiếu theo tên sông.

**Đoạn mã H.5. Nạp ranh giới bốn tỉnh khi người dùng bật lớp**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 690–710.

```tsx
  /* ─── Lazy load ward boundaries when toggled ─── */
  useEffect(() => {
    if (!activeLayers.has("ward_boundaries") || allWardsGeoJson) return;
    setLoadingWardBoundaries(true);
    Promise.all([
      { p: "Sơn La", f: "/data/xa_sonla.geojson" },
      { p: "Điện Biên", f: "/data/xa_dienbien.geojson" },
      { p: "Lai Châu", f: "/data/xa_laichau.geojson" },
      { p: "Lào Cai", f: "/data/xa_laocai.geojson" }
    ].map(({ p, f }) =>
      fetch(BASE_PATH + f).then(r => r.json()).then((d: GeoJsonData) => ({ p, d }))
    )).then(arr => {
      const merged: GeoJsonData = {
        type: "FeatureCollection",
        features: arr.flatMap(({ p, d }) =>
          d.features.map(f => ({ ...f, properties: { ...f.properties, ten_tinh: p } }))
        )
      };
      setAllWardsGeoJson(merged);
    }).catch(console.error).finally(() => setLoadingWardBoundaries(false));
  }, [activeLayers, allWardsGeoJson]);
```

Bốn tệp ranh giới cấp xã của Sơn La — Điện Biên — Lai Châu — Lào Cai (cùng phủ trùm Tây Bắc) được nạp có điều kiện (lazy load) ngay khi người dùng bật lớp ranh giới, sau đó hợp nhất thành một bộ sưu tập duy nhất và gắn thêm trường `ten_tinh` cho từng đối tượng — đây chính là dữ liệu nền cho bảng tra cứu dân số tại Bảng F.2.

**Đoạn mã H.6. Tìm kiếm hành chính và tự động bay tới xã kết quả**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 712–754.

```tsx
  useEffect(() => {
    if (!pendingWardSearch || !currentProvinceGeoJson || !wardsLayerRef.current) return;
    const target = currentProvinceGeoJson.features.find(feature => String(feature.properties.ma_xa || "").toLowerCase() === pendingWardSearch.toLowerCase());
    if (!target) return;
    const props = target.properties as unknown as WardProperties;
    setSelectedWard(props);
    setSelectedWardIds(new Set([props.ma_xa]));
    setSelectedAreaOnly(true);
    wardsLayerRef.current.eachLayer(layer => {
      const feature = (layer as L.GeoJSON).feature as GeoJSON.Feature | undefined;
      if (feature?.properties?.ma_xa === props.ma_xa) {
        const bounds = (layer as L.Layer & { getBounds?: () => L.LatLngBounds }).getBounds?.();
        if (bounds?.isValid()) mapRef.current?.fitBounds(bounds, { padding: [70, 70], maxZoom: 14, duration: 0.8 });
      }
    });
    setPendingWardSearch(null);
  }, [pendingWardSearch, currentProvinceGeoJson]);

  const searchArea = async () => {
    const query = searchText.trim().toLowerCase();
    if (!query) return;
    const province = Object.keys(PROVINCE_FILES).find(name => name.toLowerCase() === query || name.toLowerCase().includes(query));
    if (province) {
      setSearchMessage(null);
      setSelectedAreaOnly(true);
      await handleProvinceClick(province);
      return;
    }
    const sources = Object.entries(PROVINCE_FILES);
    const results = await Promise.all(sources.map(async ([name, url]) => ({ name, data: await fetchGeoJson(url) })));
    const match = results.flatMap(result => result.data.features.map(feature => ({ ...result, feature }))).find(result => {
      const props = result.feature.properties as Record<string, unknown>;
      return String(props.ten_xa || "").toLowerCase().includes(query) || String(props.ma_xa || "").toLowerCase() === query;
    });
    if (!match) {
      setSearchMessage("Không tìm thấy xã hoặc tỉnh phù hợp.");
      return;
    }
    setSearchMessage(null);
    setPendingWardSearch(String((match.feature.properties as Record<string, unknown>).ma_xa || ""));
    setSelectedAreaOnly(true);
    await handleProvinceClick(match.name);
  };
```

**Đoạn mã H.7. Lớp nhãn tên xã hiển thị vĩnh viễn trên bản đồ**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 963–1002.

```tsx
  /* ─── Nhãn tên xã vĩnh viễn (bật/tắt · màu chữ · cỡ chữ) ─── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (wardLabelsLayerRef.current) {
      map.removeLayer(wardLabelsLayerRef.current);
      wardLabelsLayerRef.current = null;
    }
    if (!wardLabelConfig.on) return;
    const source = currentProvinceGeoJson || allWardsGeoJson;
    if (!source?.features?.length) return;
    const features = selectedAreaOnly && selectedWardIds.size > 0 && currentProvinceGeoJson
      ? currentProvinceGeoJson.features.filter(feature => selectedWardIds.has(String((feature.properties as unknown as WardProperties)?.ma_xa)))
      : source.features;
    const group = L.layerGroup();
    features.forEach(feature => {
      const props = (feature.properties ?? {}) as unknown as WardProperties;
      const name = String(props.ten_xa || "").trim();
      if (!name || !feature.geometry) return;
      const probe = L.geoJSON(feature as GeoJSON.Feature);
      const bounds = probe.getBounds();
      probe.remove();
      if (!bounds.isValid()) return;
      const center = bounds.getCenter();
      const icon = L.divIcon({
        className: "ward-label-icon",
        html: `<span style="color:${escapeHtmlText(wardLabelConfig.color)};font-size:${wardLabelConfig.size}px">${escapeHtmlText(name)}</span>`,
        iconSize: [0, 0],
      });
      L.marker([center.lat, center.lng], { icon, interactive: false, keyboard: false, bubblingMouseEvents: false, opacity: 1 }).addTo(group);
    });
    group.addTo(map);
    wardLabelsLayerRef.current = group;
    return () => {
      if (wardLabelsLayerRef.current === group) {
        map.removeLayer(group);
        wardLabelsLayerRef.current = null;
      }
    };
  }, [wardLabelConfig, currentProvinceGeoJson, allWardsGeoJson, selectedAreaOnly, selectedWardIds]);
```

**Đoạn mã H.8. Biểu đồ tròn cơ cấu dân tộc theo xã dạng dấu định vị (divIcon)**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 1004–1077.

```tsx
  /* ─── Ward ethnic pie-chart markers ─── */
  useEffect(() => {
    const overlayGroup = overlayGroupRef.current;
    if (!overlayGroup) return;
    if (pieChartLayerRef.current) {
      overlayGroup.removeLayer(pieChartLayerRef.current);
      pieChartLayerRef.current = null;
    }
    if (!showPieSelector || viewMode !== "ward" || pieWardSelection.size === 0 || !currentProvinceGeoJson) return;

    const group = L.layerGroup();
    group.addTo(overlayGroup);
    pieChartLayerRef.current = group;

    const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
      const start = [cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle)];
      const end = [cx + r * Math.cos(endAngle), cy + r * Math.sin(endAngle)];
      const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
      return `M ${cx} ${cy} L ${start[0]} ${start[1]} A ${r} ${r} 0 ${largeArcFlag} 1 ${end[0]} ${end[1]} Z`;
    };

    currentProvinceGeoJson.features.forEach(feature => {
      const props = feature.properties as unknown as WardProperties;
      if (!pieWardSelection.has(props.ma_xa)) return;
      const wardData = { ...props } as WardProperties;
      const composition = withOtherEthnic((wardOverrides.get(wardData.ma_xa)?.dan_toc ?? wardData.dan_toc ?? []).slice()).sort((a,b) => b.ty_le - a.ty_le);
      const total = composition.reduce((sum, item) => sum + item.ty_le, 0);
      const safeSlices = composition.filter(item => item.ty_le > 0);
      const geoLayer = L.geoJSON(feature as GeoJSON.Feature);
      const center = geoLayer.getBounds().getCenter();
      geoLayer.remove();

      const size = 74;
      const radius = 28;
      const centerX = size / 2;
      const centerY = size / 2;
      const stroke = "#ffffff";
      let startAngle = -Math.PI / 2;
      const paths = safeSlices.length > 0 ? safeSlices.map(item => {
        const info = getDanTocInfo(item.dan_toc);
        const pct = total > 0 ? (item.ty_le / total) * 100 : 0;
        const endAngle = startAngle + (pct / 100) * Math.PI * 2;
        const path = `<path d="${describeArc(centerX, centerY, radius, startAngle, endAngle)}" fill="${info?.mau || "#94a3b8"}" stroke="${stroke}" stroke-width="2"></path>`;
        startAngle = endAngle;
        return path;
      }).join("") : `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#e2e8f0" stroke="${stroke}" stroke-width="2"></circle>`;
      const tooltipContent = safeSlices.length > 0 ? `<div class="ward-tooltip"><b>${props.ten_xa}</b><br/>${safeSlices.map(item => {
        const info = getDanTocInfo(item.dan_toc);
        const nm = item.dan_toc === ETHNIC_OTHER_ID ? ETHNIC_OTHER_LABEL : (info?.ten || item.dan_toc).replace("Dân tộc ", "").replace("Người ", "");
        return `${nm}: ${item.ty_le}%`;
      }).join("<br/>")}</div>` : `<div class="ward-tooltip"><b>${props.ten_xa}</b><br/>Chưa có dữ liệu dân tộc</div>`;
      const icon = L.divIcon({
        html: `<div class="pie-chart-marker" title="${props.ten_xa}"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${paths}<circle cx="${centerX}" cy="${centerY}" r="${radius * 0.58}" fill="#ffffff" opacity="0.92"></circle><circle cx="${centerX}" cy="${centerY}" r="${radius * 0.56}" fill="rgba(15,31,15,0.95)"></circle></svg></div>`,
        className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([center.lat, center.lng], { icon, zIndexOffset: 1000 });
      marker.bindTooltip(tooltipContent, { sticky: true, className: "custom-tooltip ward-tip" });
      marker.on("click", () => {
        setSelectedWard(wardData);
        setSelectedDanToc(null);
        setActiveTriThuc(0);
        setEditingEthnicPct(null);
        setEditingWardComposition(wardData);
      });
      marker.addTo(group);
    });

    return () => {
      if (pieChartLayerRef.current) {
        overlayGroup.removeLayer(pieChartLayerRef.current);
        pieChartLayerRef.current = null;
      }
    };
  }, [showPieSelector, currentProvinceGeoJson, pieWardSelection, viewMode, wardOverrides, ethnicOverrides, danTocData]);
```

Đây là đoạn hiện thực hóa chức năng biểu đồ tròn đã trình bày tại Chương 3: mỗi xã được chọn nhận một dấu định vị dạng SVG tròn đặt tại tâm hình học của ranh giới xã; các cung được tính bằng hàm `describeArc` với góc khởi đầu tại phương Bắc, độ rộng mỗi cung tỷ lệ với tỷ lệ dân tộc; hàm `withOtherEthnic` tự động gộp phần trăm còn thiếu (nếu tổng các nhóm đã liệt kê dưới 100%) vào mục dân tộc khác để biểu đồ luôn khép kín.

**Đoạn mã H.9. Dựng chú giải thích ứng cho bản đồ xuất bản**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 1843–1961 (đoạn nằm trong hàm chụp ảnh bản đồ để đồng bộ sang cửa sổ xuất bản).

```tsx
    const mapBounds = mapRef.current.getBounds();
    // Vùng "Chỉ khu vực chọn" — cùng tập xã với mặt nạ trắng đang che ngoại vi trên bản đồ.
    // Ký hiệu ngoài vùng (bị phủ trắng) phải bị loại khỏi chú giải, kể cả khi bbox lọt khung nhìn.
    const regionBBox = selectedRegionBBoxOf(currentProvinceGeoJson, selectedAreaOnly, selectedProvince, selectedWardIds);
    const featureVisible = (feature: any): boolean => {
      const lat = Number(feature?.lat), lng = Number(feature?.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return mapBounds.contains([lat, lng]) && latLngInRegion(lat, lng, regionBBox);
      const bbox = coordsBBox(feature?.coords ?? feature?.geometry);
      return bboxInView(bbox, mapBounds) && bboxInRegion(bbox, regionBBox);
    };
    const annotationVisible = (ann: { coords?: Array<[number, number]> }): boolean => {
      const bbox = annotationBBox(ann.coords);
      return bboxInView(bbox, mapBounds) && bboxInRegion(bbox, regionBBox);
    };
    const isVisibleFeature = featureVisible;
    const legendLayerIds = Array.from(activeLayers).filter(id => {
      if (id === "population_density") return false;
      if (id === "ward_boundaries" || id === "population_density") {
        return !!currentProvinceGeoJson?.features.length || !!allWardsGeoJson?.features.length;
      }
      const features = layersData ? (layersData as any)[id] : null;
      return Array.isArray(features) && features.some(isVisibleFeature);
    });
    // Bản đồ chính luôn vẽ ranh giới cấp tỉnh ở chế độ tỉnh — đưa vào chú giải để ký hiệu nào có trên bản đồ đều được giải thích
    if (viewMode === "province" && !legendLayerIds.includes("province_boundaries")) {
      legendLayerIds.unshift("province_boundaries");
    }
    const composerEthnicComposition = showPieSelector
      ? (ethnicLegendComposition.length > 0 ? ethnicLegendComposition : withOtherEthnic(wardDanToc).map(item => {
          const info = getDanTocInfo(item.dan_toc);
          return {
            label: ethnicLabelOf(item.dan_toc, info?.ten),
            value: item.ty_le,
            color: info?.mau || ETHNIC_COLORS[item.dan_toc] || ETHNIC_OTHER_COLOR,
          };
        }))
      : [];

    // Chú giải composer dựng lại theo đúng chú giải giao diện chính:
    // cùng thứ tự (chuyên môn → nền địa lý), cùng nhóm con và ký hiệu.
    const buildLegendSections = (): ComposerLegendSection[] => {
      const sections: ComposerLegendSection[] = [];
      // 1. Địa giới (phân cấp nét theo chuẩn)
      if (viewMode === "province" || activeLayers.has("ward_boundaries")) {
        const mainId = viewMode === "province" ? "province_boundaries" : "ward_boundaries";
        const mainStyle = getLayerSymbology(mainId);
        const rows: ComposerLegendRow[] = [{
          type: "line",
          label: viewMode === "province" ? "Ranh giới tỉnh" : "Ranh giới xã/phường",
          color: mainStyle.color, lineWeight: mainStyle.lineWeight, lineDash: mainStyle.dashArray,
        }];
        if (viewMode === "province" && activeLayers.has("ward_boundaries")) {
          const wardStyle = getLayerSymbology("ward_boundaries");
          rows.push({ type: "line", label: "Ranh giới xã/phường (4 tỉnh)", color: wardStyle.color, lineWeight: wardStyle.lineWeight, lineDash: wardStyle.dashArray });
        }
        sections.push({ rows });
      }
      // 2. Mật độ dân số (chế độ xem cấp xã)
      if (viewMode === "ward" && densityLegendEntries.length > 0) {
        sections.push({
          title: "Mật độ dân số (người/km²)",
          rows: densityLegendEntries.map(entry => ({
            type: "swatch", label: entry.label, color: entry.color, fillOpacity: entry.fillOpacity,
            dimmed: entry.present === false,
            dimTitle: entry.present === false ? "Chưa có xã nào ở bậc này" : undefined,
          })),
        });
      }
      // 3. Cơ cấu dân tộc
      const ethnicRowsData = ethnicLegendItems.length > 0
        ? ethnicLegendItems
        : ethnicLegendComposition.map(item => ({ label: item.label, color: item.color }));
      if (ethnicRowsData.length > 0) {
        sections.push({ title: "Cơ cấu dân tộc", rows: ethnicRowsData.map(item => ({ type: "swatch", label: item.label, color: item.color })) });
      }
      // 4. Thủy lợi truyền thống (chỉ nhóm có điểm thật sự nằm trong khung nhìn + vùng chọn)
      if (activeLayers.has("irrigation")) {
        const irrigationInView = ((layersData as any)?.irrigation || []).filter((ir: any) => featureVisible(ir));
        if (irrigationInView.length > 0) {
          const present = new Set(irrigationInView.map((ir: any) => ir.loai));
          const groups = [
            { emoji: "💧", label: "Phai (đập)", ok: present.has("phai") },
            { emoji: "🚿", label: "Mương · Lái (kênh, máng dẫn)", ok: present.has("muong") || present.has("lai") },
            { emoji: "〰️", label: "Lịn (phân phối nước vào ruộng)", ok: present.has("lin") },
            { emoji: "🌀", label: "Cọn (guồng nước)", ok: present.has("con") },
          ];
          const shown = groups.filter(g => g.ok);
          if (shown.length > 0) sections.push({ title: "Thủy lợi truyền thống", rows: shown.map(g => ({ type: "emoji", label: g.label, emoji: g.emoji })) });
          else sections.push({ rows: [{ type: "emoji", label: "Thủy lợi", emoji: "🚿" }] });
        }
      }
      // 5. Phân vùng rừng (chỉ loại có polygon trong khung nhìn + vùng chọn — zoom Sơn La chỉ còn Khu bảo tồn thiên nhiên)
      if (activeLayers.has("forests")) {
        const forestRows = (["vqg", "kbttn", "kbvcq", "rung_dac_dung"] as const)
          .filter(k => ((layersData as any)?.forests || []).some((f: any) => f.loai === k && featureVisible(f)))
          .map(k => ({ type: "forest" as const, label: FOREST_LABELS[k], color: FOREST_COLORS[k] }));
        if (forestRows.length > 0) sections.push({ title: "Phân vùng rừng", rows: forestRows });
      }
      // 6. Mô hình VAC/VACR (chỉ khi có điểm trong khung nhìn + vùng chọn)
      if (activeLayers.has("vac_models") && ((layersData as any)?.vac_models || []).some((v: any) => featureVisible(v))) {
        sections.push({ rows: [{ type: "emoji", label: "VAC/VACR", emoji: "♻️" }] });
      }
      // 7. Cây thuốc quý (chỉ khi có đối tượng trong khung nhìn + vùng chọn)
      if (activeLayers.has("medicinal_plants") && ((layersData as any)?.medicinal_plants || []).some((m: any) => featureVisible(m))) {
        sections.push({ rows: [{ type: "forest", label: "Cây thuốc quý", color: "#e63946" }] });
      }
      // 8. Các lớp tùy chỉnh của người dùng (cùng điều kiện hiển thị như bản đồ chính)
      customLayers.filter(layer => activeLayers.has(layer.id) && ((layersData as any)?.[layer.id] || []).some((f: any) => featureVisible(f))).forEach(layer => {
        sections.push({ rows: [{ type: "custom", label: layer.ten, color: layer.mau, bieu_tuong: layer.bieu_tuong }] });
      });
      // 9. Đối tượng vẽ tay (toạ độ [lat, lng] — đã đổi khi tính bbox)
      if (annotations.some(ann => annotationVisible(ann))) sections.push({ rows: [{ type: "swatch", label: "Đối tượng của tôi", color: "#e9c46a" }] });
      // 10. Hệ thống sông suối — yếu tố nền địa lý, luôn đứng cuối (chỉ khi thật sự có nét trong khung nhìn + vùng chọn)
      if (activeLayers.has("rivers") && ((layersData as any)?.rivers || []).some((r: any) => featureVisible(r))) {
        sections.push({ rows: [{ type: "river", label: "Hệ thống sông suối", osm: true }] });
      }
      return sections;
    };
    const legendSections = buildLegendSections();
```

Nguyên tắc chung của đoạn mã: một ký hiệu chỉ được đưa vào chú giải khi thật sự xuất hiện trên bản đồ — cụ thể là có ít nhất một đối tượng của lớp nằm trong khung nhìn hiện tại và, khi bật chế độ chỉ hiển thị khu vực chọn, nằm trong vùng không bị mặt nạ trắng che. Đây chính là cơ sở để bản đồ xuất bản không bao giờ mang chú giải thừa, một lỗi thường gặp khi chụp bản đồ tĩnh.

**Đoạn mã H.10. Chụp trạng thái bản đồ và đồng bộ sang cửa sổ xuất bản**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 1963–2008.

```tsx
    setComposerSnapshot({
      activeLayers: new Set(activeLayers),
      legendLayerIds,
      layersData,
      selectedProvince,
      selectedWard,
      mapCenter: {
        lat: mapRef.current.getCenter().lat,
        lng: mapRef.current.getCenter().lng,
        zoom: mapRef.current.getZoom(),
      },
      viewportBounds: {
        north: capturedViewportBounds.north,
        south: capturedViewportBounds.south,
        east: capturedViewportBounds.east,
        west: capturedViewportBounds.west,
      },
      annotations,
      layerDisplayAll,
      densityLegend: densityLegendEntries.map(entry => ({ label: entry.label, color: entry.color, fillOpacity: entry.fillOpacity, present: entry.present })),
      ethnicComposition: composerEthnicComposition,
      ethnicLegend: ethnicLegendItems,
      legendSections,
      selectedAreaOnly,
      selectedAreaFade,
      capturedAt: Date.now(),
      image: base64Image,
    });
  } catch (error) {
    console.error("Lỗi khi chụp bản đồ:", error);
    alert("Không thể chụp bản đồ. Hãy thử lại.");
  }

  setSyncPending(false);
  // Nếu trong lúc chụp có thay đổi khác (deps đổi) thì chụp lại để snapshot không bị cũ
  if (syncQueuedRef.current) {
    syncQueuedRef.current = false;
    void syncToComposer();
  }
};

  useEffect(() => {
    if (!showMapComposer) { syncQueuedRef.current = false; return; }
    if (syncPending) { syncQueuedRef.current = true; return; }
    void syncToComposer();
  }, [showMapComposer, activeLayers, activeRaster, selectedProvince, selectedWard?.ma_xa, selectedWardIds, selectedAreaOnly, selectedAreaFade, currentProvinceGeoJson, layerSymbologies, wardOverrides, layersData, annotations, rasterOpacity, pieWardSelection, showPieSelector, customLayers, ethnicOverrides, wardLabelConfig, mapFrameAspect, mapMoveTick]);
```

Snapshot chụp một lần duy nhất (ảnh nền + toàn bộ trạng thái chú giải và ký hiệu) và được hiệu ứng theo dõi danh sách phụ thuộc dài tự động chụp lại khi trạng thái đổi — kể cả trong lúc đang chờ ảnh chụp trước đó (cờ `syncQueuedRef`), để bản đồ trong cửa sổ xuất bản không bao giờ lệch so với bản đồ chính.

**Đoạn mã H.11. Chú giải thích ứng trên giao diện chính**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 2468–2535.

```tsx
  const densityLegendEntries = useMemo(() => {
    if (activeRaster || !activeLayers.has("population_density") || !selectedProvince || !currentProvinceGeoJson) return [];
    const densityStyle = getLayerSymbology("population_density");
    const classes = densityStyle.classes?.length ? densityStyle.classes : DENSITY_LABELS.map((label, index) => ({ label, color: DENSITY_COLORS[index] }));
    const upperBounds = classes.slice(0, -1).map(entry => {
      const match = entry.label.replace(/,/g, ".").match(/(?:<|–|−|-|to)\s*(\d+(?:\.\d+)?)/);
      return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    });
    const features = selectedWard
      ? currentProvinceGeoJson.features.filter(feature => String(feature.properties.ma_xa) === selectedWard.ma_xa)
      : currentProvinceGeoJson.features;
    const present = new Set<number>();
    features.forEach(feature => {
      const value = getDensityValue(feature.properties as unknown as WardProperties);
      const index = upperBounds.findIndex(bound => value < bound);
      present.add(index < 0 ? classes.length - 1 : index);
    });
    // Hiển thị ĐỦ các bậc; bậc chưa có xã nào rơi vào sẽ bị mờ để chú giải luôn liên tục
    return classes.map((entry, index) => ({ ...entry, fillOpacity: densityStyle.fillOpacity, present: present.has(index) }));
  }, [activeRaster, activeLayers, selectedProvince, currentProvinceGeoJson, selectedWard, wardOverrides, layerSymbologies]);
  // Ký hiệu con trong chú giải (nhóm rừng, nhóm thủy lợi) chỉ hiện loại thật sự nằm trong
  // khung nhìn hiện tại — ví dụ zoom tới Sơn La chỉ còn "Khu bảo tồn thiên nhiên".
  // Cập nhật khi pan/zoom (mapMoveTick debounce 450ms) hoặc khi đổi dữ liệu lớp.
  // Khi bật "Chỉ khu vực chọn" phải giao thêm với vùng chọn: khung nhìn sau fitBounds có padding
  // vẫn lọt mép tỉnh bên cạnh (VD kbvcq Mường Phăng) nhưng mặt nạ trắng đã che nó đi.
  const legendRegionBBox = useMemo<GeoBBox | null>(
    () => selectedRegionBBoxOf(currentProvinceGeoJson, selectedAreaOnly, selectedProvince, selectedWardIds),
    [selectedAreaOnly, selectedProvince, currentProvinceGeoJson, selectedWardIds],
  );
  const legendInViewKinds = useMemo(() => {
    const map = mapRef.current;
    if (!map) return null;
    const bounds = map.getBounds();
    const region = legendRegionBBox;
    const forests = new Set<string>();
    const irrigation = new Set<string>();
    let irrigationVisible = 0;
    (layersData?.forests || []).forEach(f => { const bb = coordsBBox(f.coords); if (bboxInView(bb, bounds) && bboxInRegion(bb, region)) forests.add(String(f.loai)); });
    (layersData?.irrigation || []).forEach(ir => {
      if (pointInView(Number(ir.lat), Number(ir.lng), bounds) && latLngInRegion(Number(ir.lat), Number(ir.lng), region)) { irrigation.add(String(ir.loai)); irrigationVisible += 1; }
    });
    return { forests, irrigation, irrigationVisible, bounds, region };
  }, [layersData, mapMoveTick, legendRegionBBox]);
  // Lớp đơn dòng trong chú giải (VAC, cây thuốc, sông, lớp tùy chỉnh): chỉ hiện khi có đối tượng
  // thật sự nằm trên bản đồ (trong khung nhìn và — khi bật mặt nạ — trong vùng chọn).
  const legendFeatureVisible = (feature: unknown): boolean => {
    const k = legendInViewKinds;
    if (!k) return true; // map chưa sẵn sàng — giữ theo bật/tắt, sẽ tự chốt khi map lên
    const anyFeature = feature as { lat?: unknown; lng?: unknown; coords?: unknown; geometry?: unknown } | null | undefined;
    const lat = Number(anyFeature?.lat), lng = Number(anyFeature?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return pointInView(lat, lng, k.bounds) && latLngInRegion(lat, lng, k.region);
    const bbox = coordsBBox(anyFeature?.coords ?? anyFeature?.geometry);
    return bboxInView(bbox, k.bounds) && bboxInRegion(bbox, k.region);
  };
  const legendLayerHasFeature = (id: string): boolean => {
    if (!activeLayers.has(id)) return false;
    if (!legendInViewKinds) return true;
    const features = (layersData as any)?.[id];
    return Array.isArray(features) && features.some(legendFeatureVisible);
  };
  const legendAnnotationsVisible = (): boolean => {
    if (!annotations.length) return false;
    if (!legendInViewKinds) return true;
    return annotations.some(ann => {
      const bbox = annotationBBox(ann.coords);
      return bboxInView(bbox, legendInViewKinds.bounds) && bboxInRegion(bbox, legendInViewKinds.region);
    });
  };
```

Hai nhóm hàm trên giải thích cho hiện tượng được mô tả tại Chương 3: chú giải luôn hiển thị đủ các bậc mật độ dân số nhưng làm mờ bậc chưa có xã nào rơi vào, và tên nhóm con (bốn loại rừng, bốn loại thủy lợi) chỉ xuất hiện khi đúng loại đó có đối tượng trong khung nhìn.

**Đoạn mã H.12. Khung bản đồ theo bố cục QCVN 80 và xuất tệp trong cửa sổ soạn thảo**

*Trích từ* `src/components/MapComposer.tsx`, dòng 100–119 và dòng 1247–1272.

*Phần a — vị trí mặc định các phần tử trên khổ giấy (dòng 100–119):*

```tsx
const makeElement = (type: ElementType, page: PageSize, existing: ComposerElement[]): ComposerElement => {
  const pw = page.width * DPI;
  const ph = page.height * DPI;
  const zIndex = existing.length + 1;
  const defaults: Record<ElementType, Partial<ComposerElement>> = {
    // Khung bản đồ thu về khoảng 2/3 bề ngang để chú giải, thước tỉ lệ đặt NGOÀI khung
    // (theo QCVN 80:2024/BTNMT — bảng chú giải bố trí ngoài phạm vi thể hiện lãnh thổ).
    // Tỉ lệ khung = tỉ lệ khổ giấy (cùng hệ số 0.62 ở 2 chiều): A4 ngang → 1.414, A4 dọc → 0.707.
    mapFrame:   { x: pw*0.05, y: ph*0.08, width: pw*0.62, height: ph*0.62, props: { showGraticule: false, showGraticuleLabels: true, graticuleInterval: 1, graticuleColor: "#4a6fa1", graticuleOpacity: 0.65, graticuleLineStyle: "dashed" } },
    scalebar:   { x: pw*0.05, y: ph*0.87, width: pw*0.25, height: 44,     props: { unit: "km", style: "line" } },
    northArrow: { x: pw*0.88, y: ph*0.88, width: 48,      height: 48,     props: { style: "classic" } },
    legend:     { x: pw*0.70, y: ph*0.10, width: pw*0.25, height: ph*0.55, props: { title: "Chú giải", bgColor: "#ffffff", bgOpacity: 0.92, fontSize: 10, fontFamily: "Arial", titleFontSize: 11, textColor: "#333333" } },
    graticule:  { x: 0,       y: 0,       width: pw,       height: ph,     props: { interval: 1, showLabels: true } },
    title:      { x: pw*0.10, y: ph*0.01, width: pw*0.80, height: 50,     props: { text: "Tiêu đề bản đồ", fontSize: 24, fontFamily: "Arial", textColor: "#111111", align: "center" } },
    chart:      { x: pw*0.05, y: ph*0.55, width: pw*0.25, height: ph*0.25,props: { chartType: "pie", title: "Cơ cấu dân tộc", showPercent: true, chartScale: 1 } },
    image:      { x: pw*0.05, y: ph*0.05, width: 150,     height: 100,    props: { src: "", alt: "Hình ảnh" } },
    textbox:    { x: pw*0.05, y: ph*0.90, width: pw*0.55, height: 40,     props: { text: "Nguồn: Tổng cục Thống kê (TĐTDS&NO 2019) · OpenStreetMap · NASA SRTM", fontSize: 11, fontFamily: "Arial", textColor: "#333333" } },
  };
  return { id: uid(), type, zIndex, locked: false, visible: true, ...defaults[type] } as ComposerElement;
};
```

*Phần b — xuất bản đồ ra tệp JPG/PNG/PDF (dòng 1247–1272):*

```tsx
  const handleExport = async (format: "jpg" | "png" | "pdf") => {
const target = canvasRef.current;    if (!target) return;
    const waitForImages = () => Promise.all(Array.from(target.querySelectorAll("img")).filter(img => !img.complete).map(img => new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    })));
    await waitForImages();
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: format === "png" ? null : "#ffffff" });
    if (format === "jpg") {
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.95));
      await saveBlobWithPicker(blob, `webgis-map-${Date.now()}.jpg`);
      return;
    }
    if (format === "png") {
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/png"));
      await saveBlobWithPicker(blob, `webgis-map-${Date.now()}.png`);
      return;
    }
    const pdf = new jsPDF({ orientation: pageSize.width > pageSize.height ? "landscape" : "portrait", unit: "mm", format: [pageSize.width, pageSize.height] });
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output("blob");
    await saveBlobWithPicker(pdfBlob, `webgis-map-${Date.now()}.pdf`);
  };
```

**Đoạn mã H.13. Đọc tệp GeoJSON và hàm tải tệp xuống máy**

*Trích từ* `src/utils/geoUtils.ts`, dòng 30–83 và dòng 354–363.

*Phần a — chuyển đổi GeoJSON sang định dạng nội bộ, hỗ trợ đủ các kiểu hình học (dòng 30–83):*

```ts
export function parseGeoJSON(text: string, fallbackName?: string): ParsedLayer | null {
  let json: any;
  try { json = JSON.parse(text); } catch { return null; }

  const rawFeatures: any[] = json.type === "FeatureCollection" ? (json.features || [])
    : json.type === "Feature" ? [json]
    : json.type && json.coordinates ? [{ type: "Feature", properties: {}, geometry: json }]
    : [];

  if (rawFeatures.length === 0) return null;

  const out: InternalFeature[] = [];
  let geomType: GeomType | null = null;

  for (const f of rawFeatures) {
    if (!f.geometry) continue;
    const props = f.properties || {};
    const ten = pickName(props);
    const mo_ta = pickDesc(props);
    const g = f.geometry;
    const t = g.type;

    if (t === "Point") {
      const [lng, lat] = g.coordinates;
      if (typeof lat !== "number" || typeof lng !== "number") continue;
      out.push({ ten, mo_ta, lat, lng, ...props });
      geomType = geomType ?? "point";
    } else if (t === "MultiPoint") {
      for (const [lng, lat] of g.coordinates) {
        out.push({ ten, mo_ta, lat, lng, ...props });
      }
      geomType = geomType ?? "point";
    } else if (t === "LineString") {
      out.push({ ten, mo_ta, coords: g.coordinates, ...props });
      geomType = geomType ?? "line";
    } else if (t === "MultiLineString") {
      for (const line of g.coordinates) {
        out.push({ ten, mo_ta, coords: line, ...props });
      }
      geomType = geomType ?? "line";
    } else if (t === "Polygon") {
      out.push({ ten, mo_ta, coords: g.coordinates[0], ...props });
      geomType = geomType ?? "polygon";
    } else if (t === "MultiPolygon") {
      for (const poly of g.coordinates) {
        out.push({ ten, mo_ta, coords: poly[0], ...props });
      }
      geomType = geomType ?? "polygon";
    }
  }

  if (out.length === 0 || !geomType) return null;
  return { features: out, geomType, suggestedName: fallbackName };
}
```

*Phần b — hàm tải tệp xuống máy (dòng 354–363):*

```ts
export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
```

**Đoạn mã H.14. Cấu hình dùng chung cho lược đồ mặt cắt và nông lịch theo dân tộc**

*Trích từ* `src/components/ethnicConfig.ts`, dòng 1–54 (toàn file).

```ts
// Cấu hình dùng chung cho lược đồ mặt cắt & nông lịch theo từng dân tộc
// Đặt tại: src/components/ethnicConfig.ts

import type { CSSProperties } from "react";

export type EthnicKey = "thai" | "mong" | "muong";

export const ETHNIC_KEYS: EthnicKey[] = ["thai", "mong", "muong"];

export const ETHNIC_META: Record<EthnicKey, { ten: string; mau: string }> = {
  thai:  { ten: "Thái",  mau: "#2d6a4f" },
  mong:  { ten: "Mông",  mau: "#b5179e" },
  muong: { ten: "Mường", mau: "#e76f51" },
};

/** id dân tộc trong dan_toc.json → EthnicKey (trả về null nếu dân tộc chưa có lược đồ/nông lịch riêng) */
export const toEthnicKey = (id?: string | null): EthnicKey | null =>
  id === "thai" || id === "mong" || id === "muong" ? id : null;

/** Thanh tab chọn dân tộc dùng chung cho 2 modal */
export const ethnicTabStyle = (active: boolean, color: string): CSSProperties => ({
  padding: "6px 14px",
  borderRadius: 999,
  border: `1.5px solid ${color}`,
  background: active ? color : "transparent",
  color: active ? "#fff" : color,
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
});

export interface SourceRef { text: string; url: string; }

/** Nguồn đã dùng để rà soát lược đồ mặt cắt */
export const TRANSECT_SOURCES: SourceRef[] = [
  { text: "Tạp chí Dân tộc học — tri thức dân gian của người Thái (mương, phai, lái, lìn)", url: "https://vjol.info.vn/tapchiviendantochoc/article/download/128504/105394/" },
  { text: "Đại học Tây Bắc — Bảo vệ rừng của người Thái tỉnh Sơn La", url: "https://fss.utb.edu.vn/wp-content/uploads/2021/06/1-1.pdf" },
  { text: "Tạp chí Dân tộc học — phân bố cư trú theo địa hình của các dân tộc miền núi phía Bắc", url: "https://vjol.info.vn/tapchiviendantochoc/article/download/125785/103240/" },
  { text: "Báo Pháp luật — thảo quả mọc ở độ cao trên 1.000 m, dưới tán rừng", url: "https://baophapluat.vn/nho-huong-vi-to-ho-cua-nui-rung-tay-bac-post383414.html" },
];
export const TRANSECT_NOTE = "Lược đồ mang tính minh họa về xu hướng cư trú và sinh kế theo đai độ cao, không phải số liệu đo đạc. Các khoảng độ cao (mét) trong bản cũ không có nguồn nên đã được bỏ.";

/** Nguồn đã dùng để rà soát nông lịch */
export const CALENDAR_SOURCES: SourceRef[] = [
  { text: "Báo Nông nghiệp & Môi trường — Lai Châu: vệ sinh đồng, nạo vét mương từ đầu tháng 1, lịch gieo cấy lúa", url: "https://nongnghiepmoitruong.vn/lai-chau-dieu-chinh-lich-gieo-cay-linh-hoat-tranh-ret-dam-ret-hai-d796188.html" },
  { text: "Báo Nông nghiệp & Môi trường — Nông dân Sơn La hối hả sản xuất vụ xuân", url: "https://nongnghiepmoitruong.vn/nong-dan-son-la-hoi-ha-san-xuat-vu-xuan-d798748.html" },
  { text: "Báo Lào Cai — Hoàn thành cấy lúa xuân trong tháng 3", url: "https://baolaocai.vn/hoan-thanh-cay-lua-xuan-trong-thang-3-post764609.html" },
  { text: "Báo Văn hóa — Xên bản, xên mường ở Pắc Ngà", url: "https://baovanhoa.vn/dan-toc-ton-giao/xen-ban-xen-muong-phong-tuc-doc-dao-cua-nguoi-thai-o-pac-nga-208745.html" },
  { text: "Báo Pháp luật — Mùa hoa ban, lễ hội Mùa hoa ban Sơn La", url: "https://baophapluat.vn/chuoi-su-kien-se-dien-ra-tai-le-hoi-mua-hoa-ban-o-son-la-post468771.html" },
  { text: "Viet Nam News — Mông ethnic people celebrate new year", url: "https://vietnamnews.vn/life-style/570458/mong-ethnic-people-celebrate-new-year.html" },
  { text: "Báo Văn hóa — Lễ hội Gầu Tào là Di sản văn hóa phi vật thể quốc gia", url: "https://baovanhoa.vn/van-hoa/le-hoi-gau-tao-la-di-san-van-hoa-phi-vat-the-quoc-gia-cua-nguoi-mong-o-yen-bai-101859.html" },
  { text: "Báo Pháp luật — thảo quả ra quả vào mùa đông, khoảng tháng 11–12", url: "https://baophapluat.vn/nho-huong-vi-to-ho-cua-nui-rung-tay-bac-post383414.html" },
];
export const CALENDAR_NOTE = "Mục có dấu ✓ đã có nguồn tham khảo (rê chuột để xem); mục có dấu ⚠ chưa có nguồn xác minh — cần đối chiếu với cộng đồng hoặc cơ quan chuyên môn. Lễ hội âm lịch dịch chuyển theo năm trong khoảng 1 tháng dương lịch.";
```

Cấu hình này là minh họa cho nguyên tắc mọi nội dung tri thức bản địa hiển thị trên hệ thống đều gắn với danh sách nguồn rà soát tương ứng (bốn nguồn cho lược đồ mặt cắt, tám nguồn cho nông lịch) kèm ghi chú cảnh báo mức độ xác minh, đúng theo quy ước trạng thái nguồn đã nêu ở Đoạn mã H.2.

## Phụ lục I — Mã lệnh phân tích SPSS/PSPP và kết quả đầu ra

Phân tích thống kê cho bộ dữ liệu khảo sát thực địa 65 phiếu (Phụ lục E) được thực hiện bằng phần mềm PSPP — bộ chương trình phân tích thống kê theo chuẩn mở, tương thích cú pháp SPSS — chạy ở chế độ batch để kết quả có thể tái lập hoàn toàn bằng một lệnh duy nhất:

`pspp phan_tich_65.sps -o ket_qua.html --syntax-encoding=UTF-8 -b`

Trong đó, tệp `phan_tich_65.sps` chứa toàn bộ lệnh phân tích (trích nguyên văn tại Đoạn mã I.1), tệp `ket_qua.html` là output do PSPP sinh ra. Để tiện trích xuất số liệu vào báo cáo, output HTML được chuyển thành văn bản thuần túy bằng script `html2txt.mjs`, cho ra tệp `ket_qua.txt` — các bảng từ I.2 đến I.5 dưới đây đều được trích trực tiếp từ bản văn bản này và giữ nguyên định dạng số của PSPP (dấu thập phân là dấu chấm).

**Bảng I.1. Tệp dữ liệu và tệp kết quả của bước phân tích thống kê**

| Tệp | Dạng | Nội dung |
|---|---|---|
| `khao_sat_sonla_65.csv` | CSV (UTF-8) | Dữ liệu 65 phiếu khảo sát đã mã hóa số; dòng tiêu đề và 65 dòng dữ liệu, trích từ bộ phiếu nhập liệu tại Phụ lục E |
| `phan_tich_65.sps` | Syntax SPSS/PSPP | Toàn bộ lệnh phân tích (Đoạn mã I.1) |
| `ket_qua.html` | HTML | Output do PSPP sinh ra khi chạy batch |
| `ket_qua.txt` | Text | Bản chuyển từ `ket_qua.html` bằng script `html2txt.mjs`; dùng để trích các Bảng I.2–I.5 |
| `khao_sat_65_clean.sav` | SPSS system file | Tệp dữ liệu đã lưu sau phân tích (lệnh `SAVE OUTFILE`) |

**Đoạn mã I.1. Toàn bộ syntax phân tích — tệp `phan_tich_65.sps`, dòng 1–132**

```spss
* Phân tích SPSS thật — 65 phiếu khảo sát tri thức bản địa Sơn La (Phù Yên cũ).
* Nguồn dữ liệu: khao_sat_sonla_65.csv (trích từ Nhap_lieu_phieu_khao_sat_TTBD_SonLa.xlsx).
* Chạy batch: pspp phan_tich_65.sps -o ket_qua.html --syntax-encoding=UTF-8 -b

GET DATA /TYPE=TXT
  /FILE='khao_sat_sonla_65.csv'
  /ARRANGEMENT=DELIMITED
  /FIRSTCASE=2
  /DELIMITERS=','
  /QUALIFIER='"'
  /DELCASE=LINE
  /VARIABLES=
  MAPHIEU A20
  GIOITINH F1 NAMSINH F4 DANTOC F1 NAMSONG F1 TRINHDO F1 THUNHAP F1
  THAMGIA_DAT F1 NGUNG_NAM F4 LYDO_NGUNG F1 DAT6 F1
  NUOC22 F1 NUOC5 F1 NUOC7 F1
  RUNG1 F1 RUNG2 F1 RUNG3 F1 RUNG41 F1 RUNG51 F1 RUNG7 F1
  BD3 F1 BD5 F1
  DAT2_bonphan F1 DAT2_phanchuong F1 DAT2_vatnuoi F1 DAT2_checover F1 DAT2_luancanh F1
  DAT2_ruongbat F1 DAT2_dongmuc F1 DAT2_nghialand F1 DAT2_khongcaitao F1 DAT2_khac F1
  DAT3_trithuc F1 DAT3_nhanNuoc F1 DAT3_tuHoc F1 DAT3_hocDanToc F1 DAT3_chuaUNG F1 DAT3_khac F1
  DAT4_bonphan F1 DAT4_phanchuong F1 DAT4_vatnuoi F1 DAT4_checover F1 DAT4_luancanh F1
  DAT4_ruongbat F1 DAT4_dongmuc F1 DAT4_nghialand F1 DAT4_khongcaitao F1 DAT4_khac F1
  DAT5_khongGhichep F1 DAT5_LopTre F1 DAT5_NguoiGia F1 DAT5_PhanBonHoa F1 DAT5_khac F1
  NUOC1_thuongnguon F1 NUOC1_hamnguon F1 NUOC1_mo F1 NUOC1_songsuoi F1 NUOC1_ngum F1 NUOC1_mua F1 NUOC1_khac F1
  NUOC21_tttn F1 NUOC21_tlTruyenThong F1 NUOC21_tlHienDai F1 NUOC21_khac F1
  NUOC23_ngaycong F1 NUOC23_tusua F1 NUOC23_tuantra F1 NUOC23_trongcay F1 NUOC23_nghiLy F1 NUOC23_khongco F1 NUOC23_khac F1
  NUOC3_nhaNuoc F1 NUOC3_huongUoc F1 NUOC3_LuatTuc F1 NUOC3_khac F1
  NUOC4_dauNguon F1 NUOC4_congDong F1 NUOC4_phanChia F1 NUOC4_taiSD F1 NUOC4_khong F1 NUOC4_khac F1
  NUOC6_phuThuoc F1 NUOC6_BDKH F1 NUOC6_yLi F1 NUOC6_BienDong F1 NUOC6_khac F1
  RUNG6_truyenMieng F1 RUNG6_LopTre F1 RUNG6_NguoiGia F1 RUNG6_NhaTruong F1 RUNG6_khac F1
  BD1_giay F1 BD1_app F1 BD1_sodo F1 BD1_chuabiet F1 BD1_khac F1
  BD2_hientriatDat F1 BD2_diahinh F1 BD2_songsuoi F1 BD2_hanhChinh F1 BD2_giaoThong F1
  BD2_danCu F1 BD2_nongLich F1 BD2_quyDinh F1 BD2_khac F1
  BD4_truongBan F1 BD4_canBo F1 BD4_nghienCuu F1 BD4_hoGiaDinh F1.
DATASET NAME t WINDOW=FRONT.

VARIABLE LABELS
  MAPHIEU 'Ma phieu'
  GIOITINH 'Gioi tinh'
  NAMSINH 'Nam sinh'
  DANTOC 'Dan toc'
  NAMSONG 'So nam sinh song tai dia phuong'
  TRINHDO 'Trinh do hoc van'
  THUNHAP 'Hoat dong tao thu nhap chinh'
  THAMGIA_DAT 'C1.1 Tham gia quan ly dat'
  NGUNG_NAM 'C1.3 So nam ngung su dung dat'
  LYDO_NGUNG 'C1.4 Ly do ngung su dung dat'
  DAT6 'C6 muc do can so hoa DAT'
  NUOC22 'C2.2 Tan suat su dung TL truyen thong'
  NUOC5 'C5 Tan suat bao ve nuoc'
  NUOC7 'C7 muc do can so hoa NUOC'
  RUNG1 'C1 Phan loai rung theo phong tuc'
  RUNG2 'C2 Ghi huong uoc'
  RUNG3 'C3 Trung giao khoan vs rung thieng'
  RUNG41 'C4.1 Thu hai san pham rung'
  RUNG51 'C5.1 Giup cay rung tu phuc hoi'
  RUNG7 'C7 muc do can so hoa RUNG'
  BD3 'C3 Hinh thuc ban do mong muon'
  BD5 'C5 Muc do san sang su dung ban do'.

VALUE LABELS
  /GIOITINH 1 'Nam' 2 'Nu'
  /DANTOC 1 'Thai' 2 'Mong' 3 'Muong'
  /NAMSONG 1 'Duoi 5 nam' 2 '5-15 nam' 3 'Tren 15 nam'
  /TRINHDO 1 'Chua qua dao tao' 2 'Tieu hoc' 3 'THCS' 4 'THPT' 5 'Trung cap/Cao dang/Dai hoc tro len'
  /THUNHAP 1 'Nong nghiep' 2 'Chan nuoi' 3 'Lam nghiep' 4 'Cong nhan/vien chuc Nha nuoc' 5 'Khac' 6 'Dich vu' 7 'Tieu thu cong nghiep'
  /THAMGIA_DAT 1 'Dang tham gia thuong xuyen' 2 'Da tung tham gia nhung hien da ngung'
  /LYDO_NGUNG 1 'Thieu nhan luc' 2 'Chuyen doi muc dich theo quy hoach' 3 'Dat bac mau xoi mon nang' 4 'Khac'
  /DAT6 1 'Binh thuong' 2 'Can thiet' 3 'Rat can thiet'
  /NUOC22 1 'Thuong xuyen' 2 'Rat hiem khi' 3 'Thinh thoang' 4 'It khi' 5 'Rat thuong xuyen'
  /NUOC5 1 'Thinh thoang' 2 'Thuong xuyen' 3 'Khong bao gio' 4 'Luon luon' 5 'Hiep khi'
  /NUOC7 1 'Hoan toan khong can thiet' 2 'Binh thuong' 3 'Can thiet' 4 'Rat can thiet'
  /RUNG1 TO RUNG51 1 'Co' 2 'Khong'
  /RUNG7 1 'Hoan toan khong can thiet' 2 'Khong can thiet' 3 'Binh thuong' 4 'Can thiet' 5 'Rat can thiet'
  /BD3 1 'Ban do giay treo NVB' 2 'Ca hai' 3 'Khong co nhu cau' 4 'App/website dien thoai'
  /BD5 1 'San sang dung thuong xuyen' 2 'Dung khi can' 3 'Khong co nhu cau'.

FREQUENCIES VARIABLES=GIOITINH DANTOC NAMSONG TRINHDO THUNHAP
  THAMGIA_DAT LYDO_NGUNG DAT6
  NUOC22 NUOC5 NUOC7
  RUNG1 RUNG2 RUNG3 RUNG41 RUNG51 RUNG7
  BD3 BD5
  /ORDER=ANALYSIS.

DESCRIPTIVES VARIABLES=NGUNG_NAM DAT6 NUOC7 RUNG7
  /STATISTICS=MEAN STDDEV MIN MAX.

* Multiple response sets (chon nhieu) — ty le tinh tren 65 phieu.
MRSETS
  /MDGROUP NAME=$DAT2 VARIABLES=DAT2_bonphan DAT2_phanchuong DAT2_vatnuoi DAT2_checover DAT2_luancanh DAT2_ruongbat DAT2_dongmuc DAT2_nghialand DAT2_khongcaitao DAT2_khac VALUE=1 LABEL='C2 Cach quan ly dat'
  /MDGROUP NAME=$DAT3 VARIABLES=DAT3_trithuc DAT3_nhanNuoc DAT3_tuHoc DAT3_hocDanToc DAT3_chuaUNG DAT3_khac VALUE=1 LABEL='C3 Nguon bien phap dat'
  /MDGROUP NAME=$DAT4 VARIABLES=DAT4_bonphan DAT4_phanchuong DAT4_vatnuoi DAT4_checover DAT4_luancanh DAT4_ruongbat DAT4_dongmuc DAT4_nghialand DAT4_khongcaitao DAT4_khac VALUE=1 LABEL='C4 Bien phap hieu qua nhat'
  /MDGROUP NAME=$DAT5 VARIABLES=DAT5_khongGhichep DAT5_LopTre DAT5_NguoiGia DAT5_PhanBonHoa DAT5_khac VALUE=1 LABEL='C5 Nguyen hien tai mai mot dat'
  /MDGROUP NAME=$NUOC1 VARIABLES=NUOC1_thuongnguon NUOC1_hamnguon NUOC1_mo NUOC1_songsuoi NUOC1_ngum NUOC1_mua NUOC1_khac VALUE=1 LABEL='C1 Nguon nuoc'
  /MDGROUP NAME=$NUOC21 VARIABLES=NUOC21_tttn NUOC21_tlTruyenThong NUOC21_tlHienDai NUOC21_khac VALUE=1 LABEL='C2.1 Cach khai thac nuoc'
  /MDGROUP NAME=$NUOC23 VARIABLES=NUOC23_ngaycong NUOC23_tusua NUOC23_tuantra NUOC23_trongcay NUOC23_nghiLy NUOC23_khongco NUOC23_khac VALUE=1 LABEL='C2.3 Bao ve TL truyen thong'
  /MDGROUP NAME=$NUOC3 VARIABLES=NUOC3_nhaNuoc NUOC3_huongUoc NUOC3_LuatTuc NUOC3_khac VALUE=1 LABEL='C3 Hinh thuc quy dinh nuoc'
  /MDGROUP NAME=$NUOC4 VARIABLES=NUOC4_dauNguon NUOC4_congDong NUOC4_phanChia NUOC4_taiSD NUOC4_khong NUOC4_khac VALUE=1 LABEL='C4 Bien phap cong dong nuoc'
  /MDGROUP NAME=$NUOC6 VARIABLES=NUOC6_phuThuoc NUOC6_BDKH NUOC6_yLi NUOC6_BienDong NUOC6_khac VALUE=1 LABEL='C6 Nguyen hien tai mai mot nuoc'
  /MDGROUP NAME=$RUNG6 VARIABLES=RUNG6_truyenMieng RUNG6_LopTre RUNG6_NguoiGia RUNG6_NhaTruong RUNG6_khac VALUE=1 LABEL='C6 Nguyen hien tai mai mot rung'
  /MDGROUP NAME=$BD1 VARIABLES=BD1_giay BD1_app BD1_sodo BD1_chuabiet BD1_khac VALUE=1 LABEL='C1 Loai ban do da biet'
  /MDGROUP NAME=$BD2 VARIABLES=BD2_hientriatDat BD2_diahinh BD2_songsuoi BD2_hanhChinh BD2_giaoThong BD2_danCu BD2_nongLich BD2_quyDinh BD2_khac VALUE=1 LABEL='C2 Thong tin tren ban do'
  /MDGROUP NAME=$BD4 VARIABLES=BD4_truongBan BD4_canBo BD4_nghienCuu BD4_hoGiaDinh VALUE=1 LABEL='C4 Ai quan ly ban do'.

CROSSTABS
  /TABLES=DANTOC BY BD3
  /FORMAT=AVALUE TABLES
  /CELLS=COUNT ROW COLUMN EXPECTED
  /COUNT ROUND CELL
  /STATISTICS=CHISQ PHI.

CROSSTABS
  /TABLES=GIOITINH BY DANTOC
  /FORMAT=AVALUE TABLES
  /CELLS=COUNT ROW COLUMN
  /STATISTICS=CHISQ.

CROSSTABS
  /TABLES=DANTOC BY RUNG3
  /FORMAT=AVALUE TABLES
  /CELLS=COUNT ROW COLUMN
  /STATISTICS=CHISQ.

EXAMINE VARIABLES=NGUNG_NAM
  /PLOT=NONE
  /STATISTICS=DESCRIPTIVES
  /MISSING=LISTWISE
  /NOTOTAL.

SAVE OUTFILE='khao_sat_65_clean.sav'
  /COMPRESSED.
```

Cấu trúc syntax phản ánh đúng bảy bước xử lý số liệu đã nêu tại Chương 2: nạp và khai báo biến (GET DATA, VARIABLE LABELS, VALUE LABELS), phân bố tần số (FREQUENCIES), thống kê mô tả (DESCRIPTIVES), xử lý câu trả lời đa lựa chọn bằng nhóm phản hồi đa (MRSETS — 14 nhóm cho 14 câu nhiều lựa chọn), ba phép thử liên hoàn (CROSSTABS), kiểm tra phân bố chuẩn (EXAMINE) và lưu file sạch (SAVE OUTFILE).

**Bảng I.2. Kết quả tần số một số biến nhân khẩu (trích từ output PSPP — đối chiếu Bảng F.1)**

| Biến | Hạng mục | Frequency | Percent | Valid Percent |
|---|---|---|---|---|
| Giới tính | Nam | 39 | 60.0% | 60.0% |
| Giới tính | Nữ | 26 | 40.0% | 40.0% |
| Dân tộc | Thái | 28 | 43.1% | 43.1% |
| Dân tộc | Mông | 9 | 13.8% | 13.8% |
| Dân tộc | Mường | 28 | 43.1% | 43.1% |
| Số năm sinh sống tại địa phương | Dưới 5 năm | 3 | 4.6% | 4.8% |
| Số năm sinh sống tại địa phương | 5–15 năm | 15 | 23.1% | 23.8% |
| Số năm sinh sống tại địa phương | Trên 15 năm | 45 | 69.2% | 71.4% |
| Số năm sinh sống tại địa phương | (thiếu giá trị) | 2 | 3.1% | — |

**Bảng I.3. Kết quả ba phép thử Chi-square (trích từ output PSPP — đối chiếu Bảng F.4)**

| Phép thử | Pearson Chi-Square | df | Asymp. Sig. (2-sided) | N of Valid Cases |
|---|---|---|---|---|
| Dân tộc × Hình thức bản đồ mong muốn (BD3) | 37.51 | 6 | .000 | 61 |
| Giới tính × Dân tộc | 2.57 | 2 | .277 | 65 |
| Dân tộc × Trung giao khoán với rừng thiêng (RUNG3) | 3.00 | 2 | .223 | 65 |

**Bảng I.4. Biện độ liên kết của phép thử Dân tộc × BD3 (Symmetric Measures — trích từ output PSPP)**

| Hệ đo | Value |
|---|---|
| Phi | .78 |
| Cramer's V | .55 |

**Bảng I.5. Bảng chéo Dân tộc × Hình thức bản đồ mong muốn — số đếm và % hàng (trích từ output PSPP — đối chiếu Bảng F.7)**

| Dân tộc | Bản đồ giấy treo NVB | Ca hai | Không có nhu cầu | App/website điện thoại | Tổng hàng |
|---|---|---|---|---|---|
| Thái | 0 (0.0%) | 23 (85.2%) | 2 (7.4%) | 2 (7.4%) | 27 (100.0%) |
| Mông | 5 (83.3%) | 1 (16.7%) | 0 (0.0%) | 0 (0.0%) | 6 (100.0%) |
| Mường | 2 (7.1%) | 22 (78.6%) | 0 (0.0%) | 4 (14.3%) | 28 (100.0%) |
| Tổng | 7 | 46 | 2 | 6 | 61 |

Số liệu của các bảng trên được PSPP báo cáo ở dạng rút gọn hai chữ số thập phân (ví dụ Pearson Chi-Square = 37.51, Cramer's V = .55); trong phần kết quả thống kê của báo cáo, các giá trị này được làm tròn và diễn đạt theo quy ước dấu phẩy thập phân của tiếng Việt (χ² = 37,511; df = 6; p < 0,001; V = 0,546). Phép thử đầu tiên cho thấy mối liên hệ ở mức mạnh giữa dân tộc và hình thức bản đồ người dân mong muốn (p < 0,001), trong khi hai phép thử còn lại không có ý nghĩa thống kê ở mức 0,05 — đúng như kết luận tại Chương 3.

**Ghi chú tái lập:** để chạy lại toàn bộ phân tích, cần cài đặt PSPP, đặt các tệp `phan_tich_65.sps` và `khao_sat_sonla_65.csv` trong cùng một thư mục rồi thực thi lệnh nêu ở đầu phụ lục; output thu được sẽ trùng khớp với các bảng trích ở trên.
