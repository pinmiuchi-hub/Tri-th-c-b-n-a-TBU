$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$tmp = Join-Path $env:TEMP 'word_save_tests'
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
function L($m) { Write-Host ("[{0:HH:mm:ss.fff}] {1}" -f (Get-Date), $m) -ForegroundColor Cyan }

$format = [int]$args[0]   # 2=txt 0=doc 16=docx 12=xml
if (-not $args[0]) { $format = 2 }

L "create word (format=$format)"
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}
try { $word.Options.BackgroundSave = $false } catch {}

L 'add blank doc'
$doc = $word.Documents.Add()
$doc.Content.Text = 'test content'
$ext = switch ($format) { 2 {'txt'} 0 {'doc'} 12 {'docx'} 16 {'docx'} default {'bin'} }
$out = Join-Path $tmp "test_fmt$format.$ext"
if (Test-Path $out) { Remove-Item $out -Force }
L "saveas2 start -> $out"
$doc.SaveAs2($out, $format)
L "saveas2 done size=$((Get-Item $out).Length)"
$doc.Close($false)
$word.NormalTemplate.Saved = $true
$word.Quit()
L 'DONE'
