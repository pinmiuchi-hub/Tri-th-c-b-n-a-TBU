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

const rows = parseCSV(fs.readFileSync('scripts/report/spss/sheet_2.csv', 'utf8').replace(/^\uFEFF/, ''));
console.log('total rows', rows.length);
// print rows 0-5 col0 and col101
for (let r = 0; r < 6; r++) {
  console.log('row', r, 'col0', JSON.stringify(rows[r][0]), 'col101', JSON.stringify(rows[r][101]));
}
// find ALL rows with col101='1' and their col0 + whether in data filter
let count = 0;
for (let r = 2; r < rows.length; r++) {
  const v = (rows[r][101] ?? '').trim();
  if (v === '1') {
    count++;
    const col0 = (rows[r][0] ?? '').trim();
    const pass = /^\d+$/.test(col0);
    if (!pass) console.log('EXCLUDED row', r, 'col0', JSON.stringify(col0), 'col1', JSON.stringify(rows[r][1]));
  }
}
console.log('total col101=1 from row2:', count);
