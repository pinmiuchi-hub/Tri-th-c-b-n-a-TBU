$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$docx = Join-Path $repoRoot 'artifacts\webgis\docs\BaoCao_NghienCuu\BAO_CAO_DE_TAI.docx'
if (-not (Test-Path $docx)) { Write-Host "MISSING $docx"; exit 1 }
$f = Get-Item $docx
Write-Host ("file: {0} bytes  modified {1}" -f $f.Length, $f.LastWriteTime)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}
$doc = $word.Documents.Open($docx, $false, $true, $false)
$total = $doc.ComputeStatistics(2)
Write-Host "total pages=$total words=$($doc.ComputeStatistics(0))"

$rows = @()
foreach ($p in $doc.Paragraphs) {
  if ($p.OutlineLevel -eq 1) {   # wdOutlineLevel1 = Heading 1
    $t = $p.Range.Text.Trim([char]13, [char]7, ' ')
    if ($t) {
      $rows += [pscustomobject]@{
        Page = $p.Range.Information(3)   # wdActiveEndPageNumber
        Text = $t
      }
    }
  }
}
for ($i = 0; $i -lt $rows.Count; $i++) {
  $end = if ($i + 1 -lt $rows.Count) { $rows[$i+1].Page - 1 } else { $total }
  Write-Host ("  p{0,3}-p{1,3} ({2,3} trang)  {3}" -f $rows[$i].Page, $end, ($end - $rows[$i].Page + 1), $rows[$i].Text)
}
$doc.Close($false)
$word.Quit()
