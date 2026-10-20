// Export a docx to PDF from a fresh Word instance.
// PowerShell's COM export/save calls hang on this machine; cscript works.
// Usage: cscript //nologo export_pdf.js <src.docx> <out.pdf>
var args = WScript.Arguments;
if (args.length < 2) { WScript.Echo("usage: export_pdf.js <src> <dst>"); WScript.Quit(1); }
var src = args(0), dst = args(1);

var word = new ActiveXObject("Word.Application");
word.Visible = false;
word.DisplayAlerts = 0;
try { word.Options.SaveNormalPrompt = false; } catch (e) {}
try { word.Options.ConfirmConversions = false; } catch (e) {}
try { word.Options.UpdateLinksAtOpen = false; } catch (e) {}

var doc = word.Documents.Open(src, false, true, false);
doc.ExportAsFixedFormat(dst, 17); // wdExportFormatPDF
doc.Close(false);
word.Quit();
WScript.Echo("PDF " + dst);
