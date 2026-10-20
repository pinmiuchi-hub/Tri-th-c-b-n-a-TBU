import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve('artifacts/webgis/docs/BaoCao_NghienCuu');
// Primary build artifact: never previewed in browser, so it is never file-locked.
const OUT = path.join(BASE, 'BAO_CAO_DE_TAI_build.html');
// Convenience copy for preview; skipped silently when the user has it open.
const OUT_PREVIEW = path.join(BASE, 'BAO_CAO_DE_TAI.html');

const FRONT_EXPANSION = [
  'front/03_MUC_LUC.md',
  'front/04_DANH_MUC_BANG_BIEU.md',
  'front/05_DANH_MUC_HINH.md',
  'front/06_DANH_MUC_TU_VIET_TAT.md',
  'front/07_MAU_04.md',
  'front/08_MAU_05.md',
].filter((f) => fs.existsSync(path.join(BASE, f)));

const MANIFEST = [
  'front/01_BIA.md',
  'front/02_BIA_PHU.md',
  'BAO_CAO_DE_TAI.md',
  '01_CHUONG_1.md',
  '02_CHUONG_2.md',
  '03_CHUONG_3.md',
  '04_CHUONG_4.md',
  '05_KET_LUAN.md',
  '06_PHU_LUC.md',
];

const read = (rel) => fs.readFileSync(path.join(BASE, rel), 'utf8');

const PB_PARA = '<p>@@PB@@</p>';

// ---------- pass 1: collect captions ----------
const tableCaps = [];
const figureCaps = [];

function scanCaptions(text, file) {
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    let m = /^\*\*Bảng\s+([A-Za-z0-9]+(?:\.[0-9]+)+)\.\s*(.+?)\*\*$/.exec(line);
    if (m) {
      tableCaps.push({
        id: 'b_' + m[1].replace(/\./g, '_'),
        text: `Bảng ${m[1]}. ${m[2]}`.replace(/\s+/g, ' '),
        file,
      });
      continue;
    }
    m = /^\*(Hình\s+[0-9]+(?:\.[0-9]+)?)\s*[—–-]\s*(.+?)\*$/.exec(line);
    if (m) {
      figureCaps.push({
        id: 'h_' + m[1].replace(/[^\d.]/g, '').replace(/\./g, '_'),
        text: `${m[1]} — ${m[2]}`.replace(/\s+/g, ' '),
        file,
      });
    }
  }
}

for (const f of MANIFEST) scanCaptions(read(f), f);

// ---------- inline ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  let t = esc(s);
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => `<a href="${url}">${txt}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<i>$2</i>');
  return t;
}

const captionIdTable = (text) => {
  const m = /^\*\*Bảng\s+([A-Za-z0-9]+(?:\.[0-9]+)+)\./.exec(text.trim());
  return m ? 'b_' + m[1].replace(/\./g, '_') : null;
};
const captionIdFig = (text) => {
  const m = /^\*(Hình\s+[0-9]+(?:\.[0-9]+)?)\s*[—–-]/.exec(text.trim());
  return m ? 'h_' + m[1].replace(/[^\d.]/g, '').replace(/\./g, '_') : null;
};

function renderTable(rows) {
  const cells = (r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(1).filter((r) => !/^\|[\s:|-]+\|?$/.test(r));
  let html = '<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
  for (const r of body) html += '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
  return html + '</tbody></table>';
}

function convertBlock(lines) {
  const out = [];
  let i = 0;
  const push = (html) => {
    const isBreak = html === PB_PARA;
    if (isBreak && out[out.length - 1] === PB_PARA) return;
    out.push(html);
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line === '') { i++; continue; }
    if (line === '[[PB]]') { push(PB_PARA); i++; continue; }
    if (line === '[[TOC]]') { out.push('<p>@@TOC@@</p>'); i++; continue; }
    if (line === '[[DANH_MUC_BANG_BIEU]]') {
      for (const c of tableCaps) out.push(`<p class="dm">@@DM:${c.id}|${esc(c.text)}@@</p>`);
      i++; continue;
    }
    if (line === '[[DANH_MUC_HINH]]') {
      for (const c of figureCaps) out.push(`<p class="dm">@@DM:${c.id}|${esc(c.text)}@@</p>`);
      i++; continue;
    }
    if (/^#{1,3} /.test(line)) {
      const level = /^#+/.exec(line)[0].length;
      const text = line.replace(/^#{1,3} /, '');
      out.push(`<h${level}>${inline(text)}</h${level}>`);
      i++; continue;
    }
    if (/^!\[/.test(line)) {
      const m = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line);
      if (m) {
        out.push(`<p class="fig">@@IMG:${m[2].replace(/\\/g, '/')}@@</p>`);
        i++; continue;
      }
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
    if (/^---+$/.test(line)) { i++; continue; }

    // raw HTML line (used by cover pages)
    if (/^<[a-zA-Z!/?]/.test(line)) {
      out.push(line);
      i++;
      continue;
    }

    const buf = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3} |[-|] |\!\[|\[\[|---+$|<[a-zA-Z!])/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    const para = buf.join(' ');
    const figId = captionIdFig(para);
    const tabId = captionIdTable(para);
    if (figId) {
      out.push(`<p class="figcap"><a name="${figId}"></a><i>${inline(para.replace(/^\*|\*$/g, ''))}</i></p>`);
    } else if (tabId) {
      out.push(`<p class="tabcap"><a name="${tabId}"></a>${inline(para.replace(/^\*\*|\*\*$/g, ''))}</p>`);
    } else {
      out.push(`<p>${inline(para)}</p>`);
    }
  }
  return out.join('\n');
}

function main() {
  const parts = [fs.readFileSync(path.join(BASE, 'front/template_head.html'), 'utf8')];
  let firstHeadingDone = false;

  const emit = (body) => {
    const lines = [];
    for (const l of body.split(/\r?\n/)) {
      const isH1 = /^# /.test(l.trim());
      if (isH1 && firstHeadingDone) lines.push('[[PB]]');
      if (isH1) firstHeadingDone = true;
      lines.push(l);
    }
    parts.push(convertBlock(lines));
  };

  for (const f of MANIFEST) {
    const text = read(f);
    if (f === 'BAO_CAO_DE_TAI.md') {
      const idx = text.indexOf('[MUC_LUC]');
      if (idx < 0) throw new Error('Khong thay [MUC_LUC] trong ' + f);
      const rest = text.slice(idx + '[MUC_LUC]'.length).trim();
      for (const ff of FRONT_EXPANSION) emit('\n\n' + read(ff) + '\n');
      emit('\n\n' + rest + '\n');
      continue;
    }
    emit(text);
  }

  parts.push('</body>\n</html>\n');
  const html = parts.join('\n');
  fs.writeFileSync(OUT, html, 'utf8');
  try {
    fs.writeFileSync(OUT_PREVIEW, html, 'utf8');
  } catch {
    console.log('Note: preview copy skipped (BAO_CAO_DE_TAI.html is open elsewhere)');
  }

  console.log('Wrote', OUT);
  console.log('  bytes:', Buffer.byteLength(html));
  console.log('  h1:', (html.match(/<h1>/g) || []).length,
    'h2:', (html.match(/<h2>/g) || []).length,
    'h3:', (html.match(/<h3>/g) || []).length);
  console.log('  tables:', (html.match(/<table>/g) || []).length,
    '| images:', (html.match(/@@IMG:/g) || []).length,
    '| pagebreaks:', (html.match(/page-break-after/g) || []).length);
  console.log('  danh muc:', (html.match(/@@DM:/g) || []).length,
    '(bang:', tableCaps.length, '| hinh:', figureCaps.length + ')');
  console.log('  toc:', (html.match(/@@TOC@@/g) || []).length);
}

main();
