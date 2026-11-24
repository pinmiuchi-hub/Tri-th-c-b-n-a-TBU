# Build Bai_bao_Tri_thuc_ban_dia_Phu_Yen.docx from the article markdown.
# Usage (repo root):  powershell -File scripts/report/build_article.ps1
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
$htmlPath = Join-Path $base 'Bai_bao_Tri_thuc_ban_dia_Phu_Yen.html'
$docxPath = Join-Path $base 'Bai_bao_Tri_thuc_ban_dia_Phu_Yen.docx'

function Fail([string]$msg) { Write-Host "LOI: $msg" -ForegroundColor Red; exit 1 }

# ---- 0. preconditions ----
if (-not $NoHtml) {
  Write-Host '==> md2html_article.mjs'
  node (Join-Path $PSScriptRoot 'md2html_article.mjs')
  if ($LASTEXITCODE -ne 0) { Fail 'md2html loi' }
}
if (-not (Test-Path $htmlPath)) { Fail "thieu $htmlPath" }

# same Word-instance hygiene as build-report.ps1
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
    $target = Join-Path $base 'Bai_bao_Tri_thuc_ban_dia_Phu_Yen_moi.docx'
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

  # save_doc_all.exe: enumerates every Word instance in the ROT (save_doc.js
  # only sees the first one, which may be the user's own Word window)
  $helper = Join-Path $PSScriptRoot 'save_doc_all.exe'
  if (-not (Test-Path $helper)) { Fail "thieu $helper (compile save_doc_all.cs)" }
  $probeOut = & "$helper" "$htmlPath" '-' 2>&1
  if ($LASTEXITCODE -ne 0) { Fail "helper khong tim thay document: $probeOut" }

  # ---- 1. page setup: A4, margins 2cm ----
  foreach ($sec in $doc.Sections) {
    $ps = $sec.PageSetup
    $ps.Orientation = 0
    $ps.PageWidth = 595.28
    $ps.PageHeight = 841.89
    $ps.TopMargin = 2 * $cm
    $ps.BottomMargin = 2 * $cm
    $ps.LeftMargin = 2 * $cm
    $ps.RightMargin = 2 * $cm
  }

  # ---- 2. styles ----
  $normal = $doc.Styles.Item($wdStyleNormal)
  $normal.Font.Name = 'Times New Roman'
  $normal.Font.NameAscii = 'Times New Roman'
  $normal.Font.NameOther = 'Times New Roman'
  $normal.Font.Size = 12
  $normal.Font.Bold = 0
  $normal.Font.Italic = 0
  $normal.Font.Color = 0
  $normal.ParagraphFormat.Alignment = $wdAlignJustify
  $normal.ParagraphFormat.LineSpacingRule = $wdLineSpaceMultiple
  $normal.ParagraphFormat.LineSpacing = 12 * 1.3
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
    $s.ParagraphFormat.LineSpacing = $size * 1.3
  }
  Set-HeadingStyle $wdStyleHeading1 14 $wdAlignCenter 0 8
  Set-HeadingStyle $wdStyleHeading2 13 $wdAlignLeft 14 6
  Set-HeadingStyle $wdStyleHeading3 12 $wdAlignLeft 10 4

  # ---- 3. insert figures from @@IMG tokens ----
  $text = $doc.Content.Text
  $rx = [regex]'@@IMG:[^\s@]+@@'
  $tokMatches = @($rx.Matches($text))
  Write-Host "   tokens: $($tokMatches.Count) (IMG only)"
  $insertedImgs = 0
  $cursor = 0
  foreach ($m in $tokMatches) {
    $token = $m.Value
    $rel = $token.Substring(6, $token.Length - 8)   # strip @@IMG: and @@
    $full = [IO.Path]::GetFullPath((Join-Path $base ($rel -replace '/', '\')))
    if (-not (Test-Path $full)) { Fail "khong tim thay anh: $full" }

    $r = $doc.Range($cursor, $doc.Content.End)
    $find = $r.Find
    $find.ClearFormatting()
    $find.Text = $token
    $find.Forward = $true
    $find.Wrap = $wdFindStop
    $find.Format = $false
    $find.MatchCase = $true
    $find.MatchWildcards = $false
    if (-not $find.Execute()) { Fail "khong tim thay token: $token" }

    $r.Text = ''
    $r.Collapse($wdCollapseStart)
    $shape = $doc.InlineShapes.AddPicture($full, $false, $true, $r)
    $shape.LockAspectRatio = $msoTrue
    $shape.Width = 14.5 * $cm
    $shape.Range.ParagraphFormat.Alignment = $wdAlignCenter
    $shape.Range.ParagraphFormat.SpaceBefore = 6
    $shape.Range.ParagraphFormat.SpaceAfter = 2
    $shape.Range.ParagraphFormat.KeepWithNext = $msoTrue   # keep figure with its caption
    $cursor = $shape.Range.End
    $insertedImgs++
  }
  Write-Host "   images=$insertedImgs"

  # ---- 4. paragraph formatting ----
  Write-Host '   [4] paragraph formatting...'
  $viHinh = 'H' + [char]0x00EC + 'nh'
  $nNormal = 0; $nTable = 0; $nCap = 0; $nSkip = 0; $pi = 0
  foreach ($p in $doc.Paragraphs) {
    $pi++
    $rng = $p.Range
    $txt = $rng.Text.Trim()
    $inTable = $rng.Information($wdWithInTable)
    if ($p.OutlineLevel -ne $wdOutlineLevelBodyText) { $nSkip++; continue }

    $f = $rng.Font
    $f.Name = 'Times New Roman'; $f.NameAscii = 'Times New Roman'; $f.NameOther = 'Times New Roman'

    if ($inTable) { $f.Size = 11; $nTable++; continue }

    if ($txt -match ('^' + $viHinh + '\s+\d+[\.]')) {
      $f.Size = 11; $f.Bold = 0; $f.Italic = 0
      $p.Format.Alignment = $wdAlignCenter
      $p.Format.SpaceBefore = 0
      $p.Format.SpaceAfter = 10
      $p.Format.KeepWithNext = 0
      $nCap++
      continue
    }
    if ($txt -match '^Bảng\s+\d+[\.]') {
      $f.Size = 11
      $p.Format.SpaceBefore = 10
      $p.Format.SpaceAfter = 4
      $p.Format.KeepWithNext = $msoTrue
      $nCap++
      continue
    }
    if ($f.Size -eq $null -or $f.Size -eq 0) { $f.Size = 12 }
    if ($f.Size -ne 12) { $f.Size = 12 }
    $nNormal++
  }
  Write-Host "   paragraphs: body=$nNormal table=$nTable caption=$nCap skipped=$nSkip"

  # ---- 5. footer page numbers ----
  foreach ($sec in $doc.Sections) {
    $footer = $sec.Footers.Item($wdFooterPrimary)
    $footer.Range.Text = ''
    $footer.Range.ParagraphFormat.Alignment = $wdAlignCenter
    $footer.PageNumbers.Add($wdAlignPageNumberCenter, $true) | Out-Null
  }

  # ---- 6. update fields & repaginate ----
  $doc.Fields.Update() | Out-Null
  $doc.Repaginate()
  $pages = $doc.ComputeStatistics(2)
  $words = $doc.ComputeStatistics(0)
  Write-Host "   pages=$pages words=$words"

  # ---- 7. save (delegated to helper: SaveAs2 hangs under PS COM interop) ----
  $saveOut = & "$helper" "$htmlPath" "$target" 16 2>&1
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $target)) { Fail "save that bai (exit=$LASTEXITCODE): $saveOut" }
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
