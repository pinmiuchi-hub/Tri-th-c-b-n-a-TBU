# WebGIS Tây Bắc — Mã nguồn

Hệ thống thông tin địa lý & tri thức bản địa vùng Tây Bắc Việt Nam (Sơn La, Điện Biên, Lai Châu).

## Yêu cầu hệ thống

- **Node.js** ≥ 20.x — https://nodejs.org
- **pnpm** ≥ 9.x — cài bằng lệnh: `npm install -g pnpm`

## Cài đặt và chạy

Sau khi giải nén, mở terminal trong thư mục `webgis/` và chạy:

```bash
# 1) Cài đặt thư viện
pnpm install

# 2) Chạy ở chế độ phát triển (dev server)
pnpm dev
# → mở trình duyệt tại http://localhost:5173

# 3) Build bản production
pnpm build
# → kết quả nằm trong thư mục dist/

# 4) Xem thử bản production đã build
pnpm serve
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
│       ├── layers.json          # Sông suối, thủy lợi, mô hình VAC, ...
│       └── dan_toc.json         # Thông tin các dân tộc
├── src/
│   ├── pages/
│   │   └── WebGIS.tsx           # Trang chính (hiển thị bản đồ)
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

- Bản đồ tương tác với 3 lớp nền: **OpenStreetMap**, **Vệ tinh (Esri)**, **Địa hình (OpenTopoMap)**
- Hiển thị ranh giới tỉnh/xã của Tây Bắc, có thể click để xem chi tiết
- 7 lớp dữ liệu: Sông suối chính, Thủy lợi, Rừng, Mô hình VAC, Cây thuốc, Vùng tập quán, Ranh giới xã
- Biên tập tại chỗ: thêm/sửa/xóa điểm, chọn vị trí trực tiếp trên bản đồ
- Tải ảnh tùy chỉnh cho biểu tượng lớp
- Xuất từng lớp ra **KML** (Google Earth) hoặc **GeoJSON** (giữ nguyên màu sắc & biểu tượng)
- Nhập dữ liệu CSV cho xã & dân tộc
- Mặt cắt sinh thái (transect), Lịch nông vụ, Thư viện tri thức bản địa
- Hồ sơ ảnh & tài liệu PDF cho từng dân tộc và xã

## Triển khai (Deploy)

Sau khi `pnpm build`, thư mục `dist/` chứa file tĩnh có thể deploy lên bất kỳ web host nào (Netlify, Vercel, Nginx, Apache, GitHub Pages, ...).

## Lưu ý về dữ liệu sông suối

Tọa độ sông suối lấy từ **OpenStreetMap** (© OpenStreetMap contributors, ODbL license). Lớp nền vệ tinh do **Esri** cung cấp. Dữ liệu tỉnh/xã từ Bộ Tài nguyên và Môi trường Việt Nam.

## Liên hệ / Hỗ trợ

Đây là mã nguồn được trích xuất từ dự án WebGIS Tây Bắc. Mọi câu hỏi hoặc cải tiến bạn có thể tự chỉnh sửa trong `src/`.
