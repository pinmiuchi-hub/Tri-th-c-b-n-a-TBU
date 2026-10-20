import fs from 'node:fs';

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

const rows = parseCSV(fs.readFileSync('scripts/report/spss/khao_sat_sonla_65.csv', 'utf8').replace(/^\uFEFF/, ''));
const h = rows[0].map(s => s.toUpperCase()); const data = rows.slice(1);
console.log('n =', data.length);
const col = (name) => h.indexOf(name.toUpperCase());
const dist = (name) => {
  const i = col(name); const c = {};
  for (const r of data) { const v = r[i] || 'NA'; c[v] = (c[v] || 0) + 1; }
  return c;
};
const cnt1 = (name) => data.filter(r => r[col(name)] === '1').length;

// --- bieu do bd_3_5: Loai ban do da tung biet (MR $BD1) ---
console.log('\n== BD1 Loai ban do (chon nhieu, n=65) ==');
for (const v of ['BD1_giay', 'BD1_app', 'BD1_sodo', 'BD1_chuabiet', 'BD1_khac']) {
  const k = cnt1(v);
  console.log(` ${v}: ${k} = ${(k / 65 * 100).toFixed(1)}%`);
}

// --- bd_3_1 co cau dan toc ---
console.log('\n== DANTOC ==', JSON.stringify(dist('DANTOC')));
for (const [k, name] of [['1', 'Thai'], ['2', 'Mong'], ['3', 'Muong']]) {}
const dt = dist('DANTOC');
for (const [code, label] of [['1', 'Thai'], ['2', 'Mong'], ['3', 'Muong']]) {
  console.log(` ${label}: ${dt[code] || 0} = ${((dt[code] || 0) / 65 * 100).toFixed(1)}%`);
}

// --- bd_3_10: hinh thuc ban do mong muon theo dan toc (BD3) ---
console.log('\n== BD3 x DANTOC ==');
const bd3 = ['1', '2', '3', '4']; // giay, ca hai, khong, app (codebook order)
const labels3 = { '1': 'giay', '2': 'caihai', '3': 'khong', '4': 'app' };
for (const dtc of ['1', '2', '3']) {
  const sub = data.filter(r => r[col('DANTOC')] === dtc);
  const c = {};
  for (const r of sub) { const v = r[col('BD3')] || 'miss'; c[v] = (c[v] || 0) + 1; }
  const named = {};
  for (const [k, v] of Object.entries(c)) named[labels3[k] || k] = v;
  console.log(` DANTOC=${dtc} n=${sub.length}`, JSON.stringify(named));
}
// chi2
function chi2(cross) {
  const rowsK = Object.keys(cross); const colsK = [...new Set(rowsK.flatMap(r => Object.keys(cross[r])))];
  const rowT = {}; const colT = {};
  let grand = 0;
  for (const r of rowsK) { rowT[r] = Object.values(cross[r]).reduce((a, b) => a + b, 0); grand += rowT[r]; }
  for (const c of colsK) { colT[c] = 0; for (const r of rowsK) colT[c] += cross[r][c] || 0; }
  let x2 = 0;
  for (const r of rowsK) for (const c of colsK) {
    const o = cross[r][c] || 0; const e = rowT[r] * colT[c] / grand;
    if (e > 0) x2 += (o - e) ** 2 / e;
  }
  return { x2, df: (rowsK.length - 1) * (colsK.length - 1) };
}
const cross3 = {};
for (const r of data) {
  const d = r[col('DANTOC')]; const b = r[col('BD3')];
  if (!d || !b) continue;
  cross3[d] = cross3[d] || {}; cross3[d][b] = (cross3[d][b] || 0) + 1;
}
console.log(' chi2 BD3 x DANTOC:', JSON.stringify(chi2(cross3)));

// --- bd_3_8: tan suat TL truyen thong theo dan toc (NUOC22) ---
console.log('\n== NUOC22 x DANTOC ==');
const c8 = {};
for (const r of data) {
  const d = r[col('DANTOC')]; const v = r[col('NUOC22')];
  if (!d || !v) continue;
  c8[d] = c8[d] || {}; c8[d][v] = (c8[d][v] || 0) + 1;
}
console.log(' cross:', JSON.stringify(c8));
console.log(' chi2:', JSON.stringify(chi2(c8)));

// --- muc do can so hoa (means 5-level recode) ---
function likertMean(name, map) {
  const i = col(name); let s = 0, n = 0;
  for (const r of data) { const v = r[i]; if (v && map[v] !== undefined) { s += map[v]; n++; } }
  return { mean: (s / n).toFixed(2), n };
}
const m5 = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 };
console.log('\n== Means (recoded 1..5 by codebook order) ==');
console.log(' DAT6:', JSON.stringify(likertMean('DAT6', { '1': 3, '2': 4, '3': 5 }))); // codebook: BT=1->3, CT=2->4, RCT=3->5
console.log(' NUOC7:', JSON.stringify(likertMean('NUOC7', { '1': 1, '2': 3, '3': 4, '4': 5 })));
console.log(' RUNG7:', JSON.stringify(likertMean('RUNG7', m5)));

// --- ty le "can thiet/rat can thiet" ---
function pctNeed(name, codes) {
  const i = col(name); let k = 0, n = 0;
  for (const r of data) { const v = r[i]; if (v) { n++; if (codes.includes(v)) k++; } }
  return `${k}/${n} = ${(k / n * 100).toFixed(1)}%`;
}
console.log('\n== Ty le can thiet ==');
console.log(' DAT6 (CT+RCT):', pctNeed('DAT6', ['2', '3']));
console.log(' NUOC7 (CT+RCT):', pctNeed('NUOC7', ['3', '4']));
console.log(' RUNG7 (CT+RCT):', pctNeed('RUNG7', ['4', '5']));
console.log(' NUOC7 binh thuong:', pctNeed('NUOC7', ['2']));

// --- bd_3_5 hinh thuc ban do mong muon (BD3) ---
console.log('\n== BD3 tong ==', JSON.stringify(dist('BD3')));
const bd3valid = data.filter(r => r[col('BD3')]);
const caihai = bd3valid.filter(r => r[col('BD3')] === '2').length;
console.log(` BD3 caihai: ${caihai}/${bd3valid.length} = ${(caihai / bd3valid.length * 100).toFixed(1)}% valid; ${(caihai / 65 * 100).toFixed(1)}% of 65`);

// --- bd5 san sang ---
console.log('\n== BD5 ==', JSON.stringify(dist('BD5')));

// --- cac chi so khac de doi chieu bao cao ---
console.log('\n== Cac chi so khac ==');
console.log(' GIOI:', JSON.stringify(dist('GIOI')));
console.log(' NAMSONG:', JSON.stringify(dist('NAMSONG')));
console.log(' TRINHDO:', JSON.stringify(dist('TRINHDO')));
console.log(' THUNHAP:', JSON.stringify(dist('THUNHAP')));
console.log(' RUNG1:', JSON.stringify(dist('RUNG1')), 'RUNG2:', JSON.stringify(dist('RUNG2')), 'RUNG3:', JSON.stringify(dist('RUNG3')));
console.log(' BD2 hientrungdat:', cnt1('BD2_hientriatDat'), 'diahinh:', cnt1('BD2_diahinh'), 'danCu:', cnt1('BD2_danCu'));
console.log(' BD4 truongBan:', cnt1('BD4_truongBan'));
console.log(' DAT3 trithuc:', cnt1('DAT3_trithuc'), 'nhanNuoc:', cnt1('DAT3_nhanNuoc'));
console.log(' DAT2 phanchuong:', cnt1('DAT2_phanchuong'), 'checover:', cnt1('DAT2_checover'), 'nghialand:', cnt1('DAT2_nghialand'));
console.log(' DAT5 khongGhichep:', cnt1('DAT5_khongGhichep'), 'LopTre:', cnt1('DAT5_LopTre'), 'PhanBonHoa:', cnt1('DAT5_PhanBonHoa'));
console.log(' NUOC6 phuThuoc:', cnt1('NUOC6_phuThuoc'));
console.log(' RUNG6 truyenMieng:', cnt1('RUNG6_truyenMieng'), 'LopTre:', cnt1('RUNG6_LopTre'), 'NguoiGia:', cnt1('RUNG6_NguoiGia'));
console.log(' THAMGIA_DAT:', JSON.stringify(dist('THAMGIA_DAT')));
