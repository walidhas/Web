# Packs a shareable bridge zip (no secrets, no node_modules).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$stamp = Get-Date -Format "yyyyMMdd"
$outDir = Join-Path $root "share"
$stage = Join-Path $env:TEMP "hso-bridge-share-$stamp"
$zipName = "hso-copilot-studio-bridge-$stamp.zip"
$zipPath = Join-Path $outDir $zipName

Write-Host "Root: $root"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Bridge sources
$bridgeSrc = Join-Path $root "bridge"
$bridgeDst = Join-Path $stage "bridge"
New-Item -ItemType Directory -Force -Path $bridgeDst | Out-Null
Copy-Item (Join-Path $bridgeSrc "package.json") $bridgeDst
Copy-Item (Join-Path $bridgeSrc "package-lock.json") $bridgeDst
Copy-Item (Join-Path $bridgeSrc "tsconfig.json") $bridgeDst
Copy-Item (Join-Path $bridgeSrc "src") (Join-Path $bridgeDst "src") -Recurse
if (Test-Path (Join-Path $bridgeSrc ".env.example")) {
  Copy-Item (Join-Path $bridgeSrc ".env.example") $bridgeDst
}

# Docs (share-relevant)
$docsDst = Join-Path $stage "docs"
New-Item -ItemType Directory -Force -Path $docsDst | Out-Null
$docs = @(
  "01-architecture.md",
  "03-bridge-hso.md",
  "04-agent-facade-hso.md",
  "07-enterprise-bridge-azure.md",
  "08-mode-operatoire-technique-clients.md"
)
foreach ($d in $docs) {
  $p = Join-Path $root "docs\$d"
  if (Test-Path $p) { Copy-Item $p $docsDst }
}
$img = Join-Path $root "docs\images"
if (Test-Path $img) {
  Copy-Item $img (Join-Path $docsDst "images") -Recurse
}

Copy-Item (Join-Path $root "share\README-SHARE.md") (Join-Path $stage "README.md")

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zipPath -Force

Remove-Item $stage -Recurse -Force
Write-Host "Created: $zipPath"
Get-Item $zipPath | Select-Object FullName, Length, LastWriteTime
