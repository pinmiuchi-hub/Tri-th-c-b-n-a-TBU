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

# chunked scan up to 20100
$bad = -1
for ($off = 0; $off -lt 20100; $off += 250) {
  $n = [Math]::Min(250, $text.Length - $off)
  $s = $text.Substring($off, $n)
  $d = $doc.Range($off, $off + $n).Text
  if ($s -ne $d) { $bad = $off; break }
}
Write-Host "first bad chunk: $bad"
if ($bad -ge 0) {
  for ($j = $bad; $j -lt $bad + 250; $j++) {
    $a = $text[$j]
    $b = $doc.Range($j, $j + 1).Text[0]
    if ($a -ne $b) {
      Write-Host ("FIRST CHAR DIFF at {0}: str=U+{1:X4} doc=U+{2:X4}" -f $j, [int]$a, [int]$b) -ForegroundColor Red
      $f = [Math]::Max(0, $j - 120)
      $strSlice = $text.Substring($f, 300)
      $docSlice = $doc.Range($f, [Math]::Min($f + 300, $doc.Content.End)).Text
      Write-Host "--- STRING (from $f) ---"
      Write-Host (($strSlice -replace '[\r\a\x07]','<') -replace '[\x00-\x1F]', '?')
      Write-Host "--- DOC (from $f) ---"
      Write-Host (($docSlice -replace '[\r\a\x07]','<') -replace '[\x00-\x1F]', '?')
      Write-Host ("strLen={0} docEnd={1}" -f $text.Length, $doc.Content.End)
      break
    }
  }
}
$doc.Close($false)
$word.Quit()
