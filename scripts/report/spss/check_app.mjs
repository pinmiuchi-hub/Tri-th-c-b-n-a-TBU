import fs from 'fs';

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else q = false;
      } else cell += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); cell = ''; rows.push(row); row = []; }
      else if (c !== '\r') cell += c;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const rows = parseCSV(fs.readFileSync('scripts/report/spss/sheet_2.csv', 'utf8'));
console.log('rows', rows.length, 'cols0', rows[0].length, 'cols1', rows[1].length);
const h = rows[1];
let appCol = -1;
h.forEach((v, i) => { if (/ứng dụng số trên điện thoại/i.test(v)) appCol = i; });
console.log('appCol', appCol, JSON.stringify(h[appCol]));
const counts = {}; let nonEmpty = 0;
for (let r = 2; r < rows.length; r++) {
  const v = (rows[r][appCol] || '').trim();
  if (v) { nonEmpty++; counts[v] = (counts[v] || 0) + 1; }
}
console.log('nonEmpty', nonEmpty, counts);

// Also dump all PHAN3 cols with their value counts
console.log('\n--- all non-empty cols from col 100+ ---');
for (let c = 100; c < h.length; c++) {
  const cnt = {};
  let ne = 0;
  for (let r = 2; r < rows.length; r++) {
    const v = (rows[r][c] || '').trim();
    if (v) { ne++; cnt[v] = (cnt[v] || 0) + 1; }
  }
  if (ne) console.log(c, JSON.stringify(h[c]).slice(0, 80), '=>', ne, JSON.stringify(cnt).slice(0, 200));
}
