$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$base = Join-Path $repoRoot 'artifacts\webgis\docs\BaoCao_NghienCuu'
$htmlPath = Join-Path $base 'BAO_CAO_DE_TAI_build.html'

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}
$doc = $word.Documents.Open($htmlPath, $false, $true, $false)

$text = $doc.Content.Text
$rx = [regex]'@@(PB|TOC|IMG:[^\s@]+|DM:[A-Za-z0-9_]+\|[^\x00]*?)@@'
foreach ($m in $rx.Matches($text)) {
  if ($m.Value -notlike '*bd_3_6*') { continue }
  $i = $m.Index
  Write-Host "MATCH idx=$i len=$m.Length val=$($m.Value)"
  $from = [Math]::Max(0, $i - 180)
  $to = [Math]::Min($text.Length, $i + $m.Length + 180)
  $ctx = $text.Substring($from, $to - $from) -replace '[\r\a]', '<CR>'
  Write-Host "CTX: $ctx"
  $r = $doc.Range($i, $i + $m.Length)
  Write-Host "range.Text = $($r.Text -replace '[\r\a]', '<CR>')"
  Write-Host "range.Start=$($r.Start) End=$($r.End) Content.End=$($doc.Content.End)"
  Write-Host "para of range start: $($r.Paragraphs.Item(1).Range.Text.Substring(0, [Math]::Min(200, $r.Paragraphs.Item(1).Range.Text.Length)) -replace '[\r\a]', '<CR>')"
}
$doc.Close($false)
$word.Quit()
