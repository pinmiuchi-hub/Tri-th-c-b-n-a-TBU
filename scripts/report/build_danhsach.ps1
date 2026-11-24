# Build DanhSach_Diem_TriThucBanDia.docx from its HTML.
# Usage (repo root):  powershell -File scripts/report/build_danhsach.ps1
param(
  [switch]$NoHtml   # reuse existing HTML instead of regenerating it
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ---- constants (Wd*) ----
$wdCollapseStart = 1
$wdFindStop = 0
$wdAlignLeft = 0
$wdAlignCenter = 1
$wdAlignJustify = 3
$wdLineSpaceMultiple = 5
$wdStyleNormal = -1
$wdStyleHeading1 = -2
$wdStyleHeading2 = -3
$wdStyleHeading3 = -4
$wdOutlineLevelBodyText = 10
$wdWithInTable = 12
$wdFooterPrimary = 1
$wdAlignPageNumberCenter = 1
$wdFormatXMLDocument = 16
$msoTrue = -1
$cm = 28.3465

$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$base = Join-Path $repoRoot 'artifacts\webgis\docs'
$htmlPath = Join-Path $base 'DanhSach_Diem_TriThucBanDia.html'
$docxPath = Join-Path $base 'DanhSach_Diem_TriThucBanDia.docx'

function Fail([string]$msg) { Write-Host "LOI: $msg" -ForegroundColor Red; exit 1 }

# ---- 0. preconditions ----
if (-not $NoHtml) {
  Write-Host '==> md2html_danhsach.mjs'
  node (Join-Path $PSScriptRoot 'md2html_danhsach.mjs')
  if ($LASTEXITCODE -ne 0) { Fail 'md2html loi' }
}
if (-not (Test-Path $htmlPath)) { Fail "thieu $htmlPath" }

# same Word-instance hygiene as build_article.ps1
$initialWordPids = @(Get-Process WINWORD -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
$leftovers = @(Get-Process WINWORD -ErrorAction SilentlyContinue | Where-Object { $initialWordPids -notcontains $_.Id })
if ($leftovers.Count -gt 0) {
  $leftovers | ForEach-Object { try { $_.Kill() } catch {} }
  $leftovers | Wait-Process -ErrorAction SilentlyContinue
  Write-Host "   da don $($leftovers.Count) WINWORD zombie tu lan build truoc"
}

$target = $docxPath
if (Test-Path $docxPath) {
  try {
    $probe = [IO.File]::Open($docxPath, 'Open', 'ReadWrite', 'None')
    $probe.Close()
  } catch {
    $target = Join-Path $base 'DanhSach_Diem_TriThucBanDia_moi.docx'
    Write-Host "   CANH BAO: docx dang mo trong Word -> luu tam vao $target" -ForegroundColor Yellow
  }
  if ($target -eq $docxPath) { Remove-Item $docxPath -Force }
}
if (Test-Path $target) { Remove-Item $target -Force }

Write-Host '==> Word COM'
$word = $null; $doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  try { $word.Options.SaveNormalPrompt = $false } catch {}
  try { $word.Options.ConfirmConversions = $false } catch {}
  try { $word.Options.UpdateLinksAtOpen = $false } catch {}
  $doc = $word.Documents.Open($htmlPath, $false, $true, $false)

  # SaveAs2 goi tu PowerShell COM interop bi tre (da xac minh), con save_doc_all.exe
  # bi Application Control chan. Giai phap: late-bind IDispatch trong process nay
  # (cung cach save_doc_all.cs dang lam) — SaveAs2 chay binh thuong trong ~2s.
  Add-Type -TypeDefinition @"
public static class DocSave {
  public static void SaveAs2(object doc, string dst, int fmt) {
    doc.GetType().InvokeMember("SaveAs2", System.Reflection.BindingFlags.InvokeMethod, null, doc, new object[] { dst, fmt });
  }
}
"@

  # ---- 1. page setup: A4 landscape, margins 1.5cm (bang 9 cot) ----
  foreach ($sec in $doc.Sections) {
    $ps = $sec.PageSetup
    $ps.Orientation = 1
    $ps.PageWidth = 841.89
    $ps.PageHeight = 595.28
    $ps.TopMargin = 1.5 * $cm
    $ps.BottomMargin = 1.5 * $cm
    $ps.LeftMargin = 1.5 * $cm
    $ps.RightMargin = 1.5 * $cm
  }

  # ---- 2. styles ----
  $normal = $doc.Styles.Item($wdStyleNormal)
  $normal.Font.Name = 'Times New Roman'
  $normal.Font.NameAscii = 'Times New Roman'
  $normal.Font.NameOther = 'Times New Roman'
  $normal.Font.Size = 11
  $normal.Font.Bold = 0
  $normal.Font.Italic = 0
  $normal.Font.Color = 0
  $normal.ParagraphFormat.Alignment = $wdAlignJustify
  $normal.ParagraphFormat.LineSpacingRule = $wdLineSpaceMultiple
  $normal.ParagraphFormat.LineSpacing = 11 * 1.25
  $normal.ParagraphFormat.SpaceAfter = 6
  $normal.ParagraphFormat.SpaceBefore = 0

  function Set-HeadingStyle($styleId, $size, $align, $before, $after) {
    $s = $doc.Styles.Item($styleId)
    $s.Font.Name = 'Times New Roman'
    $s.Font.NameAscii = 'Times New Roman'
    $s.Font.NameOther = 'Times New Roman'
    $s.Font.Size = $size
    $s.Font.Bold = $msoTrue
    $s.Font.Italic = 0
    $s.Font.Color = 0
    $s.ParagraphFormat.Alignment = $align
    $s.ParagraphFormat.SpaceBefore = $before
    $s.ParagraphFormat.SpaceAfter = $after
    $s.ParagraphFormat.KeepWithNext = $msoTrue
    $s.ParagraphFormat.LineSpacingRule = $wdLineSpaceMultiple
    $s.ParagraphFormat.LineSpacing = $size * 1.25
  }
  Set-HeadingStyle $wdStyleHeading1 14 $wdAlignCenter 0 8
  Set-HeadingStyle $wdStyleHeading2 12 $wdAlignLeft 12 6
  Set-HeadingStyle $wdStyleHeading3 11 $wdAlignLeft 8 4

  # ---- 3. paragraph / table formatting ----
  Write-Host '   [3] paragraph & table formatting...'
  $viBang = 'B' + [char]0x1EA3 + 'ng'
  $nNormal = 0; $nTable = 0; $nCap = 0; $nSkip = 0
  foreach ($p in $doc.Paragraphs) {
    $rng = $p.Range
    $txt = $rng.Text.Trim()
    $inTable = $rng.Information($wdWithInTable)
    if ($p.OutlineLevel -ne $wdOutlineLevelBodyText) { $nSkip++; continue }

    $f = $rng.Font
    $f.Name = 'Times New Roman'; $f.NameAscii = 'Times New Roman'; $f.NameOther = 'Times New Roman'

    if ($inTable) {
      $f.Size = 9
      $rng.ParagraphFormat.SpaceBefore = 0
      $rng.ParagraphFormat.SpaceAfter = 0
      $rng.ParagraphFormat.LineSpacingRule = 0
      $nTable++
      continue
    }

    if ($txt -match ('^' + $viBang + '\s+\d+[\.]')) {
      $f.Size = 10
      $f.Bold = $msoTrue
      $p.Format.Alignment = $wdAlignLeft
      $p.Format.SpaceBefore = 8
      $p.Format.SpaceAfter = 3
      $p.Format.KeepWithNext = $msoTrue
      $nCap++
      continue
    }
    if ($f.Size -eq $null -or $f.Size -eq 0) { $f.Size = 11 }
    if ($f.Size -ne 11 -and $f.Size -ne 9) { $f.Size = 11 }
    $nNormal++
  }
  Write-Host "   paragraphs: body=$nNormal table=$nTable caption=$nCap skipped=$nSkip"

  # ---- 4. footer page numbers ----
  foreach ($sec in $doc.Sections) {
    $footer = $sec.Footers.Item($wdFooterPrimary)
    $footer.Range.Text = ''
    $footer.Range.ParagraphFormat.Alignment = $wdAlignPageNumberCenter
    $footer.PageNumbers.Add($wdAlignPageNumberCenter, $true) | Out-Null
  }

  # ---- 5. update fields & repaginate ----
  $doc.Fields.Update() | Out-Null
  $doc.Repaginate()
  $pages = $doc.ComputeStatistics(2)
  $words = $doc.ComputeStatistics(0)
  $tables = $doc.Tables.Count
  Write-Host "   pages=$pages words=$words tables=$tables"

  # ---- 6. save (late-bind SaveAs2, xem DocSave o dau script) ----
  try {
    [DocSave]::SaveAs2($doc.PSObject.BaseObject, $target, 16)
  } catch {
    Fail "save that bai: $($_.Exception.Message)"
  }
  if (-not (Test-Path $target)) { Fail "save that bai: khong tao duoc $target" }
  Write-Host "==> saved $target"

  $doc.Close($false)
  $doc = $null
  $word.Quit()
  $word = $null
} catch {
  Write-Host "LOI: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host $_.ScriptStackTrace
  if ($doc) { try { $doc.Close($false) } catch {} }
  if ($word) { try { $word.Quit() } catch {} }
  exit 1
} finally {
  if ($doc) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
  if ($word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
  [GC]::Collect()
  Get-Process WINWORD -ErrorAction SilentlyContinue |
    Where-Object { $initialWordPids -notcontains $_.Id } |
    ForEach-Object {
      Write-Host "   don instance Word thua: PID $($_.Id)"
      try { $_.Kill() } catch {}
    }
}
