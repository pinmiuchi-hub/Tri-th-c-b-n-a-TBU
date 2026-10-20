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

const base = 'scripts/report/spss';
const rows = parseCSV(fs.readFileSync(path.join(base, 'sheet_2.csv'), 'utf8').replace(/^\uFEFF/, ''));
const h1 = rows[0], h2 = rows[1], h3 = rows[2];

// Dump all 3 header rows for every column so we can map multi-response sub-columns
const out = [];
for (let i = 0; i < 121; i++) {
  out.push([
    i,
    (h1[i] || '').trim().replace(/\s+/g, ' '),
    (h2[i] || '').trim().replace(/\s+/g, ' '),
    (h3[i] || '').trim().replace(/\s+/g, ' '),
  ].join('\t'));
}
fs.writeFileSync(path.join(base, 'full_headers.tsv'), out.join('\n'), 'utf8');
console.log('wrote full_headers.tsv');

// Also dump first 2 data rows fully
const data = rows.slice(3).filter(r => r[0] && /^\d+$/.test(r[0].trim()));
const sample = data.slice(0, 2).map((r, di) => {
  const parts = [`--- data row ${di} (MAPHIEU=${r[0]}) ---`];
  for (let i = 0; i < 121; i++) {
    if ((r[i] || '').trim()) parts.push(`  [${i}] ${JSON.stringify(r[i])}  << ${(h2[i] || h1[i] || '').slice(0, 50)}`);
  }
  return parts.join('\n');
});
fs.writeFileSync(path.join(base, 'sample_rows.txt'), sample.join('\n'), 'utf8');
console.log('wrote sample_rows.txt');
