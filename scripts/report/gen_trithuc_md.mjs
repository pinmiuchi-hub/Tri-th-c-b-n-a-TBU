// Sinh 08_TRITHUC_BAN_DIA.md — toàn bộ nội dung tri thức bản địa từ dan_toc.json
// Dùng cho Phụ lục J của báo cáo đề tài.
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve('artifacts/webgis/docs/BaoCao_NghienCuu');
const SRC = path.resolve('artifacts/webgis/public/data/dan_toc.json');
const OUT = path.join(BASE, '08_TRITHUC_BAN_DIA.md');

const dt = JSON.parse(fs.readFileSync(SRC, 'utf8')).dan_toc;
const one = (s) =>
  String(s ?? '')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
    .replace(/"nguon"/g, '`nguon`')
    .replace(/ & /g, ' và ')
    .replace(/"([^"]+)"/g, '“$1”')
    .replace(/\.{3,}/g, '…');
const cell = (s) => one(s).replace(/\|/g, '\\|');
const num = (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : String(n ?? ''));

const out = [];
out.push('### J.4. Toàn bộ nội dung tri thức bản địa theo dân tộc');
out.push('');
out.push(`Phần dưới đây trích toàn bộ nội dung tri thức bản địa đang được hệ thống hiển thị trong bảng “Thông tin địa bàn” (khối dân tộc — tab chủ đề tri thức — thẻ bài thuốc), lấy nguyên trạng từ tệp dữ liệu \`public/data/dan_toc.json\`. Bộ dữ liệu hiện gồm ${dt.length} dân tộc (tổng hợp tại Bảng J.2). Mỗi mục gồm thông tin chung của dân tộc, danh sách nguồn tham khảo đã ghi trong dữ liệu, sau đó là từng chủ đề tri thức kèm nội dung và các bài thuốc / thông tin mẫu (nguyên liệu, công dụng). Nội dung này là dữ liệu nền của chương trình, có thể được cán bộ xã chỉnh sửa trực tiếp trên giao diện và lưu lại theo từng phiên làm việc.`);
out.push('');
out.push('**Bảng J.2. Tổng hợp bộ tri thức bản địa theo từng dân tộc**');
out.push('');
out.push('| STT | Dân tộc (id) | Số chủ đề tri thức | Số bài thuốc / thông tin mẫu | Ảnh minh họa |');
out.push('|---|---|---|---|---|');
dt.forEach((e, i) => {
  const recipes = (e.tri_thuc || []).reduce((s, t) => s + (t.bai_thuoc?.length || 0), 0);
  const anh = e.anh ? 'Có' : 'Chưa có';
  out.push(`| ${i + 1} | ${cell(e.ten)} (\`${e.id}\`) | ${(e.tri_thuc || []).length} | ${recipes} | ${anh} |`);
});
out.push('');

dt.forEach((e, i) => {
  out.push(`**J.4.${i + 1}. ${one(e.ten)}**`);
  out.push('');
  const bits = [];
  if (e.ngon_ngu) bits.push(`Ngôn ngữ: ${one(e.ngon_ngu)}`);
  if (e.dan_so_ca_nuoc) bits.push(`Dân số cả nước: ${num(e.dan_so_ca_nuoc)} người${e.nam_dan_so ? ` (năm ${e.nam_dan_so})` : ''}`);
  if (e.trang_thai_tri_thuc) bits.push(`Trạng thái nội dung tri thức: ${one(e.trang_thai_tri_thuc)}`);
  if (bits.length) { out.push(bits.join(' · ')); out.push(''); }
  if (e.mo_ta) { out.push(one(e.mo_ta)); out.push(''); }
  if (e.anh) {
    out.push(`Ảnh minh họa trên hệ thống: \`data/images/${one(e.anh).replace(/^data\/images\//, '')}\`${e.anh_ghichu ? ` — ${one(e.anh_ghichu)}` : ''}`);
  } else {
    out.push('Ảnh minh họa trên hệ thống: chưa có — hệ thống không tự gán ảnh thay thế khi chưa có ảnh chân dung phù hợp trên Wikimedia Commons.');
  }
  out.push('');
  const nguon = e.nguon || [];
  if (nguon.length) {
    out.push(`Nguồn tham khảo (${nguon.length}):`);
    nguon.forEach((n) => out.push(`- ${one(n)}`));
    if (e.ghi_chu_nguon) out.push(`- *${one(e.ghi_chu_nguon)}*`);
    out.push('');
  }
  (e.tri_thuc || []).forEach((t) => {
    out.push(`**${one(t.bieu_tuong)} ${one(t.chu_de)}**`);
    out.push('');
    if (t.noi_dung) { out.push(one(t.noi_dung)); out.push(''); }
    const recs = t.bai_thuoc || [];
    if (recs.length) {
      out.push('| Bài thuốc / thông tin mẫu | Nguyên liệu | Công dụng |');
      out.push('|---|---|---|');
      recs.forEach((r) => out.push(`| ${cell(r.ten)} | ${cell(r.nguyen_lieu)} | ${cell(r.cong_dung)} |`));
      out.push('');
    }
  });
});

const text = out.join('\n');
fs.writeFileSync(OUT, text, 'utf8');
console.log(`wrote ${OUT}`);
console.log(`  ethnic: ${dt.length} | chars: ${text.length} | lines: ${out.length}`);
