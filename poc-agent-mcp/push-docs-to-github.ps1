#Requires -Version 5.1
<#
.SYNOPSIS
  Pousse les docs/POC locaux (dossier courant ou -PocSource) vers GitHub walidhas/Web.
#>
[CmdletBinding()]
param(
  [string]$DocsSource = (Join-Path $PSScriptRoot "docs"),
  [string]$PocSource = $PSScriptRoot,
  [string]$GithubUrl = "https://github.com/walidhas/Web.git",
  [string]$Branch = "cursor/poc-agent-mcp-latest-docs-3c8a",
  [switch]$FullPoc
)

$ErrorActionPreference = "Continue"
$work = Join-Path $env:TEMP "Web-github-docs-sync"
Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue

Write-Host "Clone GitHub → $work" -ForegroundColor Cyan
git clone $GithubUrl $work
if ($LASTEXITCODE -ne 0) { throw "git clone GitHub failed: $LASTEXITCODE" }

Set-Location $work
git fetch origin
git checkout -B $Branch origin/main 2>$null
if ($LASTEXITCODE -ne 0) {
  git checkout -B $Branch
}

$destPoc = Join-Path $work "poc-agent-mcp"
if (-not (Test-Path $destPoc)) { New-Item -ItemType Directory -Path $destPoc | Out-Null }

if ($FullPoc) {
  if (-not (Test-Path $PocSource)) { throw "POC source missing: $PocSource" }
  Write-Host "Sync full POC from $PocSource…" -ForegroundColor Cyan
  robocopy $PocSource $destPoc /E /XD node_modules dist .git /XF .env agent.client.env /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed: $LASTEXITCODE" }
} else {
  if (-not (Test-Path $DocsSource)) { throw "Docs source missing: $DocsSource" }
  $destDocs = Join-Path $destPoc "docs"
  Remove-Item -Recurse -Force $destDocs -ErrorAction SilentlyContinue
  Copy-Item -Recurse -Force $DocsSource $destDocs
}

git add poc-agent-mcp
git status
git commit -m "Sync latest local POC docs to GitHub."
if ($LASTEXITCODE -ne 0) {
  Write-Host "Nothing to commit or commit failed ($LASTEXITCODE)" -ForegroundColor Yellow
  exit 0
}

git push -u origin "HEAD:$Branch"
if ($LASTEXITCODE -ne 0) { throw "git push GitHub failed: $LASTEXITCODE" }

Write-Host "OK — branch: $Branch" -ForegroundColor Green
Write-Host "https://github.com/walidhas/Web/tree/$Branch/poc-agent-mcp/docs"
