$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
function L($m) { Write-Host ("[{0:HH:mm:ss.fff}] {1}" -f (Get-Date), $m) -ForegroundColor Cyan }

$tmp = Join-Path $env:TEMP 'word_save_tests'
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

L 'attach running word (/a)'
$word = [Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$word.DisplayAlerts = 0

L 'add blank doc'
$doc = $word.Documents.Add()
$doc.Content.Text = 'test content safe mode'
$out = Join-Path $tmp 'test_safemode.txt'
if (Test-Path $out) { Remove-Item $out -Force }
L 'saveas2 start'
$doc.SaveAs2($out, 2)
L "saveas2 done size=$((Get-Item $out).Length)"
$doc.Close($false)
$word.NormalTemplate.Saved = $true
$word.Quit()
L 'DONE'
