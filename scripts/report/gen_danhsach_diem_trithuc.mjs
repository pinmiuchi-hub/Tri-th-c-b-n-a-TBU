// Sinh DanhSach_Diem_TriThucBanDia.md — danh sách toàn bộ điểm tri thức bản địa
// đã tích hợp vào WebGIS, kèm tọa độ đại diện đã gán và nguồn tham khảo.
// Nguồn: public/data/tri_thuc_ban_dia.json (lớp Đất/Nước/Rừng),
//         public/data/phu_yen_layers.json (điểm cây thuốc Phù Yên),
//         public/data/layers.json (vùng cây thuốc dạng polygon).
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('artifacts/webgis/public/data');
const OUT_MD = path.resolve('artifacts/webgis/docs/DanhSach_Diem_TriThucBanDia.md');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));

const knowledge = readJson(path.join(DATA_DIR, 'tri_thuc_ban_dia.json'));
const phuYen = readJson(path.join(DATA_DIR, 'phu_yen_layers.json'));
const layersJson = readJson(path.join(DATA_DIR, 'layers.json'));

// ---- mã xã -> tên xã (Sơn La + các tỉnh giáp ranh) ----
const xaMap = new Map();
for (const fn of ['xa_sonla.geojson', 'xa_dienbien.geojson', 'xa_laichau.geojson', 'xa_laocai.geojson']) {
  try {
    const g = readJson(path.join(DATA_DIR, fn));
    for (const f of g.features || []) {
      const p = f.properties || {};
      if (p.ma_xa && !xaMap.has(String(p.ma_xa))) xaMap.set(String(p.ma_xa), p.ten_xa);
    }
  } catch (e) {
    console.warn('skip', fn, e.message);
  }
}

// ---- nguồn: đánh số duy nhất theo lần xuất hiện đầu tiên ----
const srcList = [];
const srcNo = new Map();
const numbersOf = (raw) => {
  const items = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(';') : [];
  const nos = [];
  for (const it of items) {
    const s = String(it).trim();
    if (!s) continue;
    if (!srcNo.has(s)) {
      srcNo.set(s, srcList.length + 1);
      srcList.push(s);
    }
    const n = srcNo.get(s);
    if (!nos.includes(n)) nos.push(n);
  }
  return nos;
};

const STATUS = {
  co_nguon: 'Có nguồn',
  can_doi_chieu: 'Cần đối chiếu',
  chua_xac_minh: 'Chưa xác minh',
  minh_hoa: 'Minh họa',
};
const status = (t) => STATUS[t] || t || '—';
const coord = (n) => (typeof n === 'number' && Number.isFinite(n) ? String(n) : '—');
const cell = (s) => {
  const t = String(s ?? '').replace(/\s*\n\s*/g, ' ').trim().replace(/\|/g, '\\|');
  return t || '—';
};
const xaCell = (ma, fallback) => {
  const ten = fallback || (ma ? xaMap.get(String(ma)) : null);
  if (ten && ma) return `${ten} (${ma})`;
  if (ten) return ten;
  if (ma) return `Mã ${ma}`;
  return '—';
};
const srcCell = (nos) => (nos.length ? nos.join(', ') : '—');

// ---- thu thập dòng ----
const rows = [];
let stt = 0;
const pushRow = (r) => {
  stt += 1;
  const withStt = { stt, ...r };
  rows.push(withStt);
  return withStt;
};

// 1-3. lớp tri thức bản địa từ tri_thuc_ban_dia.json
const layerGroups = [];
for (const layer of knowledge.layers || []) {
  const groupRows = [];
  for (const f of layer.features || []) {
    const r = {
      id: f.id || '—',
      ten: f.ten || '—',
      linh_vuc: f.linh_vuc || layer.ten,
      xa: xaCell(f.ma_xa),
      lat: coord(f.lat),
      lng: coord(f.lng),
      tt: status(f.trang_thai),
      src: numbersOf(f.nguon),
    };
    groupRows.push(pushRow(r));
  }
  layerGroups.push({ layer, rows: groupRows });
}

// 4. điểm cây thuốc Phù Yên (phu_yen_layers.json → lớp medicinal_plants)
const medPointRows = [];
for (const p of phuYen.medicinal_plants || []) {
  const r = {
    id: p.id || '—',
    ten: p.ten || '—',
    linh_vuc: p.linh_vuc || 'Đất · Nước · Rừng · dược liệu',
    xa: xaCell(null, p.ten_dia_phuong),
    lat: coord(p.lat),
    lng: coord(p.lng),
    tt: status(p.trang_thai),
    src: numbersOf(p.nguon),
  };
  medPointRows.push(pushRow(r));
}

// 5. vùng cây thuốc dạng polygon (layers.json) — tọa độ tâm vùng tính từ vòng polygon
const centroid = (coords) => {
  const ring = Array.isArray(coords?.[0]?.[0]) ? coords[0] : Array.isArray(coords?.[0]) && typeof coords[0][0] === 'number' ? coords : coords;
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const pt of ring || []) {
    if (Array.isArray(pt) && pt.length >= 2 && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) {
      sx += pt[0];
      sy += pt[1];
      n += 1;
    }
  }
  return n ? { lat: Number((sy / n).toFixed(5)), lng: Number((sx / n).toFixed(5)) } : { lat: null, lng: null };
};
const zoneRows = [];
for (const p of layersJson.medicinal_plants || []) {
  const c = centroid(p.coords);
  const r = {
    id: p.id || '—',
    ten: p.ten || '—',
    linh_vuc: p.ten_khoa_hoc ? `Dược liệu · ${p.ten_khoa_hoc}` : 'Dược liệu',
    xa: xaCell(null, p.ten_dia_phuong),
    lat: coord(c.lat),
    lng: coord(c.lng),
    tt: status(p.trang_thai),
    src: numbersOf(p.nguon),
  };
  zoneRows.push(pushRow(r));
}

// ---- thống kê ----
const statusCounts = {};
for (const r of rows) statusCounts[r.tt] = (statusCounts[r.tt] || 0) + 1;
const nCommunes = new Set(
  rows.map((r) => (/\((\d{5})\)$/.exec(r.xa) || [])[1]).filter(Boolean),
).size;

// ---- soạn markdown ----
const out = [];
const HDR = '| STT | Mã điểm | Tên điểm | Lĩnh vực | Xã (mã) | Vĩ độ (°B) | Kinh độ (°Đ) | Trạng thái | Nguồn |';
const SEP = '|---|---|---|---|---|---|---|---|---|';
const emitRow = (r) =>
  `| ${r.stt} | ${cell(r.id)} | ${cell(r.ten)} | ${cell(r.linh_vuc)} | ${cell(r.xa)} | ${r.lat} | ${r.lng} | ${cell(r.tt)} | ${srcCell(r.src)} |`;

out.push('# DANH SÁCH ĐIỂM TRI THỨC BẢN ĐỊA ĐÃ TÍCH HỢP TRÊN HỆ THỐNG WEBGIS');
out.push('');
out.push('## Tọa độ đại diện và nguồn tham khảo');
out.push('');
out.push(
  `Tài liệu này liệt kê toàn bộ ${rows.length} đối tượng dữ liệu về tri thức bản địa đang được hệ thống WebGIS hiển thị trên bản đồ, gồm ${(knowledge.layers || []).length} lớp điểm tri thức bản địa (Tài nguyên đất – Tài nguyên nước – Tài nguyên rừng), lớp điểm cây thuốc quý tại Phù Yên và ${zoneRows.length} vùng dược liệu dạng vùng (phụ lục). Mỗi đối tượng kèm mã điểm, lĩnh vực, đơn vị hành chính, tọa độ đại diện đã gán và số hiệu nguồn tham khảo.`,
);
out.push('');
out.push('- Dữ liệu lấy nguyên trạng từ các tệp: `public/data/tri_thuc_ban_dia.json` (rev ' + (knowledge._meta?.rev ?? '?') + '), `public/data/phu_yen_layers.json`, `public/data/layers.json`.');
out.push('- Quy ước tọa độ: WGS84, dạng số thập phân, cột trước là vĩ độ (lat), cột sau là kinh độ (lng).');
out.push('- Tọa độ là **điểm đại diện trong đơn vị hành chính** (giãn nhẹ để khỏi chồng lấn giữa các điểm cùng xã), KHÔNG phải tọa độ GPS của công trình, thửa ruộng hay khu rừng cụ thể — cần khảo sát thực địa để đối chiếu.');
out.push('- Trạng thái: **Có nguồn** = đã có nguồn công bố; **Cần đối chiếu** = cần khảo sát đối chiếu thực địa; **Chưa xác minh** = nguồn đã ghi nhưng chưa xác minh vị trí.');
out.push('- Cột **Nguồn** hiển thị số hiệu; toàn bộ địa chỉ/citation tương ứng nằm ở mục “Danh mục nguồn tham khảo” cuối tài liệu (đánh số theo lần xuất hiện đầu tiên).');
out.push('');
out.push('**Bảng 1. Tổng hợp số đối tượng theo lớp dữ liệu**');
out.push('');
out.push('| Nhóm | Lớp (id) | Loại hiển thị | Số đối tượng |');
out.push('|---|---|---|---|');
for (const g of layerGroups) {
  out.push(
    `| ${cell(g.layer.ten)} | \`${g.layer.id}\` | Điểm | ${g.rows.length} |`,
  );
}
out.push(
  `| Khu vực cây thuốc quý (Phù Yên) | \`medicinal_plants\` | Điểm | ${medPointRows.length} |`,
);
out.push(
  `| Khu vực cây thuốc quý (phụ lục) | \`medicinal_plants\` | Vùng (polygon) | ${zoneRows.length} |`,
);
out.push(`| **Tổng cộng** | | | **${rows.length}** |`);
out.push('');
out.push(
  `Phân bố trạng thái: ${Object.entries(statusCounts)
    .map(([k, v]) => `${k} = ${v}`)
    .join('; ')}. Số đơn vị hành chính có điểm: ${nCommunes}. Số nguồn tham khảo duy nhất: ${srcList.length}.`,
);
out.push('');

const tableTitles = [];
let bi = 1;
for (const g of layerGroups) {
  bi += 1;
  const title = `Bảng ${bi}. Điểm tri thức bản địa — ${g.layer.ten} (${g.rows.length} điểm)`;
  tableTitles.push(title);
  out.push(`**${title}**`);
  out.push('');
  out.push(HDR);
  out.push(SEP);
  for (const r of g.rows) out.push(emitRow(r));
  out.push('');
}
bi += 1;
const medTitle = `Bảng ${bi}. Điểm cây thuốc quý tại Phù Yên — dữ liệu bổ sung từ phu_yen_layers.json (${medPointRows.length} điểm)`;
tableTitles.push(medTitle);
out.push(`**${medTitle}**`);
out.push('');
out.push(HDR);
out.push(SEP);
for (const r of medPointRows) out.push(emitRow(r));
out.push('');

bi += 1;
const zoneTitle = `Bảng ${bi}. Phụ lục: vùng cây thuốc quý hiển thị dạng vùng (polygon) — tọa độ tính từ tâm đa giác (${zoneRows.length} vùng)`;
tableTitles.push(zoneTitle);
out.push(`**${zoneTitle}**`);
out.push('');
out.push(HDR);
out.push(SEP);
for (const r of zoneRows) out.push(emitRow(r));
out.push('');

out.push('## Danh mục nguồn tham khảo');
out.push('');
out.push(
  'Các nguồn dưới đây được đánh số theo thứ tự xuất hiện trong các bảng trên; mỗi điểm trong bảng ghi số hiệu tương ứng.',
);
out.push('');
srcList.forEach((s, i) => out.push(`${i + 1}. ${s}`));
out.push('');

out.push('## Ghi chú');
out.push('');
out.push(
  '- Mảng dữ liệu cấp dân tộc (`public/data/dan_toc.json` — nội dung tri thức theo từng dân tộc, bài thuốc, mẫu thông tin) hiển thị trong bảng “Thông tin địa bàn” và KHÔNG có tọa độ nên không nằm trong danh sách điểm này.',
);
out.push(
  '- Các mảng `phu_yen_indigenous_knowledge`, `vac_models`, `irrigation` trong `phu_yen_layers.json` đã được gộp vào `tri_thuc_ban_dia.json` (xác nhận trong chú thích tệp và mã nguồn `WebGIS goc.tsx`), vì vậy không liệt kê trùng ở đây.',
);
out.push(
  '- Một số điểm có mã xã thuộc đơn vị hành chính các tỉnh giáp ranh (Điện Biên, Lai Châu, Lào Cai) — tên xã đối chiếu từ tệp `xa_dienbien/xa_laichau/xa_laocai.geojson`.',
);
out.push('');

const text = out.join('\n');
fs.writeFileSync(OUT_MD, text, 'utf8');
console.log('wrote', OUT_MD);
console.log(
  `  rows=${rows.length} (layers=${layerGroups.map((g) => g.rows.length).join('/')} med=${medPointRows.length} zones=${zoneRows.length}) sources=${srcList.length} chars=${text.length}`,
);
