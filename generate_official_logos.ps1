Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) "public\assets\event-poster.jpg"))

# 1. Official Matchbox Logo from Poster:
# X: 19..226 (w=208), Y: 15..65 (h=51)
$rectMb = New-Object System.Drawing.Rectangle(19, 15, 208, 51)
$mb = $src.Clone($rectMb, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$mb.Save((Join-Path (Get-Location) "public\assets\matchbox-official.png"), [System.Drawing.Imaging.ImageFormat]::Png)

# 2. Official Universal AI University Logo from Poster:
# X: 494..706 (w=213), Y: 15..74 (h=60)
$rectUniv = New-Object System.Drawing.Rectangle(494, 15, 213, 60)
$univ = $src.Clone($rectUniv, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$univ.Save((Join-Path (Get-Location) "public\assets\universal-official.png"), [System.Drawing.Imaging.ImageFormat]::Png)

# 3. Create clean transparent versions
function Create-TransparentLogo($bmp, $outPath) {
    $outBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            # Background is warm cream around R~245-255, G~235-248, B~210-230
            # Calculate luminance / distance from cream
            $distFromCream = [Math]::Sqrt([Math]::Pow($p.R - 248, 2) + [Math]::Pow($p.G - 238, 2) + [Math]::Pow($p.B - 215, 2))
            
            if ($distFromCream -lt 25) {
                # Full transparent background
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($distFromCream -lt 55) {
                # Smooth antialiased alpha transition
                $alpha = [int]([Math]::Min(255, [Math]::Max(0, (($distFromCream - 25) / 30.0) * 255)))
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            } else {
                # Solid foreground logo element
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
            }
        }
    }
    $outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
}

Create-TransparentLogo $mb (Join-Path (Get-Location) "public\assets\matchbox-official-transparent.png")
Create-TransparentLogo $univ (Join-Path (Get-Location) "public\assets\universal-official-transparent.png")

$mb.Dispose()
$univ.Dispose()
$src.Dispose()
Write-Output "Logos created successfully."
