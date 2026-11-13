#Requires -Version 5.1
<#
.SYNOPSIS
  Pousse la version LOCALE (dossier courant ou -Source) vers Azure DevOps HSO.

.DESCRIPTION
  Utilise le contenu du dossier courant (ou -Source), ex. la racine du clone
  POC-Agent-MCPBridge.

  Authentification : navigateur / Credential Manager / PAT (ne pas hardcoder le PAT).
#>
[CmdletBinding()]
param(
  [string]$Source = $PSScriptRoot,
  [string]$RemoteUrl = "https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath (Join-Path $Source "bridge"))) {
  throw "Source invalide (pas de dossier bridge): $Source"
}

$work = Join-Path $env:TEMP ("POC-Agent-MCPBridge-push-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $work | Out-Null

Write-Host "Copie de la latest locale → $work" -ForegroundColor Cyan
robocopy $Source $work /E /XD node_modules dist .git /XF .env agent.client.env /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Robocopy failed: $LASTEXITCODE" }

Set-Location -LiteralPath $work
git init -b $Branch | Out-Null
git add -A
git -c commit.gpgsign=false commit -m "Sync latest POC Agent MCP Bridge from local workspace" | Out-Null

git remote add azure $RemoteUrl

Write-Host "Fetch + merge remote (si README initial)…" -ForegroundColor Cyan
git fetch azure $Branch 2>$null
if ($LASTEXITCODE -eq 0) {
  git -c commit.gpgsign=false merge "azure/$Branch" --allow-unrelated-histories -m "Merge remote with local latest" 2>$null
  if (Test-Path README.md) {
    $raw = Get-Content README.md -Raw -ErrorAction SilentlyContinue
    if ($raw -match '<<<<<<<') {
      # keep local README from Source
      Copy-Item -Force (Join-Path $Source "README.md") README.md
      git add README.md
      git -c commit.gpgsign=false commit -m "Resolve README: keep local latest" 2>$null
    }
  }
}

Write-Host "Push → $RemoteUrl ($Branch)" -ForegroundColor Cyan
git push -u azure "HEAD:$Branch"

Write-Host "OK — latest locale poussée." -ForegroundColor Green
Write-Host "Clone collègues: git clone $RemoteUrl"
