param(
  [string]$SrcDir = "artifacts\webgis\docs\BaoCao_NghienCuu\images",
  [int]$TargetW = 2400
)

Add-Type -AssemblyName System.Drawing

$targets = @(
  "con_nuoc.jpg",
  "hinh_3_10_thong_tin_xa.png",
  "hinh_3_1_webgis.png",
  "hinh_3_5_tong_quan_vung.png",
  "hinh_3_6_mat_do_dan_so.png",
  "hinh_3_7_co_cau_dan_toc_tron.png",
  "hinh_3_8_tri_thuc_on_dinh.png",
  "hinh_3_9_composer_xuat_do.png",
  "thai_stilt_house.jpg"
)

foreach ($name in $targets) {
  $src = Join-Path $SrcDir $name
  if (-not (Test-Path -LiteralPath $src)) { Write-Host "SKIP missing $name"; continue }
  $img = [System.Drawing.Image]::FromFile($src)
  $w = $img.Width; $h = $img.Height
  if ($w -ge $TargetW) { $img.Dispose(); Write-Host "OK already $name ${w}x${h}"; continue }
  $scale = $TargetW / $w
  $newW = [int][Math]::Round($w * $scale)
  $newH = [int][Math]::Round($h * $scale)
  $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage($img, 0, 0, $newW, $newH)
  $g.Dispose()

  $tmp = $src + ".tmp"
  if ($name.ToLower().EndsWith(".png")) {
    $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
  } else {
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 95L)
    $bmp.Save($tmp, $jpegCodec, $ep)
  }
  $bmp.Dispose(); $img.Dispose()
  Move-Item -LiteralPath $tmp -Destination $src -Force
  Write-Host "UPSCALED $name ${w}x${h} -> ${newW}x${newH}"
}
Write-Host "DONE"
