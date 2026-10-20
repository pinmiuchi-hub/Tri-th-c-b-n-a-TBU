import fs from 'node:fs';
import path from 'node:path';

// ---- CSV parser ----
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

const base = 'scripts/report/spss';
const rows = parseCSV(fs.readFileSync(path.join(base, 'sheet_2.csv'), 'utf8').replace(/^\uFEFF/, ''));
const h2 = rows[1];
console.log('cols:', h2.length, 'rows:', rows.length);

// data rows: skip first 3 meta rows; keep rows with Ma phieu
const data = rows.slice(3).filter(r => r[0] && r[0].trim() && /^\d+$/.test(r[0].trim()));
console.log('data rows:', data.length);

// dump column map: index -> header
const map = [];
for (let i = 0; i < h2.length; i++) {
  const label = (h2[i] || '').trim().replace(/\s+/g, ' ');
  if (label) map.push({ i, label });
}
fs.writeFileSync(path.join(base, 'col_map.txt'), map.map(m => `${m.i}\t${m.label}`).join('\n'), 'utf8');
console.log('wrote col_map.txt', map.length, 'labeled cols');

// print headers compactly
for (const m of map) console.log(m.i, m.label.slice(0, 70));
