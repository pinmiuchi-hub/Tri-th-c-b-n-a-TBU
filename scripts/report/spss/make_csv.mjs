import fs from 'node:fs';
import path from 'node:path';

function parseCSV(text) {
  const rows = []; let row = []; let cur = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else q = false;
      } else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
const escCsv = (s) => {
  const v = (s ?? '').toString();
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};

const base = 'scripts/report/spss';
const rows = parseCSV(fs.readFileSync(path.join(base, 'sheet_2.csv'), 'utf8').replace(/^\uFEFF/, ''));
const data = rows.slice(3).filter(r => r[0] && /^\d+$/.test(r[0].trim()));
if (data.length !== 65) { console.error('Expected 65 rows, got', data.length); process.exit(1); }

// Variable layout (col index in Excel export -> SPSS var)
// Single-choice coded 1..n by order in Danh muc (sheet_4) OR keep text and let PSPP use value from text?
// For robust PSPP batch: emit numeric codes + separate label dictionary via VALUE LABELS in syntax.
// Mapping taken from sheet_4 Danh muc order.

const GIOI_TINH = ['Nam', 'Nữ'];
const DAN_TOC = ['Thái', 'Mông', 'Mường', 'Kinh', 'Khác'];
// sheet_4 shows: Thái, Mông for dan toc col — but data has Mường too. Build from actual values sorted.
const SINH_SONG = ['Dưới 5 năm', 'Từ 5–15 năm', 'Trên 15 năm'];
const HOC_VAN = ['Chưa qua đào tạo', 'Tiểu học', 'THCS', 'THPT', 'Trung cấp', 'Cao đẳng', 'Đại học trở lên'];
const THU_NHAP = ['Nông nghiệp', 'Chăn nuôi', 'Lâm nghiệp', 'Thủy sản', 'Công nhân/viên chức Nhà nước', 'Thương mại/dịch vụ', 'Khác'];

// columns
const C = {
  MAPHIEU: 0, GIOI: 4, NAMSINH: 5, DANTOC: 6, NAMSONG: 9, HOVAN: 11, THUNHAP: 12,
  // đất
  thamGiaDat: 14, ngungNam: 16, lydoNgung: 17,
  dat2_19_28: [19,20,21,22,23,24,25,26,27,28],
  dat3_29_34: [29,30,31,32,33,34],
  dat4_35_44: [35,36,37,38,39,40,41,42,43,44],
  dat5_45_49: [45,46,47,48,49],
  dat6: 50,
  // nước
  nuoc1_51_57: [51,52,53,54,55,56,57],
  nuoc21_58_61: [58,59,60,61],
  nuoc22: 62,
  nuoc23_63_69: [63,64,65,66,67,68,69],
  nuoc3_70_73: [70,71,72,73],
  nuoc4_74_79: [74,75,76,77,78,79],
  nuoc5: 80,
  nuoc6_81_85: [81,82,83,84,85],
  nuoc7: 86,
  // rừng
  rung1: 87, rung2: 88, rung3: 89, rung41: 90, rung51: 92,
  rung6_94_98: [94,95,96,97,98],
  rung7: 99,
  // bản đồ
  bd1_100_104: [100,101,102,103,104],
  bd2_105_113: [105,106,107,108,109,110,111,112,113],
  bd3: 114,
  bd4_115_118: [115,116,117,118],
  bd5: 119,
};

const val = (r, i) => (r[i] ?? '').trim();
const isMarked = (r, i) => { const v = val(r, i); return v === '1' || v === 'x' || v === 'X' || v === 'TRUE' || v === 'true' || v === 'Có' || v === 'có' || v === '1.0'; };

// discover actual categorical values for single-choice
function uniqAt(col) {
  const s = new Set();
  for (const r of data) { const v = val(r, col); if (v) s.add(v); }
  return [...s];
}

// Build codebooks (ordered stable: known order first, then sorted extras)
function orderLike(actual, known) {
  const out = known.filter(k => actual.includes(k));
  for (const a of [...actual].sort()) if (!out.includes(a)) out.push(a);
  return out;
}
const codebook = {
  GIOI: orderLike(uniqAt(C.GIOI), GIOI_TINH),
  DANTOC: orderLike(uniqAt(C.DANTOC), DAN_TOC),
  NAMSONG: orderLike(uniqAt(C.NAMSONG), SINH_SONG),
  HOVAN: orderLike(uniqAt(C.HOVAN), HOC_VAN),
  THUNHAP: orderLike(uniqAt(C.THUNHAP), THU_NHAP),
  thamGiaDat: uniqAt(C.thamGiaDat),
  lydoNgung: uniqAt(C.lydoNgung),
  dat6: uniqAt(C.dat6),
  nuoc22: uniqAt(C.nuoc22),
  nuoc5: uniqAt(C.nuoc5),
  nuoc7: uniqAt(C.nuoc7),
  rung1: uniqAt(C.rung1),
  rung2: uniqAt(C.rung2),
  rung3: uniqAt(C.rung3),
  rung41: uniqAt(C.rung41),
  rung51: uniqAt(C.rung51),
  rung7: uniqAt(C.rung7),
  bd3: uniqAt(C.bd3),
  bd5: uniqAt(C.bd5),
};
// Likert-like numeric coding for 5-level scales (best-effort semantic order)
const LIKERT5 = ['Hoàn toàn không cần thiết', 'Không cần thiết', 'Bình thường', 'Cần thiết', 'Rất cần thiết'];
function likertCodebook(actual) {
  const out = LIKERT5.filter(k => actual.includes(k));
  for (const a of [...actual].sort()) if (!out.includes(a)) out.push(a);
  return out;
}
codebook.dat6 = likertCodebook(codebook.dat6);
codebook.nuoc7 = likertCodebook(codebook.nuoc7);
codebook.rung7 = likertCodebook(codebook.rung7);

const code = (v, book) => { const i = book.indexOf(v); return i >= 0 ? i + 1 : ''; };

// Multi-response option labels (from headers) — static for clean var names
const MR = {
  dat2: ['bonphan', 'phanchuong', 'vatnuoi', 'checover', 'luancanh', 'ruongbat', 'dongmuc', 'nghialand', 'khongcaitao', 'khac'],
  dat3: ['trithuc', 'nhanNuoc', 'tuHoc', 'hocDanToc', 'chuaUNG', 'khac'],
  dat4: ['bonphan', 'phanchuong', 'vatnuoi', 'checover', 'luancanh', 'ruongbat', 'dongmuc', 'nghialand', 'khongcaitao', 'khac'],
  dat5: ['khongGhichep', 'LopTre', 'NguoiGia', 'PhanBonHoa', 'khac'],
  nuoc1: ['thuongnguon', 'hamnguon', 'mo', 'songsuoi', 'ngum', 'mua', 'khac'],
  nuoc21: ['tttn', 'tlTruyenThong', 'tlHienDai', 'khac'],
  nuoc23: ['ngaycong', 'tusua', 'tuantra', 'trongcay', 'nghiLy', 'khongco', 'khac'],
  nuoc3: ['nhaNuoc', 'huongUoc', 'LuatTuc', 'khac'],
  nuoc4: ['dauNguon', 'congDong', 'phanChia', 'taiSD', 'khong', 'khac'],
  nuoc6: ['phuThuoc', 'BDKH', 'yLi', 'BienDong', 'khac'],
  rung6: ['truyenMieng', 'LopTre', 'NguoiGia', 'NhaTruong', 'khac'],
  bd1: ['giay', 'app', 'sodo', 'chuabiet', 'khac'],
  bd2: ['hientriatDat', 'diahinh', 'songsuoi', 'hanhChinh', 'giaoThong', 'danCu', 'nongLich', 'quyDinh', 'khac'],
  bd4: ['truongBan', 'canBo', 'nghienCuu', 'hoGiaDinh'],
};
const MR_COLS = {
  dat2: C.dat2_19_28, dat3: C.dat3_29_34, dat4: C.dat4_35_44, dat5: C.dat5_45_49,
  nuoc1: C.nuoc1_51_57, nuoc21: C.nuoc21_58_61, nuoc23: C.nuoc23_63_69,
  nuoc3: C.nuoc3_70_73, nuoc4: C.nuoc4_74_79, nuoc6: C.nuoc6_81_85,
  rung6: C.rung6_94_98, bd1: C.bd1_100_104, bd2: C.bd2_105_113, bd4: C.bd4_115_118,
};

// Build header list
const headers = ['MAPHIEU', 'GIOITINH', 'NAMSINH', 'DANTOC', 'NAMSONG', 'TRINHDO', 'THUNHAP',
  'THAMGIA_DAT', 'NGUNG_NAM', 'LYDO_NGUNG', 'DAT6',
  'NUOC22', 'NUOC5', 'NUOC7',
  'RUNG1', 'RUNG2', 'RUNG3', 'RUNG41', 'RUNG51', 'RUNG7',
  'BD3', 'BD5'];
for (const [g, names] of Object.entries(MR)) {
  for (const n of names) headers.push(`${g}_${n}`);
}

const lines = [headers.map(escCsv).join(',')];
for (const r of data) {
  const row = [
    val(r, C.MAPHIEU),
    code(val(r, C.GIOI), codebook.GIOI),
    val(r, C.NAMSINH),
    code(val(r, C.DANTOC), codebook.DANTOC),
    code(val(r, C.NAMSONG), codebook.NAMSONG),
    code(val(r, C.HOVAN), codebook.HOVAN),
    code(val(r, C.THUNHAP), codebook.THUNHAP),
    code(val(r, C.thamGiaDat), codebook.thamGiaDat),
    val(r, C.ngungNam),
    code(val(r, C.lydoNgung), codebook.lydoNgung),
    code(val(r, C.dat6), codebook.dat6),
    code(val(r, C.nuoc22), codebook.nuoc22),
    code(val(r, C.nuoc5), codebook.nuoc5),
    code(val(r, C.nuoc7), codebook.nuoc7),
    code(val(r, C.rung1), codebook.rung1),
    code(val(r, C.rung2), codebook.rung2),
    code(val(r, C.rung3), codebook.rung3),
    code(val(r, C.rung41), codebook.rung41),
    code(val(r, C.rung51), codebook.rung51),
    code(val(r, C.rung7), codebook.rung7),
    code(val(r, C.bd3), codebook.bd3),
    code(val(r, C.bd5), codebook.bd5),
  ];
  for (const [g, cols] of Object.entries(MR_COLS)) {
    for (const ci of cols) row.push(isMarked(r, ci) ? '1' : '0');
  }
  lines.push(row.map(escCsv).join(','));
}

const csvPath = path.join(base, 'khao_sat_sonla_65.csv');
fs.writeFileSync(csvPath, '\uFEFF' + lines.join('\r\n'), 'utf8');
console.log('Wrote', csvPath, 'rows=', data.length, 'cols=', headers.length);

// Write codebook for syntax generation
fs.writeFileSync(path.join(base, 'codebook.json'), JSON.stringify({ codebook, MR }, null, 2), 'utf8');
console.log('Wrote codebook.json');
for (const [k, v] of Object.entries(codebook)) console.log(k, '=>', v.map((x, i) => `${i + 1}=${x}`).join(' | '));
