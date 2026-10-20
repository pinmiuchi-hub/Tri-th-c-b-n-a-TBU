$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$tmp = Join-Path $env:TEMP 'word_save_tests'
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
function L($m) { Write-Host ("[{0:HH:mm:ss.fff}] {1}" -f (Get-Date), $m) -ForegroundColor Cyan }

L 'create word'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}
try { $word.Options.ConfirmConversions = $false } catch {}
try { $word.Options.UpdateLinksAtOpen = $false } catch {}
try { $word.Options.BackgroundSave = $false } catch {}

L 'A: add blank doc'
$doc = $word.Documents.Add()
L 'A: saveas2 blank -> docx'
$a = Join-Path $tmp 'test_a.docx'
if (Test-Path $a) { Remove-Item $a -Force }
$doc.SaveAs2($a, 16)
L "A: done size=$((Get-Item $a).Length)"
$doc.Close($false)

L 'B: tiny html'
$html = Join-Path $tmp 'test_b.html'
Set-Content -Path $html -Value '<html><body><p>hello</p></body></html>' -Encoding UTF8
$doc2 = $word.Documents.Open($html, $false, $true, $false)
L 'B: saveas2 tiny html -> docx'
$b = Join-Path $tmp 'test_b.docx'
if (Test-Path $b) { Remove-Item $b -Force }
$doc2.SaveAs2($b, 16)
L "B: done size=$((Get-Item $b).Length)"
$doc2.Close($false)

$word.NormalTemplate.Saved = $true
$word.Quit()
L 'ALL DONE'
