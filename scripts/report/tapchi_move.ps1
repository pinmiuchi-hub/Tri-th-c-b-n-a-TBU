$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$docx = Join-Path $repoRoot 'artifacts\webgis\docs\BAO_CAO_NGIEN_CUU_WebGIS_TriThucBanDia_SonLa_TapChi.docx'
$helper = Join-Path $PSScriptRoot 'save_doc.js'
function L($m) { Write-Host ("[{0:HH:mm:ss}] {1}" -f (Get-Date), $m) }
function Find-Para([object]$doc, [string]$pattern) {
  $rng = $doc.Content
  $rng.Find.ClearFormatting()
  $ok = $rng.Find.Execute($pattern, $false, $false, $false, $false, $false, $true, 1, $false)
  if (-not $ok) { return $null }
  return $rng.Paragraphs.Item(1).Range
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}

$doc = $word.Documents.Open($docx, $false, $false, $false)
try {

$viHinh = 'H' + [char]0x00EC + 'nh'
$tgtPattern9 = $viHinh + ' 9. Tr' + [char]0x00EC + 'nh'

# capture both paragraph ranges FIRST (the InlineShapes collection reindexes
# after each cut); Word ranges auto-adjust when earlier text is removed
$p4 = $doc.InlineShapes.Item(4).Range.Paragraphs.Item(1).Range
$p9 = $doc.InlineShapes.Item(9).Range.Paragraphs.Item(1).Range

# 1) overview screenshot (inline shape #4) belongs to "Hinh 5" - move its
#    paragraph from the Hinh 3 block to just above the Hinh 5 caption
$p4.Cut()
$tgt = Find-Para $doc ($viHinh + ' 5. Giao')
if (-not $tgt) { throw 'khong tim thay caption Hinh 5' }
$doc.Range($tgt.Start, $tgt.Start).Paste()
L 'da chuyen anh tong quan len truoc caption Hinh 5'

# 2) composer screenshot (inline shape #9) belongs to "Hinh 9" - move its
#    paragraph from above the Hinh 8 caption to just above the Hinh 9 caption
$p9.Cut()
$tgt = Find-Para $doc $tgtPattern9
if (-not $tgt) { throw 'khong tim thay caption Hinh 9' }
$doc.Range($tgt.Start, $tgt.Start).Paste()
L 'da chuyen anh composer len truoc caption Hinh 9'

$doc.Repaginate()
L "pages=$($doc.ComputeStatistics(2)) words=$($doc.ComputeStatistics(0)) inline=$($doc.InlineShapes.Count)"

$o = & cscript.exe //nologo "$helper" "$docx" "$docx" 16 2>&1
if ($LASTEXITCODE -ne 0) { throw "save that bai: $o" }
L "saved: $o"

} finally {
  try { $doc.Close($false) } catch {}
  try { $word.NormalTemplate.Saved = $true } catch {}
  try { $word.Quit() } catch {}
}
L 'done'
