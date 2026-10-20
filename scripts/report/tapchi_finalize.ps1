$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$docx = Join-Path $repoRoot 'artifacts\webgis\docs\BAO_CAO_NGIEN_CUU_WebGIS_TriThucBanDia_SonLa_TapChi.docx'
$helper = Join-Path $PSScriptRoot 'save_doc.js'
function L($m) { Write-Host ("[{0:HH:mm:ss}] {1}" -f (Get-Date), $m) }

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}

$doc = $word.Documents.Open($docx, $false, $false, $false)
try {

# floating -> inline (iterating backwards: collection shrinks on convert)
$conv = 0; $fb = 0
for ($i = $doc.Shapes.Count; $i -ge 1; $i--) {
  $sh = $doc.Shapes.Item($i)
  try {
    $ish = $sh.ConvertToInlineShape()
    $ish.LockAspectRatio = -1
    if ($ish.Width -gt 345 -or $ish.Width -lt 335) { $ish.Width = 340 }
    $ish.Range.ParagraphFormat.Alignment = 1
    $conv++
  } catch {
    try { $sh.RelativeVerticalPosition = 3; $sh.Top = 0 } catch {}
    $fb++
    L "fallback float kept: $($sh.Name)"
  }
}
L "converted to inline: $conv (fallback: $fb)"

# center captions "Hinh x.y - ..." (paragraphs beginning with H\u00ECnh)
$cap = 0
foreach ($p in $doc.Paragraphs) {
  $txt = $p.Range.Text
  if ($txt -match '^\s*H\u00ECnh\s*\d' -and -not $p.Range.Information(12)) {
    if ($p.Format.Alignment -ne 1) { $p.Format.Alignment = 1; $cap++ }
  }
}
L "captions centered: $cap"

$doc.Repaginate()
$pg = $doc.ComputeStatistics(2); $wd = $doc.ComputeStatistics(0)
$il = $doc.InlineShapes.Count; $fl = $doc.Shapes.Count
L "pages=$pg words=$wd inline=$il floating=$fl tables=$($doc.Tables.Count)"

$o = & cscript.exe //nologo "$helper" "$docx" "$docx" 16 2>&1
if ($LASTEXITCODE -ne 0) { throw "save that bai: $o" }
L "saved: $o"

} finally {
  try { $doc.Close($false) } catch {}
  try { $word.NormalTemplate.Saved = $true } catch {}
  try { $word.Quit() } catch {}
}
L 'done'
