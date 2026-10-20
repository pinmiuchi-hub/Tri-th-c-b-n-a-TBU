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
$tokMatches = @($rx.Matches($text))
Write-Host "tokens: $($tokMatches.Count)"

$fail = 0
for ($k = $tokMatches.Count - 1; $k -ge 0; $k--) {
  $m = $tokMatches[$k]
  $kind = $m.Groups[1].Value
  if ($kind.StartsWith('IMG:')) { $kind = 'IMG' }
  elseif ($kind.StartsWith('DM:')) { $kind = 'DM' }
  if ($kind -ne 'IMG') { continue }

  $r = $doc.Range($m.Index, $m.Index + $m.Length)
  $inTable = $r.Information(12)
  $paraTxt = $r.Paragraphs.Item(1).Range.Text -replace '[\r\a]', '\r'
  if ($paraTxt.Length -gt 120) { $paraTxt = $paraTxt.Substring(0,120) + '...' }
  try {
    $r.Text = ''
    # undo damage is irrelevant: doc is readonly, we only report
    Write-Host ("OK   idx={0} table={1} tok={2}" -f $m.Index, $inTable, $m.Value)
  } catch {
    $fail++
    Write-Host ("FAIL idx={0} table={1} tok={2}" -f $m.Index, $inTable, $m.Value) -ForegroundColor Red
    Write-Host ("     para: {0}" -f $paraTxt) -ForegroundColor Yellow
    Write-Host ("     err: {0}" -f $_.Exception.Message) -ForegroundColor Red
  }
}
Write-Host "IMG failures: $fail"
$doc.Close($false)
$word.Quit()
