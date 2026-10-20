import fs from 'node:fs';

const html = fs.readFileSync('scripts/report/spss/ket_qua.html', 'utf8');
// Strip tags to text, preserving table cell separation
let text = html
  .replace(/<tr[^>]*>/gi, '\nROW ')
  .replace(/<\/t[dh][^>]*>/gi, ' | ')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#\d+;/g, '')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n');
fs.writeFileSync('scripts/report/spss/ket_qua.txt', text, 'utf8');
console.log('lines:', text.split('\n').length, 'chars:', text.length);
