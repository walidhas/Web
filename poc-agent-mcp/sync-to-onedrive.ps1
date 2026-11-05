#Requires -Version 5.1
<#
.SYNOPSIS
  Copie le contenu du POC Agent MCP vers le dossier OneDrive local.

.DESCRIPTION
  À exécuter sur ta machine Windows (pas depuis le Cloud Agent).
  Source = ce dossier repo (poc-agent-mcp) ou un chemin -Source fourni.
  Destination par défaut :
  C:\Users\WalidHassayoune\OneDrive - HSO\Documents\Travail\HSO\Poc Agent MCP
#>
[CmdletBinding()]
param(
  [string]$Source = $PSScriptRoot,
  [string]$Destination = "C:\Users\WalidHassayoune\OneDrive - HSO\Documents\Travail\HSO\Poc Agent MCP"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Source)) {
  throw "Source introuvable: $Source"
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null

# Mirror files; exclude local secrets and build artifacts
$excludeDirs = @("node_modules", "dist", ".git")
$robolog = Join-Path $env:TEMP "poc-agent-mcp-robocopy.log"

$xdArgs = @()
foreach ($d in $excludeDirs) { $xdArgs += @("/XD", $d) }

$robocopyArgs = @(
  $Source,
  $Destination,
  "/E",
  "/NFL", "/NDL", "/NJH", "/NJS", "/NP",
  "/XF", ".env", "agent.client.env",
  "/LOG:$robolog"
) + $xdArgs

& robocopy @robocopyArgs | Out-Null
$code = $LASTEXITCODE
# Robocopy: 0-7 = success-ish
if ($code -ge 8) {
  throw "Robocopy a échoué (code $code). Voir $robolog"
}

Write-Host "OK — fichiers synchronisés vers:" -ForegroundColor Green
Write-Host "  $Destination"
Write-Host ""
Write-Host "Ouvre ce dossier dans Cursor: File → Open Folder…"
Write-Host "Puis: cd bridge; npm install; copy ..\config\agent.client.example.env .env; npm run dev"
