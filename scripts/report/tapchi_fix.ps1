$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$docx = Join-Path $repoRoot 'artifacts\webgis\docs\BAO_CAO_NGIEN_CUU_WebGIS_TriThucBanDia_SonLa_TapChi.docx'
$helper = Join-Path $PSScriptRoot 'save_doc.js'
function L($m) { Write-Host ("[{0:HH:mm:ss}] {1}" -f (Get-Date), $m) }
function RealText([string]$s) {
  if (-not $s) { return $false }
  $s = $s -replace "[\r\a\x07\v]", ''
  $s = $s -replace [char]0xFFFC, ''
  $s = $s.Trim()
  return ($s.Length -gt 0)
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}

$doc = $word.Documents.Open($docx, $false, $false, $false)
try {

# snapshot shapes, process from bottom to top so earlier positions stay valid
$shapes = @()
foreach ($ish in $doc.InlineShapes) { $shapes += $ish }
$shapes = $shapes | Sort-Object { $_.Range.Start } -Descending

$split = 0
foreach ($ish in $shapes) {
  $r = $ish.Range
  $para = $r.Paragraphs.Item(1).Range
  $pStart = $para.Start
  $before = $para.Text.Substring(0, [Math]::Min($r.Start - $pStart, $para.Text.Length))
  $aftStart = $r.End - $pStart
  $after = ''
  if ($aftStart -lt $para.Text.Length) { $after = $para.Text.Substring($aftStart) }

  if (RealText $after) {
    $z = $doc.Range($r.End, $r.End)
    $z.InsertParagraphAfter()
    $split++
  }
  if (RealText $before) {
    $z = $doc.Range($r.Start, $r.Start)
    $z.InsertParagraphBefore()
    $split++
  }
}
L "split breaks inserted: $split"

# image paragraphs: single line spacing (rule=4 "Exactly 14pt" was clipping
# inline images to a 14pt sliver) + centered
$n = 0
foreach ($ish in $doc.InlineShapes) {
  $p = $ish.Range.Paragraphs.Item(1)
  $p.Format.LineSpacingRule = 0
  $p.Format.Alignment = 1
  $n++
}
L "image paragraphs fixed: $n"

# caption/source paragraphs directly above/below images: keep centered text
$n = 0
foreach ($p in $doc.Paragraphs) {
  $t = $p.Range.Text
  if ($t -match '^\s*(H\u00ECnh\s*\d|Ngu\u1ED3n\s*:)' -and -not $p.Range.Information(12)) {
    if ($p.Format.Alignment -ne 1) { $p.Format.Alignment = 1; $n++ }
    $n2 = 0
  }
}
L "caption/source centered (changes): $n"

$doc.Repaginate()
$pg = $doc.ComputeStatistics(2); $wd = $doc.ComputeStatistics(0)
L "pages=$pg words=$wd inline=$($doc.InlineShapes.Count) float=$($doc.Shapes.Count)"

$o = & cscript.exe //nologo "$helper" "$docx" "$docx" 16 2>&1
if ($LASTEXITCODE -ne 0) { throw "save that bai: $o" }
L "saved: $o"

} finally {
  try { $doc.Close($false) } catch {}
  try { $word.NormalTemplate.Saved = $true } catch {}
  try { $word.Quit() } catch {}
}
L 'done'
