$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$docx = Join-Path $repoRoot 'artifacts\webgis\docs\BAO_CAO_NGIEN_CUU_WebGIS_TriThucBanDia_SonLa_TapChi.docx'
$helper = Join-Path $PSScriptRoot 'save_doc.js'
function L($m) { Write-Host ("[{0:HH:mm:ss}] {1}" -f (Get-Date), $m) }

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try { $word.Options.SaveNormalPrompt = $false } catch {}

$doc = $word.Documents.Open($docx, $false, $false, $false)
try {

# table-source notes ("Nguon: ...") that directly follow a table must stay
# justified like body text, not centered
$fix = 0
foreach ($p in $doc.Paragraphs) {
  $t = $p.Range.Text
  if ($t -match '^\s*Ngu\u1ED3n\s*:') {
    $prev = $doc.Range($p.Range.Start - 1, $p.Range.Start)
    if ($prev.Information(12)) {
      if ($p.Format.Alignment -eq 1) { $p.Format.Alignment = 3; $fix++ }
    }
  }
}
L "table-note realigned to justify: $fix"

$doc.Repaginate()
L "pages=$($doc.ComputeStatistics(2)) words=$($doc.ComputeStatistics(0))"

$o = & cscript.exe //nologo "$helper" "$docx" "$docx" 16 2>&1
if ($LASTEXITCODE -ne 0) { throw "save that bai: $o" }
L "saved: $o"

} finally {
  try { $doc.Close($false) } catch {}
  try { $word.NormalTemplate.Saved = $true } catch {}
  try { $word.Quit() } catch {}
}
L 'done'
