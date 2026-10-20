# PHẦN MỞ ĐẦU

## 1. Tính cấp thiết của đề tài

Kinh tế tuần hoàn là định hướng phát triển được xác định trong Chương trình hành động của Chính phủ về tăng cường năng lực tiếp cận công nghiệp hóa, hiện đại hóa lần thứ tư gắn với kinh tế tuần hoàn, kinh tế xanh [3]. Theo đó, việc quản lý tài nguyên thiên nhiên, giảm thất thoát vật chất và khai thác các chuỗi giá trị tuần hoàn đòi hỏi nền tảng dữ liệu không gian tin cậy, có thể truy xuất nguồn gốc và cập nhật theo từng cấp hành chính. Trong bối cảnh chuyển đổi số quốc gia, bản đồ số và hệ thống thông tin địa lý (GIS) trở thành công cụ chủ lực để trực quan hóa tài nguyên, gắn tri thức địa phương với quy hoạch và ra quyết định [17].

Tỉnh Sơn La là địa bàn mang đặc thù tiêu biểu của vùng Tây Bắc Bộ: diện tích 14.174 km², dân số 1.248.415 người theo Tổng điều tra dân số và nhà ở năm 2019 [1], trong đó đồng bào dân tộc thiểu số chiếm 83,74% — thuộc nhóm cao nhất cả nước [1], [2]. Đây là vùng có hệ tài nguyên phong phú (rừng, sông suối, đất nông nghiệp, cây dược liệu) và bề dày tri thức bản địa: hệ thống tưới truyền thống mương–phai–lái–lìn–cọn của người Thái [10], [11]; tập quán quản lý rừng cộng đồng với các loại rừng ma, rừng cấm, rừng cúng [12]; luật tục bảo vệ nguồn nước và rừng thiêng của người Hà Nhì, người Nùng [13]; mô hình kinh tế vườn–ao–chuồng (VAC/VACR) gắn với thảo quả, lợn đen bản địa [20], [21]; vùng dược liệu 16.145 ha năm 2025 [16]; sản phẩm chè Shan tuyết Bản Liền đạt chứng nhận hữu cơ quốc tế và OCOP 5 sao [15]. Những tri thức này vừa là nguồn tài nguyên văn hóa, vừa là nền tảng thực tiễn cho quản lý tài nguyên và phát triển kinh tế tuần hoàn ở địa phương.

Tuy nhiên, tri thức bản địa tại Sơn La hiện tồn tại phân tán trong lời nói, tập quán và tài liệu báo chí, chưa được số hóa thành dữ liệu không gian có kiểm chứng; nhiều nội dung có nguy cơ mất đi cùng quá trình đô thị hóa, sáp nhập đơn vị hành chính và biến đổi khí hậu. Kết quả khảo sát thực địa 65 phiếu tại huyện Phù Yên (cũ) do nhóm nghiên cứu thực hiện [29] đã cung cấp bằng chứng định lượng cho nhận định này: 87,7% người trả lời cho biết biện pháp quản lý, cải tạo đất canh tác xuất phát từ tri thức truyền thống và luật tục nhưng “không có ghi chép, bản đồ, tài liệu”; 78,5% nêu nguyên nhân mai mốt là lớp trẻ đi làm ăn xa; 73,8% lo ngại người già mất đi chưa kịp truyền lại. Tương tự, với nguồn nước, 81,5% người trả lời cảnh báo nguy cơ mai mốt tri thức quản lý nước cộng đồng do phụ thuộc vào công trình thủy lợi hiện đại [29]. Những con số này cho thấy việc ghi chép, số hóa và bản đồ hóa tri thức bản địa không còn là lựa chọn mà đã trở thành nhiệm vụ cấp bách.

Từ ngày 01/7/2025, bộ máy hành chính được tổ chức lại theo các đơn vị hành chính mới [4]; các chính quyền cấp xã cần công cụ dữ liệu trực quan để quản lý tài nguyên, theo dõi các mô hình kinh tế tuần hoàn và khai thác tri thức bản địa trên địa bàn mình. Cổng dữ liệu mở tỉnh Sơn La [5] đã công bố số liệu địa lý hành chính và dân tộc, nhưng chưa có lớp dữ liệu tri thức bản địa và chuỗi kinh tế tuần hoàn; đồng thời, các yêu cầu về trình bày bản đồ theo QCVN 80:2024/BTNMT [6] đòi hỏi hệ thống bản đồ số phải bảo đảm chuẩn hóa chú giải, ký hiệu và khả năng đối chiếu nguồn. Khảo sát thực địa cũng cho thấy nhu cầu bản đồ là chính đáng và cụ thể: 93,8% người trả lời đã từng biết hoặc sử dụng các loại bản đồ; 75,4% mong muốn sử dụng đồng thời bản đồ giấy treo tại nhà văn hóa bản và ứng dụng tra cứu trên điện thoại; nội dung được ưu tiên hiển thị nhất là hiện trạng sử dụng đất (70,8%), địa hình (61,5%) và phân bố dân cư, dân tộc (49,2%) [29].

Trên cơ sở đó, việc xây dựng nền tảng bản đồ tri thức bản địa — WebGIS tích hợp dữ liệu tài nguyên, luật tục, mô hình VAC/VACR và các chuỗi kinh tế tuần hoàn trên địa bàn tỉnh Sơn La, có cơ chế truy thực nguồn hiển thị cho từng đối tượng dữ liệu, là một yêu cầu cấp thiết cả về khoa học và thực tiễn. Đề tài “Lập bản đồ tri thức bản địa trong quản lý tài nguyên và phát triển kinh tế tuần hoàn trên địa bàn tỉnh Sơn La” ra đời nhằm đáp ứng yêu cầu đó.

## 2. Mục tiêu và nhiệm vụ nghiên cứu của đề tài

### 2.1. Mục tiêu

Mục tiêu tổng thể của đề tài: xây dựng nền tảng WebGIS lập bản đồ tri thức bản địa trên địa bàn tỉnh Sơn La, phục vụ quản lý tài nguyên thiên nhiên và phát triển các chuỗi kinh tế tuần hoàn, bảo đảm dữ liệu có nguồn truy xuất rõ ràng và tuân thủ chuẩn kỹ thuật bản đồ.

Mục tiêu cụ thể:

a) Hệ thống hóa cơ sở lý luận và thực tiễn về lập bản đồ tri thức bản địa trong quản lý tài nguyên và phát triển kinh tế tuần hoàn;

b) Thu thập, kiểm định và số hóa dữ liệu không gian về tài nguyên thiên nhiên, tri thức bản địa (luật tục, thủy lợi truyền thống, nông lịch, bản làng, hồ sơ dân tộc) và các mô hình kinh tế tuần hoàn trên địa bàn tỉnh Sơn La;

c) Khảo sát thực địa tại một huyện tiêu biểu của tỉnh (huyện Phù Yên cũ) nhằm thu thập bằng chứng định lượng về thực trạng quản lý tài nguyên, tình trạng mai mốt tri thức bản địa và nhu cầu bản đồ của đồng bào;

d) Xây dựng hệ thống WebGIS tương tác hiển thị dữ liệu tri thức bản địa theo các đơn vị hành chính, có cơ chế truy thực nguồn và tuân thủ QCVN 80:2024/BTNMT [6];

e) Đánh giá mức độ sẵn sàng của nền tảng dữ liệu phục vụ quản lý tài nguyên và quy hoạch kinh tế tuần hoàn cấp xã, từ đó đề xuất giải pháp và khuyến nghị chính sách.

### 2.2. Nhiệm vụ

a) Nghiên cứu tài liệu, tổng quan tri thức bản địa, GIS và kinh tế tuần hoàn trong nước và quốc tế;

b) Xây dựng bộ dữ liệu nền: ranh giới đơn vị hành chính của tỉnh Sơn La (đặt trong bối cảnh mở rộng vùng Tây Bắc) [4], dữ liệu cơ cấu dân tộc theo đơn vị hành chính [1], [5];

c) Số hóa và kiểm định 7 nhóm lớp tri thức — tài nguyên (sông suối [8], thủy lợi truyền thống, khu bảo tồn [7], mô hình VAC/VACR [20]–[21], vùng dược liệu [16], bản làng tiêu biểu, luật tục — vùng phong tục [13]–[14]) và các lớp raster chuyên đề [24];

d) Thiết kế và thực hiện khảo sát thực địa bằng phiếu hỏi tại huyện Phù Yên (cũ), xử lý thống kê 65 phiếu, làm căn cứ thực chứng cho các kết luận về thực trạng và nhu cầu [29];

e) Xây dựng khung truy thực nguồn hiển thị cho từng đối tượng dữ liệu (phân mức có nguồn / một phần / dự đoán), kiên quyết loại bỏ đối tượng không tra được nguồn;

f) Phát triển hệ thống WebGIS trên nền React [26] và Leaflet [27], kiểm chứng bằng kiểm thử tự động Playwright [28];

g) Đề xuất giải pháp ứng dụng kết quả vào quản lý tài nguyên và phát triển kinh tế tuần hoàn tại địa phương.

## 3. Đối tượng và phạm vi nghiên cứu của đề tài

### 3.1. Đối tượng nghiên cứu

Đối tượng nghiên cứu của đề tài là quá trình lập bản đồ tri thức bản địa phục vụ quản lý tài nguyên thiên nhiên và phát triển kinh tế tuần hoàn; trong đó tập trung vào các thực thể có thể không gian hóa và kiểm chứng được: tri thức bản địa (luật tục, quản lý nước cộng đồng, nông lịch, tri thức canh tác), tài nguyên thiên nhiên (đất, rừng, sông suối, thủy lợi, dược liệu) và các mô hình, chuỗi kinh tế tuần hoàn (VAC/VACR, dược liệu dưới tán, chè Shan tuyết, du lịch cộng đồng) trên địa bàn tỉnh Sơn La.

### 3.2. Phạm vi nghiên cứu

a) Phạm vi không gian: toàn tỉnh Sơn La với 75 xã, phường, thị trấn [4], [5]; đặt trong bối cảnh mở rộng của vùng Tây Bắc (Điện Biên, Lai Châu, Lào Cai) khi cần đối chiếu; điểm khảo sát thực địa chọn tại huyện Phù Yên (cũ) — một huyện có địa hình đồi núi, đồng ruộng và cư dân chủ yếu là người Mường, người Thái [29];

b) Phạm vi thời gian: dữ liệu chủ yếu thu thập trong giai đoạn 2019–2026, với số liệu thống kê nền lấy mốc Tổng điều tra dân số 2019 [1] và số liệu hành chính cập nhật đến kỳ 03/9/2026 [5]; khảo sát thực địa thực hiện trong năm 2026;

c) Phạm vi nội dung: 7 nhóm lớp tri thức — tài nguyên (sông suối, thủy lợi truyền thống, khu bảo tồn, mô hình VAC/VACR, vùng dược liệu, bản làng tiêu biểu, luật tục — vùng phong tục), 5 lớp raster chuyên đề, dữ liệu cơ cấu dân tộc theo đơn vị hành chính và 18 hồ sơ dân tộc; khảo sát thực địa gồm 4 nhóm nội dung: thông tin chung, quản lý đất, quản lý nước, quản lý rừng và nhu cầu bản đồ;

d) Phạm vi sản phẩm: hệ thống WebGIS tra cứu, hiển thị và xuất bản đồ theo chuẩn QCVN 80 [6], kèm bộ dữ liệu nguồn đã kiểm định và bộ số liệu khảo sát thực địa đã xử lý thống kê.

## 4. Cách tiếp cận và phương pháp nghiên cứu

### 4.1. Cách tiếp cận

Tác giả tiếp cận đối tượng nghiên cứu theo các quan điểm chủ yếu sau:

**4.1.1. Quan điểm hệ thống.** Đề tài tiếp cận tri thức bản địa — tài nguyên — kinh tế tuần hoàn như một hệ thống thống nhất: tri thức bản địa điều khiển cách khai thác và bảo vệ tài nguyên (luật tục, quản lý nước cộng đồng), tài nguyên tạo ra các chuỗi giá trị tuần hoàn (VAC/VACR, dược liệu dưới tán), và các chuỗi giá trị đó lại phản hồi ngược vào việc bảo tồn tri thức. Việc lập bản đồ được thực hiện theo logic hệ thống dữ liệu — hiển thị — ra quyết định, trong đó dữ liệu là nền, bản đồ là giao diện, quản lý là đích đến.

**4.1.2. Quan điểm tổng hợp – lãnh thổ.** Mỗi đối tượng dữ liệu được gắn với lãnh thổ hành chính (mã đơn vị hành chính) và lãnh thổ văn hóa (vùng dân tộc, bản làng) tương ứng, cho phép tổng hợp thông tin đa chiều — tự nhiên, kinh tế, văn hóa — trên cùng một không gian địa lý của từng xã, từng huyện và toàn tỉnh.

**4.1.3. Quan điểm lịch sử – viễn cảnh.** Kết quả được đặt trong quá trình hình thành và biến đổi của tri thức bản địa và hệ thống quản lý tài nguyên địa phương: từ các hệ tưới tự ngàn xưa [10]–[11], luật tục [12]–[13] đến các mô hình kinh tế tuần hoàn hiện nay [15], [20]–[21]; đồng thời hướng tới các nhu cầu quản lý trong tương lai của chính quyền cấp xã sau sáp nhập [4], chuyển đổi số tỉnh và chương trình kinh tế tuần hoàn, kinh tế xanh [3].

**4.1.4. Quan điểm phát triển bền vững.** Mọi kết quả số hóa và khuyến nghị đều hướng tới mục tiêu phát triển bền vững: bảo tồn tri thức bản địa và đa dạng sinh học, sử dụng tài nguyên tiết kiệm và hiệu quả, tạo sinh kế tuần hoàn cho cộng đồng dân tộc thiểu số, góp phần hiện thực hóa chương trình kinh tế tuần hoàn, kinh tế xanh của Nhà nước [3].

### 4.2. Phương pháp nghiên cứu

a) **Phương pháp nghiên cứu tài liệu và tổng quan khoa học:** phân tích, tổng hợp tài liệu trong nước và quốc tế về tri thức bản địa, participatory GIS, kinh tế tuần hoàn, WebGIS; xác định khoảng trống nghiên cứu;

b) **Phương pháp thu thập và đối chiếu dữ liệu thứ cấp:** khai thác dữ liệu chính thống — Tổng điều tra dân số 2019 [1], [2], Cổng dữ liệu mở tỉnh Sơn La [5], WDPA [7], OpenStreetMap [8], GADM 4.1 [9], số liệu SRTM và mô hình khí hậu [24], báo chí chính thống và tài liệu khoa học [10]–[23];

c) **Phương pháp khảo sát thực địa (survey research):** thiết kế bộ phiếu hỏi kết hợp câu hỏi lựa chọn một đáp án, nhiều đáp án, thang đo Likert 5 mức và câu hỏi điền tự do; khảo sát tại huyện Phù Yên (cũ) với 65 người trả lời là người Mường, Thái và Mông đang sinh sống, sản xuất tại địa bàn [29]; dữ liệu nhập qua bảng tính Google Sheets có danh mục đáp án thả xuống và công thức thống kê tự động, bảo đảm tính nhất quán khi xử lý;

d) **Phương pháp kiểm định nguồn và truy xuất nguồn (provenance):** xây dựng khung phân mức độ tin cậy dữ liệu (có nguồn / một phần / dự đoán); đối chiếu chéo nhiều nguồn; áp dụng nguyên tắc “không tra được nguồn thì không đưa vào bản đồ”;

e) **Phương pháp phân tích và mô hình hóa không gian (GIS):** xây dựng mô hình dữ liệu không gian (GeoJSON), phân lớp theo 7 nhóm lớp tri thức — tài nguyên, thể hiện ký hiệu theo QCVN 80 [6], xây dựng quy tắc hiển thị chú giải theo khung nhìn và vùng chọn;

f) **Phương pháp nghiên cứu kỹ thuật – phát triển hệ thống:** phát triển web theo kiến trúc React [26] + Leaflet [27], kiểm chứng bằng kiểm thử đầu cuối Playwright [28], quy trình phát triển có kiểm định kép (máy sinh mã — người đối chiếu nguồn);

g) **Phương pháp thống kê mô tả:** tổng hợp, phân tích tần suất và tỷ lệ phần trăm từng đáp án khảo sát [29]; tính điểm trung bình các thang đo 5 mức; trực quan hóa số liệu dân số, cơ cấu dân tộc, diện tích tài nguyên theo đơn vị hành chính (biểu đồ tròn, biểu đồ cột, mật độ dân số).

## 5. Lịch sử nghiên cứu thuộc lĩnh vực của đề tài

Ở phạm vi quốc tế, việc huy động tri thức địa phương tham gia vào khoa học dữ liệu không gian được khởi xướng bởi quan điểm “công dân là cảm biến” (citizens as sensors) của Goodchild [17], mở đường cho participatory GIS (PGIS) và bản đồ cộng đồng. Nhiều nghiên cứu ở Đông Nam Á đã số hóa luật tục, hệ thống tưới truyền thống và tri thức quản lý rừng của cộng đồng dân tộc thiểu số để phục vụ quản lý tài nguyên và bảo tồn văn hóa; các nghiên cứu về tri thức bản địa Việt Nam cũng tập trung ở vùng Tây Bắc với hệ thống tưới muang-fai của người Thái [10], các nghiên cứu đăng trên Tạp chí Dân tộc học về tri thức canh tác và quản lý nước [11].

Trong nước, nhiều công trình và tài liệu đã ghi nhận thực tiễn phong phú tại Sơn La và vùng lân cận: phân loại rừng theo tập quán của người Thái (rừng ma, rừng cấm, rừng cúng) [12]; hệ thống dẫn thủy nhập điền và cọn nước [14], [18]; luật tục và lễ hội gắn với bảo vệ môi trường của người Hà Nhì ở Y Tý, người Mông ở Mường Khương [13]; nông lịch và lễ hội của người Mông (Tết Nào Pê Chầu, lễ hội Gầu Tào) và phong tục Xên bản Xên mường của người Thái [22]–[23]; các mô hình kinh tế tổng hợp VAC/VACR tại Khun Há (Tam Đường, Lai Châu) [20] và bản Tà Lọt (Mộc Châu, Sơn La) [21]; phát triển vùng dược liệu và cây dược liệu dưới tán rừng [16], chọn cây trội thảo quả [19].

Tuy nhiên, các nghiên cứu hiện còn mang tính đơn lẻ theo từng lĩnh vực (dân tộc học, thủy lợi, nông nghiệp, du lịch); phần lớn dừng lại ở mô tả, chưa chuyển hóa thành dữ liệu không gian có kiểm định nguồn và chưa gắn với nhu cầu quản lý của chính quyền cấp xã. Chưa có công trình nào tổng hợp, không gian hóa đồng bộ tri thức bản địa — tài nguyên — kinh tế tuần hoàn trên toàn tỉnh Sơn La thành một nền tảng WebGIS có kiểm định nguồn và tuân thủ chuẩn bản đồ quốc gia. Khoảng trống đó chính là cơ sở khoa học để đề tài thực hiện; đồng thời, khảo sát thực địa tại huyện Phù Yên [29] đã bổ sung bằng chứng hiện trường mà các nghiên cứu thứ cấp chưa cung cấp được.

## 6. Đóng góp của đề tài

a) **Đóng góp về khoa học:** đề xuất và vận hành khung truy thực nguồn hiển thị cho dữ liệu bản đồ tri thức bản địa (phân mức có nguồn / một phần / dự đoán kèm liên kết nguồn); xây dựng quy tắc chú giải thích ứng theo khung nhìn và vùng chọn, bảo đảm tuân thủ QCVN 80 [6];

b) **Đóng góp về dữ liệu:** hình thành bộ dữ liệu không gian đã kiểm định gồm 73 đối tượng thuộc 7 nhóm lớp tri thức — tài nguyên (7 sông suối, 6 công trình thủy lợi truyền thống, 11 rừng và khu bảo tồn [7], 8 mô hình VAC/VACR, 11 vùng dược liệu [16], 25 bản làng tiêu biểu, 5 luật tục — vùng phong tục), dữ liệu cơ cấu dân tộc theo đơn vị hành chính [1], [5] và 18 hồ sơ dân tộc; đồng thời công bố bộ số liệu khảo sát thực địa 65 phiếu tại huyện Phù Yên (cũ) [29] — một trong những khảo sát định lượng đầu tiên về thực trạng quản lý đất — nước — rừng và nhu cầu bản đồ tri thức bản địa của đồng bào dân tộc thiểu số tại Sơn La;

c) **Đóng góp về công cụ:** xây dựng hệ thống WebGIS hoàn chỉnh cho tỉnh Sơn La — hiển thị bản đồ tương tác, tra cứu thông tin theo từng đơn vị hành chính, biểu đồ cơ cấu dân tộc, xuất bản đồ A4/A3 đúng chuẩn trình bày [6]; kết quả khảo sát 75,4% người dân mong muốn dùng đồng thời bản đồ giấy và ứng dụng điện thoại [29] là cơ sở để hệ thống đồng thời hỗ trợ chức năng xuất bản đồ giấy, đáp ứng nhu cầu thực tế tại bản;

d) **Đóng góp về phương pháp:** xác lập quy trình phát triển hệ thống có kiểm định kép và kiểm thử tự động [28], làm mô hình tham khảo cho các dự án WebGIS tri thức bản địa khác;

e) **Đóng góp về thực tiễn:** cung cấp nền tảng dữ liệu và hàm ý chính sách phục vụ quản lý tài nguyên, quy hoạch và phát triển các chuỗi kinh tế tuần hoàn tại các đơn vị hành chính của tỉnh Sơn La; các khuyến nghị được củng cố bằng bằng chứng khảo sát (93,7% người trả lời cho rằng cần thiết số hóa bản đồ về đất; 55,3% về nước; 80,0% về rừng) [29].

## 7. Kết cấu của đề tài

Báo cáo đề tài gồm Phần mở đầu và hai phần chính.

**Phần mở đầu** trình bày tính cấp thiết, mục tiêu và nhiệm vụ, đối tượng và phạm vi, cách tiếp cận và phương pháp, lịch sử nghiên cứu, đóng góp của đề tài và kết cấu báo cáo.

**Phần nội dung** gồm bốn chương: Chương 1 — Cơ sở lý luận và thực tiễn về lập bản đồ tri thức bản địa trong quản lý tài nguyên và phát triển kinh tế tuần hoàn; Chương 2 — Địa bàn, vật liệu, phương pháp nghiên cứu và khảo sát thực địa; Chương 3 — Kết quả lập bản đồ tri thức bản địa và ứng dụng trong quản lý tài nguyên, phát triển kinh tế tuần hoàn; Chương 4 — Giải pháp, hạn chế và khuyến nghị.

**Phần kết luận** tổng hợp kết quả đạt được, hạn chế và khuyến nghị, kèm danh mục tài liệu tham khảo và các phụ lục (bảng trường dữ liệu, danh mục nguồn, kết quả kiểm thử, hướng dẫn vận hành hệ thống, bộ phiếu khảo sát).

---

**Tài liệu tham khảo trích trong phần này (ngoài danh mục dùng chung):**

[29] Nhóm nghiên cứu (2026). *Bộ phiếu hỏi và dữ liệu khảo sát thực địa tại huyện Phù Yên (cũ), tỉnh Sơn La — Lập bản đồ tri thức bản địa trong quản lý tài nguyên và phát triển kinh tế tuần hoàn*. Dữ liệu tính toán trên Google Sheets, chưa công bố.
