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
const r3 = rows[3];
console.log('--- row 3 all non-empty cells ---');
r3.forEach((v, i) => { if ((v ?? '').trim()) console.log(i, JSON.stringify(v)); });
console.log('\n--- MAPHIEU values of first 10 data-like rows ---');
for (let r = 3; r < 15; r++) {
  console.log('row', r, 'col0', JSON.stringify(rows[r][0]), 'col1', JSON.stringify(rows[r][1]), 'col4', JSON.stringify(rows[r][4]), 'col6', JSON.stringify(rows[r][6]));
}
// count MAPHIEU patterns
const mapVals = {};
for (let r = 3; r < rows.length; r++) {
  const m = (rows[r][0] ?? '').trim();
  if (m) mapVals[m] = (mapVals[m] || 0) + 1;
}
const dups = Object.entries(mapVals).filter(([k, v]) => v > 1);
console.log('\nunique MAPHIEU', Object.keys(mapVals).length, 'dups', dups);
// rows with any content but no MAPHIEU
let blankMapWithData = 0;
for (let r = 3; r < rows.length; r++) {
  const m = (rows[r][0] ?? '').trim();
  if (!m) {
    const has = r3 && rows[r].some(c => (c ?? '').trim());
    if (has) blankMapWithData++;
  }
}
console.log('blank MAPHIEU but has data:', blankMapWithData);
