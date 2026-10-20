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
try { $word.Options.ConfirmConversions = $false } catch {}

$doc = $word.Documents.Open($docx, $false, $false, $false)
$prePages = $doc.ComputeStatistics(2); $preWords = $doc.ComputeStatistics(0)
$preImgs = $doc.InlineShapes.Count; $preTables = $doc.Tables.Count
L "before: pages=$prePages words=$preWords imgs=$preImgs tables=$preTables"

foreach ($sec in $doc.Sections) {
  $cols = $sec.PageSetup.TextColumns.Count
  $sec.PageSetup.TextColumns.SetCount(1)
  L "section: cols $cols -> 1"
}

# figures were sized to the 2-column width (~215pt); widen them for the
# single-column layout (max text width ~453pt), keep aspect ratio
$widened = 0
foreach ($ish in $doc.InlineShapes) {
  if ($ish.Width -ge 190 -and $ish.Width -le 245) { $ish.Width = 400; $widened++ }
}
L "widened $widened images to 400pt (14.1cm)"

$doc.Repaginate()
$postPages = $doc.ComputeStatistics(2); $postWords = $doc.ComputeStatistics(0)
L "after: pages=$postPages words=$postWords imgs=$($doc.InlineShapes.Count) tables=$($doc.Tables.Count)"

$o = & cscript.exe //nologo "$helper" "$docx" "$docx" 16 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "LOI save: $o" -ForegroundColor Red; $doc.Close($false); $word.Quit(); exit 1 }
L "saved (cscript): $o"

$doc.Close($false)
$word.NormalTemplate.Saved = $true
$word.Quit()
L 'done'
