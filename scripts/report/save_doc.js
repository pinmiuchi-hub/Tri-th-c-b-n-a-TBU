// Attach to a running Word instance and save the specified document.
// Usage:
//   cscript save_doc.js <src> <dst> [fmt]     save doc matching src to dst
//   cscript save_doc.js <src> -               probe only: exit 0 if doc found
// Word instances created by a killed PowerShell host can linger as zero-document
// zombies in the ROT, so retry the attach until the document shows up.
var args = WScript.Arguments;
if (args.length < 2) { WScript.Echo("usage: save_doc.js <src> <dst> [fmt]"); WScript.Quit(1); }
var src = args(0), dst = args(1), fmt = args.length > 2 ? parseInt(args(2), 10) : 16;
var probeOnly = (dst === '-');

function findDoc() {
  var word, ok = false;
  try { word = GetObject('', 'Word.Application'); } catch (e) { return null; }
  for (var i = 1; i <= word.Documents.Count; i++) {
    var d = word.Documents.Item(i);
    try {
      if (d.FullName === src || d.Name === src ||
          d.FullName.toLowerCase() === src.toLowerCase() ||
          d.Name.toLowerCase() === src.toLowerCase()) {
        return { word: word, doc: d };
      }
    } catch (e2) {}
  }
  return null;
}

var found = null;
for (var attempt = 0; attempt < 12; attempt++) {
  found = findDoc();
  if (found) break;
  WScript.Sleep(1000);
}

if (!found) {
  WScript.Echo("ERR: document not found after retries: " + src);
  WScript.Quit(2);
}
if (probeOnly) { WScript.Echo("FOUND " + found.doc.Name); WScript.Quit(0); }

try {
  found.doc.SaveAs2(dst, fmt);
  WScript.Echo("SAVED " + dst);
} catch (e) {
  WScript.Echo("ERR: " + e.message);
  WScript.Quit(3);
}
