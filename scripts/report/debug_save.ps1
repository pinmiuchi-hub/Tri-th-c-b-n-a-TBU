$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$html = Join-Path $repoRoot 'artifacts\webgis\docs\BaoCao_NghienCuu\BAO_CAO_DE_TAI_build.html'
$out = Join-Path $env:TEMP 'debug_report.docx'
if (Test-Path $out) { Remove-Item $out -Force }
function L($m) { Write-Host ("[{0:HH:mm:ss.fff}] {1}" -f (Get-Date), $m) }

L 'create word'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}
try { $word.Options.ConfirmConversions = $false } catch {}
try { $word.Options.UpdateLinksAtOpen = $false } catch {}
L 'open html (readonly)'
$doc = $word.Documents.Open($html, $false, $true, $false)
L "opened pages=$($doc.ComputeStatistics(2))"
L 'saveas2 start'
$doc.SaveAs2($out, 16)
L 'saveas2 done'
$doc.Close($false)
$word.NormalTemplate.Saved = $true
$word.Quit()
L 'quit'
if (Test-Path $out) { L "OK size=$((Get-Item $out).Length)" } else { L 'FILE MISSING' }
