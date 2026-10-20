$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$docx = Join-Path $repoRoot 'artifacts\webgis\docs\BaoCao_NghienCuu\BAO_CAO_DE_TAI.docx'

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}
$doc = $word.Documents.Open($docx, $false, $true, $false)

Write-Host ("pages={0} words={1}" -f $doc.ComputeStatistics(2), $doc.ComputeStatistics(0))
Write-Host ("images(InlineShapes)={0}  expected=15" -f $doc.InlineShapes.Count)
Write-Host ("tables={0}  toc={1}" -f $doc.Tables.Count, $doc.TablesOfContents.Count)

$pageref = 0
foreach ($f in $doc.Fields) { if ($f.Code.Text -match 'PAGEREF') { $pageref++ } }
Write-Host ("PAGEREF fields={0}  expected=79" -f $pageref)

# no raw tokens left
$fr = $doc.Content
$find = $fr.Find
$find.Text = '@@'
$find.Forward = $true
$find.Wrap = 0
$find.MatchWildcards = $false
$atAt = $find.Execute()
Write-Host ("raw '@@' found={0}  expected=False" -f $atAt)

# each image followed (within 3 paragraphs) by a 'Hình x.y —' caption?
$capRx = 'H' + [char]0x1ECB + 'nh\s+[0-9]'
$bad = 0
for ($i = 1; $i -le $doc.InlineShapes.Count; $i++) {
  $sh = $doc.InlineShapes.Item($i)
  $after = $doc.Range($sh.Range.End, [Math]::Min($sh.Range.End + 600, $doc.Content.End))
  $t = ($after.Paragraphs | Select-Object -First 3 | ForEach-Object { $_.Range.Text }) -join ''
  if ($t -notmatch $capRx) { $bad++; Write-Host "  image ${i}: NO caption near -> $(($t -replace '[\r\a]', ' ').Substring(0, [Math]::Min(100, $t.Length)))" -ForegroundColor Yellow }
}
Write-Host ("images without nearby caption={0}  expected=0" -f $bad)

# chapter heading pages (like count_pages)
$total = $doc.ComputeStatistics(2)
$rows = @()
foreach ($p in $doc.Paragraphs) {
  if ($p.OutlineLevel -eq 1) {
    $t = $p.Range.Text.Trim([char]13, [char]7, ' ')
    if ($t) { $rows += [pscustomobject]@{ Page = $p.Range.Information(3); Text = $t.Substring(0, [Math]::Min(60, $t.Length)) } }
  }
}
for ($i = 0; $i -lt $rows.Count; $i++) {
  $end = if ($i + 1 -lt $rows.Count) { $rows[$i+1].Page - 1 } else { $total }
  Write-Host ("  p{0,3}-p{1,3} ({2,3}) {3}" -f $rows[$i].Page, $end, ($end - $rows[$i].Page + 1), $rows[$i].Text)
}

$doc.Close($false)
$word.Quit()
