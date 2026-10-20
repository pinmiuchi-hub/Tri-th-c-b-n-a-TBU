$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$docx = Join-Path $repoRoot 'artifacts\webgis\docs\BAO_CAO_NGIEN_CUU_WebGIS_TriThucBanDia_SonLa_TapChi.docx'

$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}
$doc = $word.Documents.Open($docx, $false, $true, $false)
$i = 0
foreach ($sec in $doc.Sections) { $i++; Write-Host ("sec{0}: cols={1} textWidth={2}" -f $i, $sec.PageSetup.TextColumns.Count, ($sec.PageSetup.PageWidth - $sec.PageSetup.LeftMargin - $sec.PageSetup.RightMargin)) }
Write-Host ("pages={0} words={1} inlineShapes={2} floatingShapes={3} tables={4}" -f $doc.ComputeStatistics(2), $doc.ComputeStatistics(0), $doc.InlineShapes.Count, $doc.Shapes.Count, $doc.Tables.Count)

Write-Host '--- inline shapes ---'
foreach ($ish in $doc.InlineShapes) {
  $w = [math]::Round($ish.Width,1); $h = [math]::Round($ish.Height,1)
  Write-Host ("  type={0} w={1}pt h={2}pt para='{3}'" -f $ish.Type, $w, $h, (($ish.Range.Paragraphs.Item(1).Range.Text -replace '[\r\a]',' ').Trim().Substring(0,[Math]::Min(70, $ish.Range.Paragraphs.Item(1).Range.Text.Trim().Length))))
}
Write-Host '--- floating shapes ---'
$overflow = 0
foreach ($sh in $doc.Shapes) {
  $left = [math]::Round($sh.Left,1); $w = [math]::Round($sh.Width,1)
  $right = $left + $w
  $flag = ''
  if ($right -gt 460) { $flag = '  << OVERFLOW?'; $overflow++ }
  Write-Host ("  name='{0}' left={1} w={2} right={3}{4}" -f $sh.Name, $left, $w, $right, $flag)
}
Write-Host "overflowing=$overflow"
$doc.Close($false); $word.Quit()
