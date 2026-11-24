# WebGIS Tây Bắc — Mã nguồn

Hệ thống thông tin địa lý & tri thức bản địa vùng Tây Bắc Việt Nam (Sơn La, Điện Biên, Lai Châu, Lào Cai).

## Yêu cầu hệ thống

- **Node.js** ≥ 20.x — https://nodejs.org
- **pnpm** ≥ 9.x — cài bằng lệnh: `npm install -g pnpm`

## Cài đặt và chạy

Sau khi giải nén, mở terminal trong thư mục `webgis/` và chạy:

```bash
# 1) Cài đặt thư viện
pnpm install

# 2) Chạy ở chế độ phát triển (dev server) — bắt buộc đặt PORT và BASE_PATH
PORT=5173 BASE_PATH=/ pnpm dev
# → mở trình duyệt tại http://localhost:5173

# 3) Build bản production
PORT=5173 BASE_PATH=/ pnpm build
# → kết quả nằm trong thư mục dist/

# 4) Xem thử bản production đã build
PORT=5173 BASE_PATH=/ pnpm serve
```

## Cấu trúc thư mục

```
webgis/
├── public/
│   └── data/                    # Dữ liệu địa lý (GeoJSON, JSON)
│       ├── tinh.geojson         # Ranh giới tỉnh
│       ├── xa_sonla.geojson     # Ranh giới xã Sơn La
│       ├── xa_dienbien.geojson  # Ranh giới xã Điện Biên
│       ├── xa_laichau.geojson   # Ranh giới xã Lai Châu
│       ├── xa_laocai.geojson    # Ranh giới xã Lào Cai (tỉnh mới, gồm Yên Bái)
│       ├── layers.json          # Sông suối, thủy lợi, mô hình VAC, ...
│       ├── dan_toc.json         # Thông tin các dân tộc, gồm tri thức Thái ở Phù Yên
│       └── phu_yen_layers.json  # Điểm đại diện có tọa độ xác minh cấp xã Phù Yên
├── src/
│   ├── pages/
│   │   └── WebGIS goc.tsx       # Trang chính (hiển thị bản đồ)
│   ├── components/              # Các component (Modal, Editor, ...)
│   ├── utils/
│   │   ├── geoUtils.ts          # Xuất KML / GeoJSON, parse import
│   │   └── imageUtils.ts        # Xử lý ảnh, tạo badge PNG
│   └── index.css                # Toàn bộ styling
├── index.html
├── vite.config.ts
└── package.json
```

## Tính năng chính

- Bản đồ tương tác với 4 lớp nền: **OpenStreetMap**, **Vệ tinh không mây (Sentinel-2/EOX)**, **Vệ tinh (Esri)**, **Địa hình (OpenTopoMap)**
- Hiển thị ranh giới tỉnh/xã của Tây Bắc, có thể click để xem chi tiết
- 7 lớp dữ liệu: Sông suối chính, Thủy lợi, **Phân vùng rừng (polygon)**, Mô hình VAC, **Khu vực cây thuốc quý (polygon)**, Mật độ dân số, Ranh giới xã — riêng **Bản làng tiêu biểu (25)** và **Luật tục cộng đồng (5)** hiển thị văn bản theo từng xã trong panel "Thông tin địa bàn" (vòng 3, tất cả đã có nguồn)
- Vòng 4: panel "Lớp bản đồ" hiển thị **dạng phẳng, không phân nhóm** (bỏ tiêu đề nhóm + nút quản lý nhóm + dòng "Tri thức & văn hóa bản địa"); dữ liệu minh họa cũ còn sót trong localStorage bị tự động bỏ khi nạp; panel "Thông tin địa bàn" không còn khối "Ước tính — cần đối chiếu"
- Biên tập tại chỗ: thêm/sửa/xóa đối tượng, chọn vị trí trên bản đồ (điểm) hoặc vẽ vùng/polygon
- Tải ảnh tùy chỉnh cho biểu tượng lớp
- Xuất từng lớp ra **KML** (Google Earth) hoặc **GeoJSON** (giữ nguyên màu sắc & biểu tượng)
- Nhập dữ liệu CSV cho xã & dân tộc
- Mặt cắt sinh thái (transect), Lịch nông vụ, Thư viện tri thức bản địa
- Hồ sơ ảnh & tài liệu PDF cho từng dân tộc và xã
- **Chế độ 3D kiểu Google Earth** (MapLibre GL): địa hình thật từ DEM (AWS Terrain Tiles · SRTM/ETOPO), xoay/nghiêng/bay quanh, làm nổi địa hình chỉnh sửa được, nền vệ tinh/đường phố và ranh giới tỉnh/xã phủ lên địa hình — mở từ nhóm "Địa hình" trong panel "Bản đồ chuyên đề"

## Triển khai (Deploy)

Sau khi `pnpm build`, thư mục `dist/` chứa file tĩnh có thể deploy lên bất kỳ web host nào (Netlify, Vercel, Nginx, Apache, GitHub Pages, ...).

### GitHub Pages (tự động)

- Push lên nhánh `main`, `agents/density-map-integration-with-pie-charts` hoặc `ra-soat-tri-thuc-rev12` → workflow `.github/workflows/deploy-pages.yml` tự build (`pnpm --filter "@workspace/webgis" build`) và deploy lên Pages.
- Site chạy ở `https://pinmiuchi-hub.github.io/Tri-th-c-b-n-a-TBU/` với `BASE_PATH=/Tri-th-c-b-n-a-TBU/` (đã cấu hình sẵn trong workflow; `.nojekyll` tự thêm).
- Cần bật Pages: repo → Settings → Pages → Source = **GitHub Actions**.
- Nếu thiếu secrets Supabase, site vẫn deploy bình thường — chỉ là tắt đồng bộ cloud (chạy local-only).

### Tự động lưu (localStorage + đồng bộ Supabase)

- **Mỗi máy**: mọi thay đổi ở editor (thêm/sửa/xóa đối tượng, đổi tên nhóm/lớp…) tự ghi vào `localStorage` của trình duyệt ngay lập tức; tải lại trang là dữ liệu còn nguyên (khớp `knowledgeDataRev=12` mới khôi phục). Giới hạn ~5MB — hết quota sẽ có toast cảnh báo.
- **Đồng bộ giữa các máy** (cùng dữ liệu trên cloud):
  1. Tạo project Supabase → SQL Editor → chạy 1 lần file `supabase/setup.sql` (tạo bảng `webgis_state`, bật RLS cho phép anon đọc/ghi, seed 1 dòng `global`).
  2. Lấy Project URL + anon key (Dashboard → Project Settings → API) và đặt thành 2 **repository secrets**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (Settings → Secrets and variables → Actions) → push lại để Pages build với sync bật.
  3. Dev local: copy `.env.example` → `.env` rồi dán 2 giá trị vào (`.env` đã nằm trong `.gitignore`, không lo lộ khóa).
- Cơ chế: `SyncGate` kéo dữ liệu cloud khi mở trang, merge theo timestamp từng khóa (bên nào mới hơn thắng), push debounce 1.5s sau mỗi sửa, flush best-effort khi đóng tab; có chip đồng bộ + banner "dữ liệu máy khác mới hơn → tải lại" trên UI. Bật/tắt bằng env — không env thì app chạy local-only, không lỗi.
- **Quan trọng**: không bump `knowledgeDataRev`/`layersDataRev` tùy tiện — mỗi bump = bỏ qua bản lưu của người dùng. Muốn reset sạch thì xóa key trong localStorage hoặc dùng nút xuất/nhập backup.

## Lưu ý về dữ liệu

- Sông suối: tọa độ lấy từ **OpenStreetMap** (© OpenStreetMap contributors, ODbL license).
- **Phân vùng rừng** (`forests`): hình học các khu bảo tồn lấy từ **World Database on Protected Areas (WDPCA/UNEP-WCMC)** — [protectedplanet.net](https://protectedplanet.net), truy vấn 10/2026; hiển thị 11 PA thuộc 4 tỉnh.
- **Khu vực cây thuốc quý** (`medicinal_plants`): hình học = polygon hành chính xã (sau sáp nhập 01/7/2025); nội dung & tình trạng đã đối chiếu các nguồn tin bài (Nông nghiệp & Môi trường, Nhân Dân, Lai Châu, Sơn La…) — chi tiết trong `RA_SOAT_DU_LIEU_VA_NGUON_THAM_KHAO.md`.
- **Thủy lợi / VAC / Vùng tập quán** (`irrigation`, `vac_models`, `customary_zones`): nội dung đã đối chiếu nguồn internet (báo địa phương, Bộ Công Thương, Viện KHLN, nghiên cứu học thuật — 10/2026); 5 địa điểm mới thêm với tọa độ centroid hành chính GADM 4.1; polygon vùng tập quán = ranh giới hành chính GADM 4.1 **mang tính đại diện** — xem mục 8 trong `RA_SOAT_DU_LIEU_VA_NGUON_THAM_KHAO.md`.
- **Bản làng** (`villages`): 25 bản làng có thật kèm nguồn riêng từng bản (10/2026), thay toàn bộ 17 điểm minh họa cũ; tọa độ ước lượng theo bản đồ — xem mục 9.1.
- **Dân tộc từng xã** (`dan_toc` trong geojson): Sơn La có % tra cứu theo cấp huyện/xã với `dan_toc_nguon` + nhãn trạng thái (`co_nguon`/`mot_phan`/`du_doan`); 3 tỉnh còn lại gắn nhãn `du_doan` (Tổng điều tra dân tộc 2019 chỉ công bố tới cấp huyện) — xem mục 9.2.
- **Tri thức người Thái ở Phù Yên**: kết quả khảo sát thăm dò 28 người (22–23/08/2026) được tích hợp vào `dan_toc.json`, trong trang chi tiết **Dân tộc Thái**, với ba chủ đề quản lý đất, nước và rừng. `phu_yen_layers.json` bổ sung điểm đại diện cấp xã và các bản ghi Huy Tân/Suối Tấc vào đúng lớp `irrigation`, cùng bản ghi Quang Huy trong lớp `vac_models`; các vùng dược liệu sa nhân, an xoa và sả được bổ sung vào lớp `medicinal_plants`. Các điểm đại diện không được diễn giải là vị trí công trình hoặc ranh giới vùng trồng cụ thể. Cọn nước Suối Tấc và vùng dược liệu đang chờ GPS/ranh giới thực địa. Cọn nước Suối Tấc có ảnh Wikimedia Commons CC0 mang tính minh họa, không phải ảnh tại địa điểm.
- **Ảnh minh họa**: 17 ảnh tải từ Wikimedia Commons (giấy phép & tác giả ghi trong `public/data/images/NGUON_ANH.md`).
- Lớp nền **Vệ tinh (Esri)** do Esri cung cấp và có thể chứa mây tùy cảnh ghép. Lớp **Vệ tinh không mây (Sentinel-2/EOX)** dùng ảnh ghép Sentinel-2 năm 2019 để giảm vùng mây; độ phân giải và thời điểm ảnh có thể khác Esri. Dữ liệu tỉnh/xã từ Bộ Tài nguyên và Môi trường Việt Nam.

## Liên hệ / Hỗ trợ

Đây là mã nguồn được trích xuất từ dự án WebGIS Tây Bắc. Mọi câu hỏi hoặc cải tiến bạn có thể tự chỉnh sửa trong `src/`.
