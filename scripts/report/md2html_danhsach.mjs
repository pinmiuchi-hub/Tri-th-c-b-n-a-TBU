// Chuyển DanhSach_Diem_TriThucBanDia.md → HTML (bảng lớn, danh mục nguồn).
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve('artifacts/webgis/docs');
const SRC = path.join(BASE, 'DanhSach_Diem_TriThucBanDia.md');
const OUT = path.join(BASE, 'DanhSach_Diem_TriThucBanDia.html');

const CSS = `body{font-family:'Times New Roman',serif;font-size:11pt;line-height:1.3}
h1{font-size:14pt;text-align:center;margin:0 0 8px}
h2{font-size:12pt;margin:14px 0 6px}
h3{font-size:11pt;margin:12px 0 4px}
p{margin:0 0 6px;text-align:justify}
.tabcap{font-size:10pt;margin:10px 0 4px}
table{border-collapse:collapse;width:100%;margin:0 0 8px}
th,td{border:1px solid #555;padding:2px 4px;font-size:9pt;vertical-align:top}
th{background:#eee}
ol{margin:0 0 6px 20px;padding:0}
ul{margin:0 0 6px 20px;padding:0}
li{margin-bottom:3px;text-align:left;word-break:break-all}
b{font-weight:bold}
`;

const text = fs.readFileSync(SRC, 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  let t = esc(s);
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => `<a href="${url}">${txt}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<i>$2</i>');
  return t;
}

function renderTable(rows) {
  const cells = (r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(1).filter((r) => !/^\|[\s:|-]+\|?$/.test(r));
  let html = '<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
  for (const r of body) html += '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
  return html + '</tbody></table>';
}

function convert(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === '' || /^---+$/.test(line)) {
      i++;
      continue;
    }
    if (/^#{1,3} /.test(line)) {
      const lvl = /^#+/.exec(line)[0].length;
      out.push(`<h${lvl}>${inline(line.replace(/^#{1,3} /, ''))}</h${lvl}>`);
      i++;
      continue;
    }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        rows.push(lines[i].trim());
        i++;
      }
      out.push(renderTable(rows));
      continue;
    }
    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^- /, ''));
        i++;
      }
      out.push('<ul>' + items.map((it) => `<li>${inline(it)}</li>`).join('') + '</ul>');
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      out.push('<ol>' + items.map((it) => `<li>${inline(it)}</li>`).join('') + '</ol>');
      continue;
    }

    const buf = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3} |[-|] |\d+\. |---+$)/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    const para = buf.join(' ');
    if (/^\*\*Bảng\s+\d+[.:]/.test(para)) {
      out.push(`<p class="tabcap">${inline(para.replace(/^\*\*|\*\*$/g, ''))}</p>`);
    } else {
      out.push(`<p>${inline(para)}</p>`);
    }
  }
  return out;
}

const body = convert(text.split(/\r?\n/)).join('\n');
const html = [
  '<!DOCTYPE html>',
  '<html lang="vi">',
  '<head>',
  '<meta charset="utf-8">',
  '<title>Danh sách điểm tri thức bản địa — WebGIS</title>',
  `<style>${CSS}</style>`,
  '</head>',
  '<body>',
  body,
  '</body>',
  '</html>',
  '',
].join('\n');

fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
console.log(
  '  bytes:',
  Buffer.byteLength(html),
  '| tables:',
  (html.match(/<table>/g) || []).length,
  '| rows:',
  (html.match(/<tr>/g) || []).length,
  '| ol items:',
  (html.match(/<li>/g) || []).length,
);
