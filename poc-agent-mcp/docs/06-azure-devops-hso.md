# Héberger la solution sur Azure DevOps HSO

Pour le moment, la cible de partage est **uniquement Azure DevOps HSO**.  
Les collègues clonent ce repo et exécutent le bridge sous Visual Studio Code.

## Repo officiel

| Champ | Valeur |
|-------|--------|
| Organisation | `HSO-France` |
| Projet | `D365FO Add-Ins` |
| Repo | `POC-Agent-MCPBridge` |
| Clone HTTPS | `https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge` |

## Pourquoi DevOps HSO (et pas un zip)

| Critère | Zip / OneDrive | Repo Azure DevOps HSO |
|---------|----------------|------------------------|
| Versioning | Non | Oui (branches, PR) |
| Droits équipe | Fichiers partagés | Groupes / permissions projet |
| Onboarding | Manuel, fragile | `git clone` documenté |
| CI/CD bridge | Absent | Pipeline possible plus tard |
| Audit | Faible | Historique Git |

## Permissions

- **Contributors** : équipe bridge / architects
- **Readers** : collègues qui doivent seulement cloner et lancer en local

## Push initial (depuis une machine authentifiée HSO)

Le Cloud Agent n’a pas de PAT Azure DevOps. Le push se fait depuis un poste HSO déjà connecté (navigateur / Credential Manager / PAT).

### Option A — script (recommandé)

Depuis le dossier `poc-agent-mcp` (contenu solution) :

```powershell
.\push-to-ado.ps1
```

### Option B — manuel

```powershell
cd <chemin>\poc-agent-mcp
git init -b main   # si pas déjà un git dédié à cette racine
git remote remove azure 2>$null
git remote add azure https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge
git add .
git commit -m "Initial POC Agent MCP Bridge"
git push -u azure main
```

Si le remote refuse un historique non fast-forward (repo déjà initialisé avec un README) :

```powershell
git pull azure main --allow-unrelated-histories
# résoudre si besoin, puis :
git push -u azure main
```

**Recommandation :** racine du repo DevOps = contenu de `poc-agent-mcp/` (`bridge/`, `docs/`, `README.md`, `.vscode/`).

## Ce que les collègues font ensuite

Voir [`../GETTING-STARTED.md`](../GETTING-STARTED.md) :

1. `git clone https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge`
2. `code .` (Visual Studio Code)
3. `cd bridge` → `npm install` → `npm run dev`

## Secrets

| Élément | Où |
|---------|-----|
| `bridge/.env` | Local uniquement (gitignored) |
| Secrets prod (API key, client secret) | Azure Key Vault / Variable groups DevOps — **pas** le repo |
| Template | `config/agent.client.example.env` |

## Suite (hors scope immédiat)

- Pipeline YAML : build `bridge` + deploy App Service
- Environments DevOps : `dev` / `uat`
- Variable group lié au Key Vault HSO

Document bridge runtime : [`03-bridge-hso.md`](03-bridge-hso.md)
