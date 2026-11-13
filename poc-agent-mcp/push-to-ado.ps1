#Requires -Version 5.1
<#
.SYNOPSIS
  Pousse le contenu de ce dossier (racine solution) vers Azure DevOps HSO.

.DESCRIPTION
  À exécuter sur une machine Windows déjà authentifiée sur Azure DevOps (HSO-France).
  Destination :
  https://dev.azure.com/HSO-France/D365FO Add-Ins/_git/POC-Agent-MCPBridge
#>
[CmdletBinding()]
param(
  [string]$RemoteUrl = "https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git n'est pas installé ou pas dans le PATH."
}

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot ".git"))) {
  git init -b $Branch
}

$existing = git remote 2>$null
if ($existing -match "(?m)^azure$") {
  git remote set-url azure $RemoteUrl
} else {
  git remote add azure $RemoteUrl
}

git add -A
$status = git status --porcelain
if ($status) {
  git commit -m "Sync POC Agent MCP Bridge to Azure DevOps HSO"
}

Write-Host "Push vers $RemoteUrl ($Branch)…" -ForegroundColor Cyan
git push -u azure "HEAD:$Branch"

Write-Host "OK. Les collègues peuvent cloner :" -ForegroundColor Green
Write-Host "  git clone $RemoteUrl"
Write-Host "  cd POC-Agent-MCPBridge"
Write-Host "  code ."
Write-Host "  cd bridge; npm install; npm run dev"
