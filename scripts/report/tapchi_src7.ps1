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

# locate the orphaned source line "so lieu [2], [17]" (belongs to Hinh 7)
$srcPara = $null
foreach ($p in $doc.Paragraphs) {
  $t = $p.Range.Text
  if ($t.Contains('[2], [17]') -and $t.TrimStart().StartsWith('N')) { $srcPara = $p.Range; break }
}
if (-not $srcPara) { throw 'khong tim thay dong nguon [2], [17]' }

$cap7 = Find-Para $doc ($viHinh + ' 7.')
if (-not $cap7) { throw 'khong tim thay caption Hinh 7' }

$srcPara.Copy()
$doc.Range($cap7.End, $cap7.End).Paste()
$srcPara.Delete() | Out-Null
L 'da chuyen nguon [2],[17] ve duoi caption Hinh 7'

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
