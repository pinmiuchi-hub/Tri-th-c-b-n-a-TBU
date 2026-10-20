import fs from 'node:fs';

for (const f of ['01_CHUONG_1.md', '04_CHUONG_4.md', '02_CHUONG_2.md', '03_CHUONG_3.md', '05_KET_LUAN.md', '06_PHU_LUC.md', 'BAO_CAO_DE_TAI.md']) {
  const p = 'artifacts/webgis/docs/BaoCao_NghienCuu/' + f;
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  let prose = '', table = 0, headings = 0;
  for (const L of lines) {
    if (/^\s*\|/.test(L)) { table++; continue; }
    if (/^#{1,6}\s/.test(L)) { headings++; prose += L.replace(/^#{1,6}\s/, '') + ' '; continue; }
    if (/^!\[/.test(L)) continue;
    prose += L + ' ';
  }
  const tw = table ? fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(L => /^\s*\|/.test(L)).join(' ').split(/\s+/).filter(Boolean).length : 0;
  const pw = prose.split(/\s+/).filter(w => w && !/^[\|\-*#>]+$/.test(w)).length;
  console.log(`${f.padEnd(20)} prose=${pw} tables=${tw} headings=${headings} total=${pw + tw}`);
}
