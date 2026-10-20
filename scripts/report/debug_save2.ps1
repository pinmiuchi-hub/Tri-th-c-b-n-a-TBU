$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$html = Join-Path $repoRoot 'artifacts\webgis\docs\BaoCao_NghienCuu\BAO_CAO_DE_TAI_build.html'
$helper = Join-Path $PSScriptRoot 'save_doc.js'
$out = Join-Path $env:TEMP 'debug_report2.docx'
if (Test-Path $out) { Remove-Item $out -Force }
function L($m) { Write-Host ("[{0:HH:mm:ss.fff}] {1}" -f (Get-Date), $m) }

L 'create word (powershell)'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}
try { $word.Options.ConfirmConversions = $false } catch {}
try { $word.Options.UpdateLinksAtOpen = $false } catch {}
L 'open html (readonly)'
$doc = $word.Documents.Open($html, $false, $true, $false)
L "opened pages=$($doc.ComputeStatistics(2)) name=$($doc.Name)"

L 'delegate SaveAs2 to cscript'
$o = & cscript.exe //nologo "$helper" "$html" "$out" 16 2>&1
L "helper exit=$LASTEXITCODE out=$o"

if (Test-Path $out) { L "OK size=$((Get-Item $out).Length)" } else { L 'FILE MISSING'; exit 1 }
$doc.Close($false)
$word.NormalTemplate.Saved = $true
$word.Quit()
L 'quit powershell-side done'
