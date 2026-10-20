import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const files = [
  'artifacts/webgis/docs/BAO_CAO_NGIEN_CUU_WebGIS_TriThucBanDia_SonLa_TapChi.docx',
  'artifacts/webgis/docs/BaoCao_NghienCuu/Phieu_khao_sat_TTBD_KTTH_SonLa (2) (1).docx',
];

for (const f of files) {
  console.log('===', f, '===');
  const tmp = path.join(process.env.TEMP || '.', 'docx_extract_' + path.basename(f).replace(/\W/g, '_'));
  fs.mkdirSync(tmp, { recursive: true });
  try {
    // use tar (Windows 10+ has bsdtar) to unzip
    execSync(`tar -xf "${f}" -C "${tmp}"`, { stdio: 'pipe' });
  } catch (e) {
    console.log('extract failed', e.message);
    continue;
  }
  const docXml = path.join(tmp, 'word', 'document.xml');
  if (!fs.existsSync(docXml)) { console.log('no document.xml'); continue; }
  const xml = fs.readFileSync(docXml, 'utf8');
  // strip tags
  const text = xml.replace(/<w:tab[^>]*\/>/g, '\t').replace(/<w:br[^>]*\/>/g, '\n').replace(/<[^>]+>/g, '');
  const lines = text.split(/\n/);
  // search for 41,1 / 41.1 / 43,1 / H�nh 3.5
  const re = /41[.,]1|43[.,]1|Hình 3\.5|Hình 3\.15|27\s*=\s*4|28\s*=\s*4|app|ứng dụng/i;
  text.split(/(?<=[.!?])\s+/).forEach((seg, i) => {
    if (/41[.,]1/.test(seg)) console.log('SEG', i, seg.slice(0, 300));
  });
  // also find caption-like contexts
  const idx411 = text.indexOf('41,1');
  const idx41dot = text.indexOf('41.1');
  console.log('idx 41,1 =', idx411, ' idx 41.1 =', idx41dot);
  if (idx411 >= 0) console.log('ctx:', text.slice(Math.max(0, idx411 - 200), idx411 + 200));
  if (idx41dot >= 0) console.log('ctx:', text.slice(Math.max(0, idx41dot - 200), idx41dot + 200));
  // count images
  const media = path.join(tmp, 'word', 'media');
  if (fs.existsSync(media)) {
    const imgs = fs.readdirSync(media);
    console.log('media files:', imgs.length);
  }
}
console.log('DONE');
