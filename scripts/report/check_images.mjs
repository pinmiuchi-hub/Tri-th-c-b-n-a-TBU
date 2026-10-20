import fs from 'fs';
import path from 'path';

const dir = 'artifacts/webgis/docs/BaoCao_NghienCuu/images';

function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function jpgSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0xd9) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

const files = fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
const small = [];
for (const f of files.sort()) {
  const buf = fs.readFileSync(path.join(dir, f));
  const sz = f.toLowerCase().endsWith('.png') ? pngSize(buf) : jpgSize(buf);
  const status = sz ? (sz.w >= 2400 ? 'OK' : 'SMALL') : 'UNKNOWN';
  if (status !== 'OK') small.push({ f, sz, status });
  console.log(`${status.padEnd(8)} ${f} ${sz ? sz.w + 'x' + sz.h : '?'}`);
}
console.log('\nNeed upscaling:', small.length);
