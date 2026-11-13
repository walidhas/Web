#Requires -Version 5.1
<#
.SYNOPSIS
  Prend la latest déjà sur GitHub et la pousse vers Azure DevOps HSO.

.DESCRIPTION
  Source : branche cursor/poc-agent-mcp-latest-docs-3c8a (repo walidhas/Web)
  Cible  : https://dev.azure.com/HSO-France/D365FO Add-Ins/_git/POC-Agent-MCPBridge

  Astuce réseau : exécuter en partage 4G si "Connection was reset" sur le LAN HSO.
#>
[CmdletBinding()]
param(
  [string]$GithubUrl = "https://github.com/walidhas/Web.git",
  [string]$GithubBranch = "cursor/poc-agent-mcp-latest-docs-3c8a",
  [string]$AdoUrl = "https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge",
  [string]$AdoBranch = "main"
)

$ErrorActionPreference = "Continue"
$work = Join-Path $env:TEMP "POC-from-github-to-ado"
Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $work | Out-Null

Write-Host "1) Export GitHub $GithubBranch → poc-agent-mcp/" -ForegroundColor Cyan
$web = Join-Path $env:TEMP "Web-sparse-latest"
Remove-Item -Recurse -Force $web -ErrorAction SilentlyContinue
git clone --depth 1 --branch $GithubBranch $GithubUrl $web
if ($LASTEXITCODE -ne 0) { throw "Clone GitHub failed: $LASTEXITCODE" }

robocopy (Join-Path $web "poc-agent-mcp") $work /E /XD node_modules dist .git /XF .env /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed: $LASTEXITCODE" }

Set-Location $work
git init -b $AdoBranch | Out-Null
git add -A
git -c commit.gpgsign=false commit -m "Sync latest from GitHub $GithubBranch" | Out-Null

git remote add azure $AdoUrl
git config http.version HTTP/1.1
git config http.postBuffer 524288000

Write-Host "2) Merge remote ADO main (si existe)…" -ForegroundColor Cyan
git fetch azure $AdoBranch 2>$null
if ($LASTEXITCODE -eq 0) {
  git -c commit.gpgsign=false merge "azure/$AdoBranch" --allow-unrelated-histories -m "Merge ADO remote" 2>$null
  if ((Test-Path README.md) -and ((Get-Content README.md -Raw) -match '<<<<<<<')) {
    Copy-Item -Force (Join-Path $web "poc-agent-mcp\README.md") README.md
    git add README.md
    git -c commit.gpgsign=false commit -m "Keep GitHub README" 2>$null
  }
}

Write-Host "3) Push → $AdoUrl" -ForegroundColor Cyan
git push -u azure "HEAD:$AdoBranch"
if ($LASTEXITCODE -ne 0) { throw "ADO push failed: $LASTEXITCODE — essaie en 4G / hors VPN HSO" }

Write-Host "OK — Azure DevOps à jour depuis GitHub." -ForegroundColor Green
