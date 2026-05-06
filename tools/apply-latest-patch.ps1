param(
  [string]$DownloadDir = "C:\Users\khqv\Downloads",
  [string]$ProjectRoot = "C:\AI\projects\P0007_MadeInMaghribalt3",
  [string]$Pattern = "MadeInMaghribal_*.zip",
  [switch]$Verify
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$tempDir = Join-Path $ProjectRoot ".temp\apply_patch"

$zip = Get-ChildItem $DownloadDir -Filter $Pattern -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $zip) {
  Write-Host "No patch zip found."
  Write-Host "DownloadDir: $DownloadDir"
  Write-Host "Pattern: $Pattern"
  Write-Host "Recent zip files:"
  Get-ChildItem $DownloadDir -Filter "*.zip" -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 10 Name, LastWriteTime |
    Format-Table -AutoSize
  throw "Patch zip not found."
}

if (Test-Path $tempDir) {
  Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Expand-Archive -Path $zip.FullName -DestinationPath $tempDir -Force
Copy-Item -Path (Join-Path $tempDir "*") -Destination $ProjectRoot -Recurse -Force

Push-Location $ProjectRoot
try {
  node tools\build-browser-bundle.cjs
  if ($Verify) {
    npm run verify
  }
} finally {
  Pop-Location
}

Write-Host "Applied patch: $($zip.FullName)"
if ($Verify) {
  Write-Host "Build and verify complete."
} else {
  Write-Host "Build complete. Use -Verify when full verification is needed."
}
