# Build BAO_CAO_DE_TAI.docx from the generated HTML using Word COM automation.
# Usage (repo root):  powershell -File scripts/report/build-report.ps1
param(
  [switch]$NoHtml   # reuse existing HTML instead of regenerating it
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ---- constants (Wd*) ----
$wdCollapseStart = 1
$wdFindStop = 0
$wdPageBreak = 7
$wdAlignLeft = 0
$wdAlignCenter = 1
$wdAlignJustify = 3
$wdLineSpaceMultiple = 5
$wdLineSpaceExactly = 3
$wdFieldEmpty = -1
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
$base = Join-Path $repoRoot 'artifacts\webgis\docs\BaoCao_NghienCuu'
$htmlPath = Join-Path $base 'BAO_CAO_DE_TAI_build.html'
$docxPath = Join-Path $base 'BAO_CAO_DE_TAI.docx'

function Fail([string]$msg) { Write-Host "LOI: $msg" -ForegroundColor Red; exit 1 }

# ---- 0. preconditions ----
if (-not $NoHtml) {
  Write-Host '==> md2html.mjs'
  node (Join-Path $PSScriptRoot 'md2html.mjs')
  if ($LASTEXITCODE -ne 0) { Fail 'md2html loi' }
}
if (-not (Test-Path $htmlPath)) { Fail "thieu $htmlPath" }

# Word instances already running belong to the user - never touch them; remember
# their pids so the finally block can clean up only the instance we spawn.
$initialWordPids = @(Get-Process WINWORD -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })

# Zero-document zombie instances left behind by earlier runs would win the ROT
# lookup in save_doc.js and make the save attach to the wrong instance - clear
# them (anything not present at script start) before creating ours.
$leftovers = @(Get-Process WINWORD -ErrorAction SilentlyContinue | Where-Object { $initialWordPids -notcontains $_.Id })
if ($leftovers.Count -gt 0) {
  $leftovers | ForEach-Object { try { $_.Kill() } catch {} }
  $leftovers | Wait-Process -ErrorAction SilentlyContinue
  Write-Host "   da don $($leftovers.Count) WINWORD zombie tu lan build truoc"
}

if (Test-Path $docxPath) {
  try {
    $probe = [IO.File]::Open($docxPath, 'Open', 'ReadWrite', 'None')
    $probe.Close()
  } catch {
    Write-Host "   CANH BAO: $docxPath dang mo trong Word - ban build se luu vao BAO_CAO_DE_TAI_moi.docx (dong Word roi build lai de ghi de)" -ForegroundColor Yellow
  }
}

# ---- image width rules (cm) ----
# All images are >= 2400px wide, so every one renders at 14.5cm.
function Get-ImageWidthCm([string]$name) {
  return 14.5
}

Write-Host '==> Word COM'
$word = $null; $doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  try { $word.Options.SaveNormalPrompt = $false } catch {}
  try { $word.Options.ConfirmConversions = $false } catch {}
  try { $word.Options.UpdateLinksAtOpen = $false } catch {}
  # ReadOnly + no AddToRecentFiles: never pops the "file in use" dialog even when
  # the user keeps BAO_CAO_DE_TAI open in their own Word window.
  $doc = $word.Documents.Open($htmlPath, $false, $true, $false)

  # fail fast: verify save_doc.js can locate this document before spending
  # minutes on styling (it attaches via ROT, which zombies/user Word can steal)
  $helper = Join-Path $PSScriptRoot 'save_doc.js'
  $probeOut = & cscript.exe //nologo "$helper" "$htmlPath" '-' 2>&1
  if ($LASTEXITCODE -ne 0) { Fail "helper khong tim thay document (ROT ambiguous?): $probeOut" }

  # ---- 1. page setup: A4, l[e trai 2.5cm, tren/duoi/phai 2cm ----
  foreach ($sec in $doc.Sections) {
    $ps = $sec.PageSetup
    $ps.Orientation = 0
    $ps.PageWidth = 595.28
    $ps.PageHeight = 841.89
    $ps.TopMargin = 2 * $cm
    $ps.BottomMargin = 2 * $cm
    $ps.LeftMargin = 2.5 * $cm
    $ps.RightMargin = 2 * $cm
    $ps.DifferentFirstPageHeaderFooter = $msoTrue
  }

  # ---- 2. styles ----
  $normal = $doc.Styles.Item($wdStyleNormal)
  $normal.Font.Name = 'Times New Roman'
  $normal.Font.NameAscii = 'Times New Roman'
  $normal.Font.NameOther = 'Times New Roman'
  $normal.Font.Size = 13
  $normal.Font.Bold = 0
  $normal.Font.Italic = 0
  $normal.Font.Color = 0
  $normal.ParagraphFormat.Alignment = $wdAlignJustify
  $normal.ParagraphFormat.LineSpacingRule = $wdLineSpaceMultiple
  $normal.ParagraphFormat.LineSpacing = 13 * 1.3
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
  Set-HeadingStyle $wdStyleHeading1 16 $wdAlignCenter 14 10
  Set-HeadingStyle $wdStyleHeading2 14 $wdAlignLeft 12 6
  Set-HeadingStyle $wdStyleHeading3 13 $wdAlignLeft 10 4

  # ---- 3. tokens (sequential Find) ----
  # String offsets from Content.Text are NOT valid Range positions: .Text carries
  # end-of-cell markers (Chr 7) that position numbering skips, so every index past
  # the first table is shifted (string ended up 3120 chars longer than the doc).
  # Match on the string only to learn token VALUES and their order, then locate
  # each token inside the document with Find, walking forward with a cursor.
  $text = $doc.Content.Text
  $rx = [regex]'@@(PB|TOC|IMG:[^\s@]+|DM:[A-Za-z0-9_]+\|[^\x00]*?)@@'
  $tokMatches = @($rx.Matches($text))
  Write-Host "   tokens: $($tokMatches.Count)"
  $insertedImgs = 0; $insertedDm = 0; $pageBreaks = 0

  $textWidth = 595.28 - (2.5 * $cm) - (2 * $cm)
  $cursor = 0
  $tn = 0

  foreach ($m in $tokMatches) {
    $tn++
    if ($tn % 20 -eq 0) { Write-Host "     ...token $tn/$($tokMatches.Count)" }
    $token = $m.Value
    $kind = $m.Groups[1].Value
    if ($kind.StartsWith('IMG:')) { $kind = 'IMG' }
    elseif ($kind.StartsWith('DM:')) { $kind = 'DM' }
    if ($token.Length -gt 250) { Fail "token qua dai cho Find: $($token.Substring(0, 80))..." }

    $r = $doc.Range($cursor, $doc.Content.End)
    $find = $r.Find
    $find.ClearFormatting()
    $find.Text = $token.Replace('^', '^^')
    $find.Forward = $true
    $find.Wrap = $wdFindStop
    $find.Format = $false
    $find.MatchCase = $true
    $find.MatchWildcards = $false
    if (-not $find.Execute()) { Fail "khong tim thay token (vi tri $cursor): $token" }

    switch ($kind) {
      'PB' {
        $r.Text = ''
        $r.Collapse($wdCollapseStart)
        $p = $r.Paragraphs.Item(1)
        $p.Format.PageBreakBefore = $msoTrue
        $p.Format.SpaceAfter = 0
        $p.Format.SpaceBefore = 0
        $p.Format.LineSpacingRule = $wdLineSpaceExactly
        $p.Format.LineSpacing = 1
        $p.Range.Font.Size = 1
        $cursor = $p.Range.End
        $pageBreaks++
      }
      'TOC' {
        $r.Text = ''
        $r.Collapse($wdCollapseStart)
        $toc = $doc.TablesOfContents.Add($r, $true, 1, 3, $false, '', $true, $true, '', $true)
        $cursor = $toc.Range.End
      }
      'IMG' {
        $rel = $m.Groups[1].Value.Substring(4)   # group text starts with 'IMG:'
        $full = [IO.Path]::GetFullPath((Join-Path $base ($rel -replace '/', '\')))
        if (-not (Test-Path $full)) { Fail "khong tim thay anh: $full" }
        $r.Text = ''
        $r.Collapse($wdCollapseStart)
        $shape = $doc.InlineShapes.AddPicture($full, $false, $true, $r)
        $shape.LockAspectRatio = $msoTrue
        $shape.Width = (Get-ImageWidthCm $rel) * $cm
        $shape.Range.ParagraphFormat.Alignment = $wdAlignCenter
        $shape.Range.ParagraphFormat.SpaceBefore = 6
        $shape.Range.ParagraphFormat.SpaceAfter = 3
        $cursor = $shape.Range.End
        $insertedImgs++
      }
      'DM' {
        $payload = $m.Groups[1].Value          # 'DM:bm|text'
        $body = $payload.Substring(3)          # 'bm|text'
        $bar = $body.IndexOf('|')
        $bm = $body.Substring(0, $bar)
        $label = $body.Substring($bar + 1)
        $r.Text = $label + "`t"
        $r.Collapse($wdCollapseEnd)
        $fieldRange = $doc.Range($r.End, $r.End)
        [void]$doc.Fields.Add($fieldRange, $wdFieldEmpty, "PAGEREF $bm \h", $false)
        $cursor = $doc.Fields.Item($doc.Fields.Count).Range.End
        $p = $r.Paragraphs.Item(1)
        $p.Format.TabStops.ClearAll()
        [void]$p.Format.TabStops.Add($textWidth - 1, 2, 1)
        $insertedDm++
      }
    }
  }
  Write-Host "   images=$insertedImgs danhMuc=$insertedDm pageBreaks=$pageBreaks"

  # ---- 4. paragraph formatting ----
  Write-Host "   [4] paragraph formatting..."
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $nNormal = 0; $nTable = 0; $nCap = 0; $nDm = 0; $nSkip = 0; $pi = 0
  foreach ($p in $doc.Paragraphs) {
    $pi++
    if ($pi % 500 -eq 0) { Write-Host "     ...$pi para ${nNormal}b ${nTable}ch ${nCap}chx ${nDm}dm ${nSkip}skip $([int]$sw.Elapsed.TotalSeconds)s" }
    $rng = $p.Range
    $txt = $rng.Text.Trim()
    $inTable = $rng.Information($wdWithInTable)

    # danh muc entries (paragraph holds a PAGEREF field and starts with Bảng/Hình)
    if ($txt -match '^(Bảng|Hình)\s' -and $rng.Fields.Count -gt 0) {
      $f = $p.Range.Font
      $f.Name = 'Times New Roman'; $f.NameAscii = 'Times New Roman'; $f.NameOther = 'Times New Roman'
      $f.Size = 13
      $f.Bold = 0; $f.Italic = 0
      $p.Format.SpaceAfter = 3
      $p.Format.LineSpacingRule = $wdLineSpaceMultiple
      $p.Format.LineSpacing = 13 * 1.3
      $nDm++
      continue
    }
    if ($p.OutlineLevel -ne $wdOutlineLevelBodyText) { $nSkip++; continue }

    $f = $rng.Font
    $f.Name = 'Times New Roman'; $f.NameAscii = 'Times New Roman'; $f.NameOther = 'Times New Roman'

    if ($inTable) { $f.Size = 12; $nTable++; continue }

    if ($txt -match '^Hình\s+[0-9]+(\.[0-9]+)?\s+[—–-]') {
      $f.Size = 12; $f.Italic = $msoTrue
      $p.Format.Alignment = $wdAlignCenter
      $p.Format.SpaceBefore = 0
      $p.Format.SpaceAfter = 10
      $p.Format.KeepWithNext = 0
      $nCap++
      continue
    }
    if ($txt -match '^Bảng\s+[A-Za-z0-9]+(\.[0-9]+)+\.\s' -and $f.Bold -ne 0) {
      $f.Size = 12
      $p.Format.SpaceBefore = 10
      $p.Format.SpaceAfter = 4
      $p.Format.KeepWithNext = $msoTrue
      $nCap++
      continue
    }
    if ($f.Size -ge 14) { $nSkip++; continue }   # cover titles keep their size
    if ($f.Size -eq $null -or $f.Size -eq 0) { $f.Size = 13 }
    if ($f.Size -ne 13) { $f.Size = 13 }
    $nNormal++
  }
  Write-Host "   paragraphs: body=$nNormal table=$nTable caption=$nCap danhMuc=$nDm skipped=$nSkip"

  # ---- 5. footer page numbers ----
  Write-Host "   [5] footer..."
  foreach ($sec in $doc.Sections) {
    $footer = $sec.Footers.Item($wdFooterPrimary)
    $footer.Range.Text = ''
    $footer.Range.ParagraphFormat.Alignment = $wdAlignCenter
    $footer.PageNumbers.Add($wdAlignPageNumberCenter, $true) | Out-Null
  }

  # ---- 6. update fields & repaginate ----
  Write-Host "   [6] update fields + repaginate..."
  $doc.Fields.Update() | Out-Null
  foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
  $doc.Repaginate()
  foreach ($toc in $doc.TablesOfContents) { $toc.UpdatePageNumbers() }
  $doc.Repaginate()
  Write-Host "   [6] done"

  $pages = $doc.ComputeStatistics(2)   # wdStatisticPages = 2
  $words = $doc.ComputeStatistics(0)   # wdStatisticWords = 0
  Write-Host "   pages=$pages words=$words"

  # ---- 7. save ----
  # SaveAs2 called through PowerShell COM interop hangs indefinitely on this
  # machine (cscript saves the same document in <1s), so delegate the final
  # save to save_doc.js which attaches to this Word instance via GetObject.
  $target = $docxPath
  try {
    if (Test-Path $docxPath) {
      $probe = [IO.File]::Open($docxPath, 'Open', 'ReadWrite', 'None')
      $probe.Close()
      Remove-Item $docxPath -Force
    }
  } catch {
    $target = Join-Path $base 'BAO_CAO_DE_TAI_moi.docx'
    Write-Host "   CANH BAO: $docxPath dang bi Word mo -> luu tam vao $target (dong Word roi build lai de ghi de)" -ForegroundColor Yellow
    if (Test-Path $target) { Remove-Item $target -Force }
  }
  $helper = Join-Path $PSScriptRoot 'save_doc.js'
  $saveOut = & cscript.exe //nologo "$helper" "$htmlPath" "$target" 16 2>&1
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
  # remove the Word instance we spawned (if Quit left it behind); never touch the
  # user's own Word windows
  Get-Process WINWORD -ErrorAction SilentlyContinue |
    Where-Object { $initialWordPids -notcontains $_.Id } |
    ForEach-Object {
      Write-Host "   dọn instance Word thừa: PID $($_.Id)"
      try { $_.Kill() } catch {}
    }
}
