$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$docx = Join-Path $repoRoot 'artifacts\webgis\docs\BAO_CAO_NGIEN_CUU_WebGIS_TriThucBanDia_SonLa_TapChi.docx'
$helper = Join-Path $PSScriptRoot 'save_doc.js'
function L($m) { Write-Host ("[{0:HH:mm:ss}] {1}" -f (Get-Date), $m) }

$wdShapeCenter = -999995
$wdRelativeHorizontalPositionMargin = 0
$wdWrapTopBottom = 4
$wdWithInTable = 12
$wdAlignCenter = 1
$wdAutoFitWindow = 2

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}

$doc = $word.Documents.Open($docx, $false, $false, $false)
try {

# floating figures: 12cm wide, centered in the margin area, text above/below
$n = 0
foreach ($sh in $doc.Shapes) {
  $sh.LockAspectRatio = -1
  $sh.Width = 340
  $sh.RelativeHorizontalPosition = $wdRelativeHorizontalPositionMargin
  $sh.Left = $wdShapeCenter
  try { $sh.WrapFormat.Type = $wdWrapTopBottom } catch {}
  $n++
}
L "floating shapes adjusted: $n"

# inline figures: widen unless inside a table, center their paragraph
$n = 0
foreach ($ish in $doc.InlineShapes) {
  $inT = $ish.Range.Information($wdWithInTable)
  $ish.Range.ParagraphFormat.Alignment = $wdAlignCenter
  if (-not $inT) { $ish.LockAspectRatio = -1; $ish.Width = 340 }
  $n++
}
L "inline shapes adjusted: $n (inTable untouched in width)"

# data tables (skip table 1 = article-info box): fit the single-column width
$t = 0
foreach ($tb in $doc.Tables) {
  $t++
  if ($t -eq 1) { continue }
  $tb.AutoFitBehavior($wdAutoFitWindow)
}
L "data tables autofit to window: $($t - 1)"

$doc.Repaginate()
$pg = $doc.ComputeStatistics(2)
$wd = $doc.ComputeStatistics(0)
$im = $doc.InlineShapes.Count + $doc.Shapes.Count
$tbn = $doc.Tables.Count
L "pages=$pg words=$wd imgs=$im tables=$tbn"

$o = & cscript.exe //nologo "$helper" "$docx" "$docx" 16 2>&1
if ($LASTEXITCODE -ne 0) { throw "save that bai: $o" }
L "saved: $o"

} finally {
  try { $doc.Close($false) } catch {}
  try { $word.NormalTemplate.Saved = $true } catch {}
  try { $word.Quit() } catch {}
}
L 'done'
