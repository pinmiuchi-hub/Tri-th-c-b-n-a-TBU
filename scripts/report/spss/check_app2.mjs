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
const data = rows.slice(3).filter(r => r[0] && /^\d+$/.test(r[0].trim()));
console.log('data rows', data.length);
let ones = 0, xes = 0, others = [];
for (const r of data) {
  const v = (r[101] ?? '').trim();
  if (v === '1') ones++;
  else if (v === 'x' || v === 'X' || v === 'Có') xes++;
  else if (v) others.push(r[0] + '=' + JSON.stringify(v));
}
console.log('col101 ones', ones, 'xes', xes, 'others', others);

// Print all rows with MAPHIEU and col101
for (const r of data) {
  const v = (r[101] ?? '').trim();
  if (v) console.log('MAPHIEU', r[0], 'col101', JSON.stringify(v));
}
