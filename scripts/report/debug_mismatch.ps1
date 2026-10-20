$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$base = Join-Path $repoRoot 'artifacts\webgis\docs\BaoCao_NghienCuu'
$htmlPath = Join-Path $base 'BAO_CAO_DE_TAI_build.html'

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($htmlPath, $false, $true, $false)

$text = $doc.Content.Text
Write-Host "string.Length = $($text.Length)   doc.Content.End = $($doc.Content.End)"

function CmpAt([int]$off, [int]$n) {
  if ($off + $n -gt $text.Length) { return }
  $s = $text.Substring($off, $n)
  $r = $doc.Range($off, [Math]::Min($off + $n, $doc.Content.End))
  $d = $r.Text
  $same = ($s -eq $d)
  if ($same) { Write-Host ("  off={0} SAME" -f $off) }
  else {
    Write-Host ("  off={0} DIFF" -f $off) -ForegroundColor Yellow
    Write-Host ("    str: {0}" -f (($s -replace '[\r\a]','<CR>') -replace '[^\x20-\x7E\u00C0-\u1EF9]', '?')) -ForegroundColor Yellow
    Write-Host ("    doc: {0}" -f (($d -replace '[\r\a]','<CR>') -replace '[^\x20-\x7E\u00C0-\u1EF9]', '?')) -ForegroundColor Yellow
  }
  return $same
}

# coarse scan to find first divergence
$step = 20000
$prev = $true
for ($off = 0; $off -lt $text.Length; $off += $step) {
  $s = $text.Substring($off, [Math]::Min(100, $text.Length - $off))
  $end = [Math]::Min($off + 100, $doc.Content.End)
  $d = $doc.Range($off, $end).Text
  if ($s -ne $d) {
    Write-Host "FIRST MISMATCH near off=$off" -ForegroundColor Red
    # refine byte by byte
    for ($j = $off; $j -lt $off + $step -and $j -lt $text.Length; $j++) {
      $a = $text[$j]
      $b = $doc.Range($j, $j + 1).Text[0]
      if ($a -ne $b) {
        Write-Host ("CHAR DIFF at {0}: str=U+{1:X4} '{2}'  doc=U+{3:X4} '{4}'" -f $j, [int]$a, $a, [int]$b, $b) -ForegroundColor Red
        $ctxFrom = [Math]::Max(0, $j - 60)
        Write-Host ("str ctx: {0}" -f (($text.Substring($ctxFrom, 140) -replace '[\r\a]','<CR>')))
        break
      }
    }
    break
  }
  Write-Host ("  off={0} ok" -f $off)
}

$doc.Close($false)
$word.Quit()
