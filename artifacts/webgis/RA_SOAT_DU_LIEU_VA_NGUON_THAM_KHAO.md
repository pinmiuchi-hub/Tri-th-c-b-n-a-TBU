# Rà soát dữ liệu WebGIS Tây Bắc và danh mục tài liệu tham khảo

Ngày rà soát: 14/10/2026. Phạm vi: `dan_toc.json`, `layers.json`, lược đồ mặt cắt, nông lịch, số liệu trong giao diện.

## 1. Kết luận ngắn

- **Đã đối chiếu được với nguồn chính thống:** số dân 12 dân tộc thiểu số (Tổng điều tra dân số 2019, bản gốc của Tổng cục Thống kê đã mở và đọc trực tiếp). Phát hiện **1 số liệu sai**: người Mảng ghi 3.700 (số liệu cũ) → đúng 2019 là **4.650**.
- **Đã sửa theo nguồn:** thời gian Tết Mông, Gầu Tào, Xên bản, thảo quả; cách gọi vụ lúa ("vụ chiêm" → "vụ xuân" theo cách gọi của Sơn La, Lai Châu, Lào Cai); mô tả địa bàn các dân tộc; mô tả hệ thống thủy lợi người Thái (là mương – phai – lái – lìn, không phải ruộng bậc thang); nhóm ngôn ngữ người Mường (Việt–Mường, không phải Môn–Khmer); bỏ khẳng định sai "hát Then – Sli – Lượn được UNESCO công nhận" ở mô tả người Tày.
- **Phần lớn dữ liệu điểm trong `layers.json` KHÔNG có nguồn** (bản làng, rừng, thủy lợi, mô hình VAC, vùng luật tục, cây thuốc). Đã bỏ các con số cụ thể không có căn cứ (diện tích, tuổi, thu nhập, bán kính, số lượng) và gắn nhãn `trang_thai` hiển thị ngay trong popup. **Không nên dùng các lớp này làm căn cứ pháp lý hoặc nghiên cứu cho đến khi xác minh thực địa.**
- **Mô tả "tri thức" của từng dân tộc** (mục `tri_thuc`, tri thức bản địa mặc định) chưa có tài liệu đính kèm trừ những mục ghi cụ thể bên dưới. Đã gắn nhãn `chua_xac_minh`.

## 2. Giới hạn của lần rà soát này (cần đọc)

- Trong các nguồn dưới đây, **chỉ tài liệu của Tổng cục Thống kê được mở và đọc toàn văn**. Các nguồn còn lại tôi chỉ đọc được phần trích trong kết quả tìm kiếm. Trước khi trích dẫn trong báo cáo/bài viết, bạn nên mở toàn văn từng nguồn để kiểm tra lại.
- Tôi **không có cách xác minh tọa độ, tên bản, diện tích** của các điểm trong `layers.json`. Việc này cần dữ liệu thực địa, dữ liệu kiểm kê rừng/đất đai của địa phương, hoặc khảo sát cùng cộng đồng.
- Các đoạn văn bạn dán (về lớp phủ bản đồ, khía cạnh tri thức bản địa) đã bị mất ký hiệu trích dẫn khi sao chép, nên tôi **không biết nguồn gốc**. Nếu chúng được tạo từ công cụ tổng hợp tài liệu (ví dụ NotebookLM), hãy lấy lại danh sách tài liệu gốc từ công cụ đó và gửi cho tôi để đối chiếu và ghi nguồn đúng.
- Nông lịch: chỉ các mục có dấu ✓ trong giao diện đã có nguồn. Các mục còn lại (trồng ngô, thu hoạch lúa, thu hái cây thuốc, đánh cá, chè Shan tuyết…) **chưa có nguồn** và hiển thị dấu ⚠.
- Lược đồ mặt cắt: các khoảng độ cao (mét) ban đầu không có nguồn nên đã bỏ. Hướng phân bố chung (người Thái ở thung lũng, người Mông ở vùng cao hơn) phù hợp các nguồn nhưng vẫn là mô tả định tính. Phần người Mường chỉ là bộ khung khởi tạo.

## 3. Chi tiết các thay đổi

### 3.1. `dan_toc.json`

| Dân tộc | Trường | Giá trị cũ | Giá trị mới |
|---|---|---|---|
| thai | mo_ta | Dân tộc Thái là một trong những dân tộc lớn nhất vùng Tây Bắc, sinh sống chủ yếu ở các thung lũng và vùng núi thấp ven sông suối. Người Thái có nền văn hóa phong phú với … | Dân tộc Thái là một trong những dân tộc đông dân nhất vùng Tây Bắc (địa bàn sống chủ yếu: Sơn La, Nghệ An, Thanh Hóa), cư trú ở các thung lũng ven sông suối, trồng lúa nư… |
| thai | tri_thuc:Nông nghiệp | …làm ruộng bậc thang… | …làm ruộng lúa nước… |
| thai | tri_thuc:Lễ hội | Hoa Ban (Xên Đông) tháng 2–3 âm lịch | mùa hoa ban nở, khoảng tháng 2–3 dương lịch |
| mong | mo_ta | Người Mông sinh sống chủ yếu trên các đỉnh núi cao từ 800–1500m, nổi tiếng với sức bền, ý chí và tinh thần cộng đồng mạnh mẽ. Họ có kỹ thuật canh tác nương rẫy độc đáo tr… | Người Mông sinh sống chủ yếu ở vùng núi cao (địa bàn sống chủ yếu: Hà Giang, Điện Biên, Sơn La). Họ có kỹ thuật canh tác nương rẫy trên đất dốc và các nghề thủ công như r… |
| mong | tri_thuc:Lễ hội | Nào Pê Chầu tháng 11–12 âm lịch | cuối tháng 11–đầu tháng 12 âm lịch |
| muong | ngon_ngu | Ngữ hệ Nam Á (nhánh Môn-Khmer) | Ngữ hệ Nam Á (nhóm Việt–Mường) |
| muong | mo_ta | Người Mường có quan hệ gần gũi với người Kinh, sinh sống ở vùng trung du và núi thấp. Họ có nền văn hóa dân gian phong phú với hệ thống sử thi Đẻ Đất Đẻ Nước, cồng chiêng… | Người Mường có quan hệ gần gũi với người Kinh về ngôn ngữ (nhóm Việt–Mường), địa bàn sống chủ yếu: Hòa Bình, Thanh Hóa, Phú Thọ; ở Sơn La có số dân đáng kể. Văn hóa Mường… |
| dao | mo_ta | Người Dao sinh sống ở độ cao trung bình 700–1200m, có nhiều ngành khác nhau (Dao Đỏ, Dao Tiền, Dao Quần Chẹt…). Họ nổi tiếng với nghề thuốc nam gia truyền, chữ Nôm Dao và… | Người Dao có nhiều ngành khác nhau (Dao Đỏ, Dao Tiền, Dao Quần Chẹt…), địa bàn sống chủ yếu: Hà Giang, Tuyên Quang, Lào Cai. Họ nổi tiếng với nghề thuốc nam gia truyền, c… |
| kho_mu | mo_ta | Người Khơ Mú (còn gọi Xá Cẩu, Mứn Xen) sinh sống ở các thung lũng và sườn núi thuộc Sơn La, Điện Biên, Nghệ An. Họ có truyền thống săn bắt, hái lượm và chế tác công cụ từ… | Người Khơ Mú (còn gọi Xá Cẩu, Mứn Xen) sinh sống ở các thung lũng và sườn núi thuộc Nghệ An, Điện Biên, Sơn La. Họ có truyền thống săn bắt, hái lượm và chế tác công cụ từ… |
| la_hu | mo_ta | Người La Hủ là dân tộc thiểu số rất ít người, sinh sống tập trung ở huyện Mường Tè, tỉnh Lai Châu. Họ có lối sống du canh du cư truyền thống trên các vùng núi cao, đang t… | Người La Hủ là dân tộc rất ít người (12.113 người năm 2019), cư trú chủ yếu ở tỉnh Lai Châu, vùng núi cao. Trước đây có lối sống du canh du cư, nay đang trong quá trình đ… |
| lu | mo_ta | Người Lự (còn gọi Lự Đen, Phu Lự) sinh sống ở huyện Tam Đường, Sìn Hồ tỉnh Lai Châu. Họ có quan hệ gần với người Thái Lự ở Vân Nam (Trung Quốc) và Lào, duy trì nền văn hó… | Người Lự (còn gọi Lự Đen, Phù Lự) sinh sống chủ yếu ở tỉnh Lai Châu. Họ có quan hệ gần với người Thái Lự ở Vân Nam (Trung Quốc) và Lào, theo Phật giáo Nam Tông. |
| mang | dan_so_ca_nuoc | 3700 | 4650 |
| mang | mo_ta | Người Mảng là dân tộc rất ít người, cư trú ở huyện Mường Tè và Nậm Nhùn, tỉnh Lai Châu. Họ có hệ thống tri thức sinh tồn độc đáo thích nghi với rừng núi nguyên sinh và đa… | Người Mảng là dân tộc rất ít người (4.650 người năm 2019), cư trú chủ yếu ở tỉnh Lai Châu. |
| tay | mo_ta | Người Tày là dân tộc thiểu số đông thứ hai cả nước, sinh sống tập trung ở các thung lũng và vùng đồi thấp Đông-Tây Bắc (Lào Cai, Yên Bái, Hà Giang, Tuyên Quang). Văn hóa … | Người Tày là dân tộc thiểu số đông dân nhất cả nước (1.845.492 người năm 2019), cư trú ở các thung lũng Đông Bắc (địa bàn sống chủ yếu: Lạng Sơn, Cao Bằng, Tuyên Quang) v… |
| ha_nhi | mo_ta | Người Hà Nhì sinh sống ở vùng cao biên giới Lào Cai (Y Tý, A Lù, Bát Xát) và Lai Châu (Mường Tè), độ cao 1.500–2.000m. Nổi tiếng với nhà trình tường đất kỳ lạ giữa biển m… | Người Hà Nhì sinh sống ở vùng cao biên giới Lào Cai (Y Tý, A Lù, Bát Xát) và Lai Châu (Mường Tè) (địa bàn sống chủ yếu: Lai Châu, Lào Cai, Điện Biên). Nổi tiếng với nhà t… |
| nung | mo_ta | Người Nùng tập trung ở Đông Bắc (Lạng Sơn, Cao Bằng) và rải rác Tây Bắc (Lào Cai – Mường Khương, Bắc Hà, Bảo Yên). Văn hóa gần gũi người Tày nhưng có chữ Nôm Nùng riêng. … | Người Nùng tập trung ở Đông Bắc (Lạng Sơn, Cao Bằng) và rải rác Tây Bắc (Lào Cai – Mường Khương, Bắc Hà, Bảo Yên). Văn hóa gần gũi người Tày. Nổi tiếng với nghề rèn nông … |

Tất cả bản ghi đã thêm: `nam_dan_so`, `nguon`, `ghi_chu_nguon`, `trang_thai_tri_thuc`. Số dân Kinh (82.085.826) chưa đối chiếu được với nguồn gốc (nguồn thứ cấp ghi sơ bộ 82.085.729), cần kiểm tra lại trên cổng của Tổng cục Thống kê.

### 3.2. `layers.json`

Quy ước `trang_thai`: `minh_hoa` = dữ liệu minh họa không có nguồn; `chua_xac_minh` = chưa có nguồn đính kèm (có thể có thật nhưng chưa kiểm chứng); `mot_phan` = một phần có nguồn.

| Lớp | Mã | Nội dung cũ | Nội dung mới |
|---|---|---|---|
| irrigation | ir2 | Kênh tưới chính dẫn nước từ suối Nậm Pàn phục vụ 850ha lúa nước | Kênh tưới chính dẫn nước từ suối Nậm Pàn phục vụ lúa nước |
| irrigation | ir3 | Đập đá truyền thống người Thái Đen xây dựng từ thế kỷ 19 | Đập đá truyền thống người Thái Đen |
| villages | v1 | Bản Thái Đen lâu đời, có trên 150 nóc nhà sàn truyền thống, nổi tiếng với nghề dệt thổ cẩm | Bản Thái Đen lâu đời, có nhà sàn truyền thống, nổi tiếng với nghề dệt thổ cẩm |
| villages | v2 | Bản Mông trên độ cao 1.200m, canh tác ngô đá và nuôi ong rừng | Bản Mông vùng núi cao, canh tác ngô đá và nuôi ong rừng |
| villages | v4 | Bản Thái lớn với hệ thống thủy lợi mương-phai hoàn chỉnh, 3 vụ lúa/năm | Bản Thái lớn với hệ thống thủy lợi mương-phai hoàn chỉnh |
| villages | v6 | Bản La Hủ xa xôi nhất tỉnh Lai Châu, đang định canh định cư từ năm 2015 | Bản La Hủ xa xôi nhất tỉnh Lai Châu, đang trong quá trình định canh định cư |
| villages | v10 | Bản Mông trồng thảo quả dưới tán rừng già, thu nhập cao | Bản Mông trồng thảo quả dưới tán rừng già |
| villages | ban_y_ty | Bản Hà Nhì giữa biển mây Y Tý, nhà trình tường đất 100 năm tuổi, ruộng bậc thang Thề Pả tuyệt đẹp. | Bản Hà Nhì giữa biển mây Y Tý, nhà trình tường đất, ruộng bậc thang Thề Pả tuyệt đẹp. |
| villages | ban_lien | Bản Tày Bắc Hà, sở hữu rừng chè Shan Tuyết cổ thụ 200–500 năm tuổi và nghề làm chè hữu cơ. | Bản Tày Bắc Hà, sở hữu rừng chè Shan Tuyết cổ thụ và nghề làm chè hữu cơ. |
| forests | f1 | Khu rừng cấm do bản Thái quản lý 200 năm qua. Cấm chặt cây, săn thú, bảo vệ đầu nguồn | Khu rừng cấm do bản Thái quản lý lâu đời. Cấm chặt cây, săn thú, bảo vệ đầu nguồn |
| forests | f3 | Rừng bảo vệ nguồn nước suối Nậm Giải cấp cho 5 bản hạ lưu. Luật tục cấm khai thác gỗ | Rừng bảo vệ nguồn nước suối Nậm Giải cấp nước cho các bản hạ lưu. Luật tục cấm khai thác gỗ |
| forests | f4 | Rừng thảo quả dưới tán cây gỗ lớn, diện tích 120ha. Thu hoạch tháng 9-11 hàng năm | Rừng thảo quả dưới tán cây gỗ lớn. Thu hoạch tháng 9-11 hàng năm |
| forests | rung_che_ban_lien | Rừng chè cổ thụ 200–500 tuổi của người Tày Bản Liền (Bắc Hà), được công nhận chè hữu cơ chuẩn châu Âu. | Rừng chè cổ thụ của người Tày Bản Liền (Bắc Hà), được công nhận chè hữu cơ chuẩn châu Âu. |
| vac_models | vac1 | Kết hợp: 0.5ha vườn cây ăn quả + ao cá 1.500m² + chuồng lợn đen + 2ha rừng keo. Thu nhập 85 triệu/năm | Kết hợp vườn cây ăn quả + ao cá + chuồng lợn đen + rừng keo |
| vac_models | vac2 | Mô hình VAC quy mô lớn: vườn chuối, sắn xen canh + ao cá chép + đàn vịt 500 con | Mô hình VAC quy mô lớn: vườn chuối, sắn xen canh + ao cá chép + đàn vịt |
| customary_zones | cz2 | Khu bảo vệ đầu nguồn suối Chiềng Yên. Cộng đồng Thái cấm chặt cây trong bán kính 500m từ mó nước | Khu bảo vệ đầu nguồn suối Chiềng Yên. Cộng đồng Thái cấm chặt cây quanh mó nước |
| customary_zones | cz3 | Quy ước bản: chỉ khai thác gỗ vào tháng 12-2 âm lịch, mỗi nhà tối đa 2 cây/năm | Quy ước bản về thời điểm và số lượng khai thác gỗ |
| customary_zones | cz4 | Khu nương rẫy luân canh 5-7 năm của người Mông. Bỏ hoang để phục hồi đất tự nhiên | Khu nương rẫy luân canh nhiều năm của người Mông. Bỏ hoang để phục hồi đất tự nhiên |
| customary_zones | luat_tuc_muong_khuong | Hệ thống luân canh nương rẫy 5–7 năm của người Mông – đất bỏ hoang được phục hồi tự nhiên trước khi canh tác lại. | Hệ thống luân canh nương rẫy nhiều năm của người Mông – đất bỏ hoang được phục hồi tự nhiên trước khi canh tác lại. |
| forests | rung_hoang_lien | Vườn Quốc gia 28.500 ha bao quanh đỉnh Fansipan – đa dạng sinh học cao nhất Đông Dương, nguồn dược liệu quý. | Vườn Quốc gia bao quanh đỉnh Fansipan, nguồn nước đầu nguồn quan trọng của vùng. |
| forests | rung_dau_nguon_van_ban | Khu Bảo tồn thiên nhiên Hoàng Liên – Văn Bàn 25.000ha, bảo vệ các loài quý hiếm như vọoc, gấu ngựa. | Khu Bảo tồn thiên nhiên Hoàng Liên – Văn Bàn, bảo vệ các loài thú quý hiếm. |
| medicinal_plants | mp1 | tình trạng: Nguy cấp | Chưa xác minh |
| medicinal_plants | mp2 | tình trạng: Sắp nguy cấp | Chưa xác minh |
| medicinal_plants | mp3 | tình trạng: Bảo tồn tốt | Chưa xác minh |
| medicinal_plants | mp4 | tình trạng: Bình thường | Chưa xác minh |
| medicinal_plants | mp5 | tình trạng: Sắp nguy cấp | Chưa xác minh |
| medicinal_plants | mp6 | tình trạng: Bảo tồn tốt | Chưa xác minh |
| medicinal_plants | cay_tam_that_bac_ha | tình trạng: Cần bảo tồn | Chưa xác minh |
| medicinal_plants | cay_atiso_sa_pa | tình trạng: Phổ biến (trồng quy mô) | Chưa xác minh |
| medicinal_plants | cay_la_tam_dao_do | tình trạng: Đặc sản OCOP | Chưa xác minh |
| medicinal_plants | cay_do_trong_bat_xat | tình trạng: Bảo tồn nghiêm ngặt | Chưa xác minh |
| medicinal_plants | cay_dang_sam_y_ty | tình trạng: Quý hiếm | Chưa xác minh |
| forests | f4 | Rừng thảo quả dưới tán cây gỗ lớn. Thu hoạch tháng 9-11 hàng năm | Rừng thảo quả dưới tán cây gỗ lớn. Thảo quả thường thu hoạch vào khoảng tháng 11–12 hàng năm |
| forests | rung_thao_qua_bat_xat | Rừng thảo quả tự nhiên dưới tán rừng già Bát Xát – nguồn thu chủ yếu của người Mông – Hà Nhì vùng cao. | Rừng thảo quả dưới tán rừng ở Bát Xát — huyện có diện tích thảo quả lớn nhất tỉnh Lào Cai theo số liệu Báo Lào Cai. |

Tình trạng bảo tồn của các cây thuốc (Nguy cấp, Quý hiếm…) ban đầu không có nguồn (ví dụ danh lục đỏ, Sách đỏ Việt Nam) nên đã đặt "Chưa xác minh"; giá trị cũ giữ trong trường `tinh_trang_goc_chua_xac_minh`. Sông suối: hình học lấy từ OpenStreetMap theo README dự án, tên địa phương chưa xác minh (`mot_phan`).

### 3.3. Nông lịch và lược đồ mặt cắt

| Mục | Cũ | Mới | Nguồn |
|---|---|---|---|
| Tết Mông (Nào Pê Chầu) | tháng 11–12 dương lịch | tháng 12–1 (cuối tháng 11 đến đầu tháng 12 âm lịch) | [6],[7] |
| Lễ Gầu Tào | tháng 1–2 | tháng 2–3 (mùng 1–rằm tháng Giêng âm lịch) | [8] |
| Xên bản, Xên mường | tháng 1–3 | tháng 2–3 | [4],[5] |
| Thu hoạch thảo quả | tháng 9–11 | tháng 11–12 | [10],[11] |
| Gieo mạ, cấy lúa "vụ chiêm" | tháng 2–4 | "vụ xuân", tháng 2–3 | [2],[3] |
| Tu sửa mương-phai | tháng 1–2 | giữ nguyên, đã có nguồn | [1] |
| Khoảng độ cao trong lược đồ | >1500 m, 900–1500 m, 500–900 m, 200–500 m, <200 m | bỏ số liệu, dùng tên đai định tính | không có nguồn cho các mốc cũ |
| Người Mường | không có | bộ khung khởi tạo, có cảnh báo trong modal | chưa có nguồn |

Ghi chú: [số] là số thứ tự trong danh mục nguồn ở mục 4. Lễ hội âm lịch dịch chuyển theo năm trong khoảng một tháng dương lịch.

## 4. Danh mục tài liệu đã sử dụng

Mức độ tin cậy: **A** = tài liệu thống kê/cơ quan nhà nước; **B** = tạp chí khoa học, tài liệu học thuật; **C** = báo chí chính thống; **D** = nguồn thứ cấp/thương mại, chỉ dùng để đối chiếu.

| # | Mức | Tài liệu | Dùng cho | Đã đọc |
|---|---|---|---|---|
| 1 | C | Báo Nông nghiệp và Môi trường, "Lai Châu điều chỉnh lịch gieo cấy linh hoạt tránh rét đậm rét hại" — https://nongnghiepmoitruong.vn/lai-chau-dieu-chinh-lich-gieo-cay-linh-hoat-tranh-ret-dam-ret-hai-d796188.html | Vệ sinh đồng, nạo vét mương đầu tháng 1 | Trích đoạn |
| 2 | C | Báo Nông nghiệp và Môi trường, "Nông dân Sơn La hối hả sản xuất vụ xuân" — https://nongnghiepmoitruong.vn/nong-dan-son-la-hoi-ha-san-xuat-vu-xuan-d798748.html | Gieo cấy lúa xuân sau Tết | Trích đoạn |
| 3 | C | Báo Lào Cai, "Hoàn thành cấy lúa xuân trong tháng 3" — https://baolaocai.vn/hoan-thanh-cay-lua-xuan-trong-thang-3-post764609.html | Lịch cấy lúa xuân | Trích đoạn |
| 4 | C | Báo Văn hóa, "Xên bản, xên mường — phong tục độc đáo của người Thái ở Pắc Ngà" — https://baovanhoa.vn/dan-toc-ton-giao/xen-ban-xen-muong-phong-tuc-doc-dao-cua-nguoi-thai-o-pac-nga-208745.html | Thời gian Xên bản, Xên mường | Trích đoạn |
| 5 | C | Báo Pháp luật, "Chuỗi sự kiện sẽ diễn ra tại Lễ hội Mùa hoa ban ở Sơn La" — https://baophapluat.vn/chuoi-su-kien-se-dien-ra-tai-le-hoi-mua-hoa-ban-o-son-la-post468771.html; VOV, "Đặc sắc lễ hội Xên Mường của người Thái đen Sơn La" — https://vov.vn/van-hoa/dac-sac-le-hoi-xen-muong-cua-nguoi-thai-den-son-la-post1161419.vov | Hoa ban, Xên mường tháng 2–3 | Trích đoạn |
| 6 | C | Viet Nam News, "Mông ethnic people celebrate new year" — https://vietnamnews.vn/life-style/570458/mong-ethnic-people-celebrate-new-year.html | Thời gian Tết Mông | Trích đoạn |
| 7 | C | Báo Nhân Dân/SGGP, "Đón Tết trên non cao" — https://www.sggp.org.vn/don-tet-tren-non-cao-post583099.html; VnExpress, "Tết sớm của người Mông ở Mộc Châu" — https://vnexpress.net/tet-som-cua-nguoi-mong-o-moc-chau-2931695.html | Đối chiếu Tết Mông | Chỉ thấy trong kết quả tìm kiếm |
| 8 | C | Báo Văn hóa, "Lễ hội Gầu Tào là di sản văn hóa phi vật thể quốc gia của người Mông ở Yên Bái" — https://baovanhoa.vn/van-hoa/le-hoi-gau-tao-la-di-san-van-hoa-phi-vat-the-quoc-gia-cua-nguoi-mong-o-yen-bai-101859.html | Gầu Tào, thời gian tổ chức | Trích đoạn |
| 9 | C | Báo Lào Cai, "Bài 1: Thảo quả — cây làm giàu của nhiều gia đình" — https://baolaocai.vn/bai-1-thao-qua-cay-lam-giau-cua-nhieu-gia-dinh-post9491.html | Thảo quả dưới tán rừng; diện tích theo huyện | Trích đoạn |
| 10 | C | Báo Pháp luật, "Nhớ hương vị tò ho của núi rừng Tây Bắc" — https://baophapluat.vn/nho-huong-vi-to-ho-cua-nui-rung-tay-bac-post383414.html | Thảo quả: độ cao >1.000 m, quả chín khoảng tháng 11–12 | Trích đoạn |
| 11 | D | Pharmacity, "Thảo quả" — https://www.pharmacity.vn/thao-qua.htm | Chỉ đối chiếu mùa thu hái (11–12) | Trích đoạn |
| 12 | B | Phùng Như Giang và cộng sự, Tạp chí Khoa học Lâm nghiệp số 4/2023, "Kết quả chọn cây trội thảo quả tại Yên Bái và Lào Cai" — https://vafs.gov.vn/vn/wp-content/uploads/sites/2/2023/09/Bai-4.-Phung-Nhue-Giang.pdf | Lào Cai, Yên Bái là vùng trồng thảo quả lớn | Trích đoạn |
| 13 | A | Tổng cục Thống kê (2020), Đặc trưng cơ bản của 53 dân tộc thiểu số năm 2019 — https://www.nso.gov.vn/wp-content/uploads/2020/07/Dac-trung-53-dan-toc-thieu-so-2019_ban-in.pdf | Số dân, địa bàn sống chủ yếu của các dân tộc | **Toàn văn** |
| 14 | B | Tạp chí Dân tộc học, bài về tri thức dân gian người Thái — https://vjol.info.vn/tapchiviendantochoc/article/download/128504/105394/ | Hệ thống mương, phai, lái, lìn | Trích đoạn |
| 15 | B | Digital Library of the Commons, Indiana University — https://dlc.dlib.indiana.edu/dlc/handle/10535/560 | Hệ thống muang-fai của người Thái Đen ở Yên Châu, Sơn La | Trích đoạn |
| 16 | B | Trường Đại học Tây Bắc, "Bảo vệ rừng của người Thái tỉnh Sơn La" — https://fss.utb.edu.vn/wp-content/uploads/2021/06/1-1.pdf | Các loại rừng theo tập quán Thái (rừng ma, rừng cấm, rừng cúng) | Trích đoạn (một phần bị lỗi chữ) |
| 17 | B | Tạp chí Dân tộc học (Viện Dân tộc học) — https://vjol.info.vn/tapchiviendantochoc/article/download/125785/103240/; Tạp chí Khoa học ĐH Sư phạm TP.HCM — https://journal.hcmue.edu.vn/index.php/hcmuejos/article/download/810/801 | Xu hướng cư trú theo địa hình (Thái ở thung lũng, Mông cao hơn) | Chỉ thấy trong kết quả tìm kiếm |
| 18 | D | Wikipedia, "Muong people" — https://en.wikipedia.org/wiki/Muong_people | Nhóm ngôn ngữ Việt–Mường, sử thi (chỉ đối chiếu) | Trích đoạn |
| 19 | D | Thư viện Pháp luật, "Dân tộc thiểu số là gì? Danh sách các dân tộc thiểu số ở Việt Nam" — https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/43986/dan-toc-thieu-so-la-gi-danh-sach-cac-dan-toc-thieu-so-o-viet-nam | Số liệu sơ bộ người Kinh | Trích đoạn |

## 5. Tài liệu chính thống nên lấy tiếp để hoàn thiện

1. ~~Kết quả toàn bộ Tổng điều tra dân số và nhà ở 2019 cho `DEFAULT_STATS`~~ — **Đã đối chiếu 15/10/2026**, xem mục 6.
2. Ủy ban Dân tộc / Viện Dân tộc học, bộ sách "Các dân tộc ở Việt Nam" (tập Nam Á, Tày–Thái, Mông–Dao) làm cơ sở cho các mục mô tả và `tri_thuc`.
3. Bảo tàng Dân tộc học Việt Nam: hồ sơ lễ hội và tín ngưỡng của Thái, Mông, Mường (Hoa Ban, Xên bản, Gầu Tào, Nào Pê Chầu).
4. Dữ liệu kiểm kê rừng, quy hoạch sử dụng đất của UBND tỉnh Sơn La/Điện Biên/Lai Châu/Lào Cai và Bộ Nông nghiệp và Môi trường (diện tích rừng, thảo quả, thủy lợi); Sách đỏ Việt Nam / Danh lục đỏ IUCN cho tình trạng bảo tồn cây thuốc.
5. Lịch thời vụ chính thức của Sở Nông nghiệp và Môi trường từng tỉnh theo năm.
6. Khảo sát thực địa có sự tham gia của già làng, trưởng bản (để có tọa độ và tên địa phương xác thực, kèm sự đồng ý của cộng đồng đối với các thông tin nhạy cảm như vị trí cây thuốc quý).

## 6. Cập nhật 15/10/2026 — đối chiếu thống kê tỉnh & ghi nguồn

### 6.1. `DEFAULT_STATS` đã đối chiếu nguồn chính thống

| Tỉnh | Diện tích | Dân số | Đơn vị | Nguồn |
|---|---|---|---|---|
| Sơn La | 14.174 km² | 1.248.415 (2019) → hiển thị "1,25M" | 75 | TĐTDS&NO 01/4/2019 (Tổng cục Thống kê); đơn vị theo QĐ 19/2025/QĐ-TTg |
| Điện Biên | 9.541 km² | 598.856 (2019) → "599K" | 45 | TĐTDS&NO 2019; đơn vị sau sắp xếp 2025 |
| Lai Châu | 9.069 km² | 460.196 (2019) → "460K" | 38 | TĐTDS&NO 2019; đơn vị sau sắp xếp 2025 |
| Lào Cai (mới) | 13.257 km² | 1.778.785 (2025) → "1,78M" | 99 | NQ 202/2025/QH15 (sáp nhập với Yên Bái, hiệu lực 01/7/2025); dân số theo GSO 2025 |

- **Đã sửa**: dân số Lào Cai cũ ghi 770K (sai — TĐTDS&NO 2019 là 730.420). Vì dữ liệu ranh giới `xa_laocai.geojson` là **tỉnh Lào Cai mới** (gồm địa bàn Yên Bái cũ, 99 đơn vị, `ma_tinh = "15"`), thống kê đã cập nhật theo tỉnh mới thay vì gắn nhãn "cũ".
- Giao diện hiển thị dòng nguồn ngay dưới khối thống kê tỉnh (`STATS_SOURCE_NOTE`).
- **Lưu ý snapshot hành chính**: toàn bộ app dùng cấu trúc đơn vị hành chính **sau sắp xếp 01/7/2025** (Sơn La 75, Điện Biên 45, Lai Châu 38, Lào Cai 99). Dân số là số liệu điều tra gần nhất.

### 6.2. Ghi nguồn hiển thị trong app

- Chú giải raster chuyên đề: thêm dòng "Nguồn: …" lấy từ `raster/meta.json` (`source`) — elevation/aspect = NASA SRTM (Open-Meteo); nhiệt lượng, lượng mưa, đất = **mô hình ước lượng, không phải quan trắc trực tiếp**.
- Chú giải "Hệ thống sông suối": ghi nguồn **OpenStreetMap (Overpass API)**; lớp rivers đã bật lại trong nhóm Thủy văn.
- Panel bản đồ chuyên đề đã có dòng `Nguồn:` (có sẵn).

### 6.3. Dọn dữ liệu thừa

- Xóa `public/data/gee_catalog.json` (196 KB, không code nào tham chiếu; danh mục GEE không còn dùng).
