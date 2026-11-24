import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve('artifacts/webgis/docs');
const SRC = path.join(BASE, 'Bai_bao_Tri_thuc_ban_dia_Phu_Yen.md');
const OUT = path.join(BASE, 'Bai_bao_Tri_thuc_ban_dia_Phu_Yen.html');

const CSS = `body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.35}
h1{font-size:14pt;text-align:center;margin:0 0 8px}
h2{font-size:13pt;margin:16px 0 6px}
h3{font-size:12pt;margin:12px 0 4px}
p{margin:0 0 6px;text-align:justify}
.fig{text-align:center;margin:6px 0 3px}
.figcap{font-size:11pt;text-align:center;margin:0 0 10px}
.tabcap{font-size:11pt;margin:10px 0 4px}
table{border-collapse:collapse;width:100%;margin:0 0 8px}
th,td{border:1px solid #555;padding:4px 6px;font-size:11pt;vertical-align:top}
th{background:#eee}
ol{margin:0 0 6px 24px;padding:0}
li{margin-bottom:4px;text-align:justify}
hr{display:none}
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
    const raw = lines[i];
    const line = raw.trim();
    if (line === '' || /^---+$/.test(line)) { i++; continue; }

    if (/^#{1,3} /.test(line)) {
      const lvl = /^#+/.exec(line)[0].length;
      out.push(`<h${lvl}>${inline(line.replace(/^#{1,3} /, ''))}</h${lvl}>`);
      i++;
      continue;
    }
    const img = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line);
    if (img) {
      out.push(`<p class="fig">@@IMG:${img[2].replace(/\\/g, '/')}@@</p>`);
      i++;
      continue;
    }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) { rows.push(lines[i].trim()); i++; }
      out.push(renderTable(rows));
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
      !/^(#{1,3} |[-|] |\!\[|\d+\. |---+$)/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    const para = buf.join(' ');
    if (/^\*\*Hình\s+\d+[.:]/.test(para)) {
      out.push(`<p class="figcap">${inline(para.replace(/^\*\*|\*\*$/g, ''))}</p>`);
    } else if (/^\*\*Bảng\s+\d+[.:]/.test(para)) {
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
  '<title>Bản đồ tri thức bản địa trên nền tảng WebGIS Tây Bắc — Phù Yên</title>',
  `<style>${CSS}</style>`,
  '</head>',
  '<body>',
  body,
  '</body>',
  '</html>',
  '',
].join('\n');

fs.writeFileSync(OUT, html, 'utf8');
const imgs = (html.match(/@@IMG:/g) || []).length;
const tables = (html.match(/<table>/g) || []).length;
console.log('Wrote', OUT);
console.log('  bytes:', Buffer.byteLength(html), '| images:', imgs, '| tables:', tables);
