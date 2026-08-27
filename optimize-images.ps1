# ============================================================================
#  optimize-images.ps1
#  Stock Photography — Image Optimization
#
#  BIGGEST WIN on your site: the 31 source photos are ~85 MB total, with the
#  largest at 8 MB. They are render at ~280-800px but shipped at 3000-6700px.
#  This script downscales + re-encodes them to web-friendly dimensions.
#
#  SAFETY:
#   - Backs up every original into  images\PHOTOGRAPHY-ORIGINAL-BACKUP\
#   - Overwrites the SAME filenames, so NO HTML/JS/PHP reference changes needed.
#   - Set -MaxDimension smaller for aggressive savings, larger for quality.
#
#  USAGE (PowerShell 5.1+, run from project root):
#     powershell -ExecutionPolicy Bypass -File optimize-images.ps1
#     powershell -ExecutionPolicy Bypass -File optimize-images.ps1 -MaxDimension 1200 -JpegQuality 75
#
#  OPTIONAL WebP: if you install libwebp 'cwebp.exe' and drop it in this
#  project folder (or on PATH), the script will ALSO emit .webp copies.
#  Then uncomment the ".webp auto-serving" block in .htaccess.
# ============================================================================

param(
    [int]$MaxDimension = 1600,   # longest side in px (1600 = ~2x full-HD, good balance)
    [int]$JpegQuality = 80,      # JPEG quality 1-100
    [string]$SourceDir = "images\Photography",
    [string]$BackupDir = "images\PHOTOGRAPHY-ORIGINAL-BACKUP"
)

Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -LiteralPath $SourceDir -File -Include *.jpg,*.jpeg -Recurse
if (-not $files) {
    Write-Host "No JPG files found in $SourceDir" -ForegroundColor Yellow
    exit
}

# Locate cwebp if available (for optional WebP output)
$cwebp = Get-Command cwebp -ErrorAction SilentlyContinue
if (-not $cwebp) { $cwebp = Get-Item -LiteralPath "cwebp.exe" -ErrorAction SilentlyContinue }

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$totalBefore = 0; $totalAfter = 0; $done = 0

foreach ($f in $files) {
    # --- Backup original (only once) ---
    $backupFile = Join-Path $BackupDir ($f.Name + ".orig")
    if (-not (Test-Path -LiteralPath $backupFile)) {
        Copy-Item -LiteralPath $f.FullName -Destination $backupFile
    }

    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        $w = $img.Width; $h = $img.Height

        $scale = [Math]::Min(1.0, $MaxDimension / [Math]::Max($w, $h))
        $nw = [int][Math]::Round($w * $scale)
        $nh = [int][Math]::Round($h * $scale)

        $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, 0, 0, $nw, $nh)

        $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
               Where-Object { $_.MimeType -eq 'image/jpeg' }
        $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, [long]$JpegQuality)

        $before = (Get-Item -LiteralPath $f.FullName).Length
        $bmp.Save($f.FullName, $enc, $ep)
        $after = (Get-Item -LiteralPath $f.FullName).Length

        # --- Optional WebP twin ---
        if ($cwebp) {
            $webp = $f.FullName -replace '\.jpe?g$', '.webp'
            & $cwebp.FullName -quiet -q $JpegQuality $f.FullName -o $webp | Out-Null
        }

        $totalBefore += $before; $totalAfter += $after; $done++
        Write-Host ("{0,-50} {1,8:N0} KB -> {2,8:N0} KB" -f $f.Name, ($before/1KB), ($after/1KB)) -ForegroundColor Green
        $g.Dispose(); $bmp.Dispose(); $img.Dispose()
    } catch {
        Write-Host ("SKIP {0}: {1}" -f $f.Name, $_.Exception.Message) -ForegroundColor Red
    }
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "Processed: $done files"
Write-Host ("Total: {0:N1} MB -> {1:N1} MB  (saved {2:P0})" -f ($totalBefore/1MB), ($totalAfter/1MB), (1 - $totalAfter/[Math]::Max(1,$totalBefore)))
Write-Host ("Originals backed up to: {0}" -f $BackupDir) -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
