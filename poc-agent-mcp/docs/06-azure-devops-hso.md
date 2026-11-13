# Héberger la solution sur Azure DevOps HSO

Pour le moment, la cible de partage est **uniquement Azure DevOps HSO**.  
Les collègues clonent ce repo et exécutent le bridge sous Visual Studio Code.

## Pourquoi DevOps HSO (et pas un zip)

| Critère | Zip / OneDrive | Repo Azure DevOps HSO |
|---------|----------------|------------------------|
| Versioning | Non | Oui (branches, PR) |
| Droits équipe | Fichiers partagés | Groupes / permissions projet |
| Onboarding | Manuel, fragile | `git clone` documenté |
| CI/CD bridge | Absent | Pipeline possible plus tard |
| Audit | Faible | Historique Git |

## Créer le repo (admin HSO)

1. Azure DevOps HSO → projet dédié (ex. `Agents-MCP` ou projet existant « Innovation / Copilot »)
2. **Repos → Files → New repository**
   - Nom : `Poc-Agent-MCP`
   - README initial : optionnel (on poussera celui du POC)
3. Noter l’URL clone HTTPS (ou SSH) :

```text
https://dev.azure.com/<ORG-HSO>/<PROJECT>/_git/Poc-Agent-MCP
```

4. Permissions :
   - **Contributors** : équipe bridge / architects
   - **Readers** : collègues qui doivent seulement cloner et lancer en local

## Pousser le contenu POC

Depuis une machine qui a déjà le code `poc-agent-mcp` :

```powershell
cd <chemin-local>\poc-agent-mcp
git init   # si pas déjà un git dédié
git remote add origin https://dev.azure.com/<ORG-HSO>/<PROJECT>/_git/Poc-Agent-MCP
git add .
git commit -m "Initial POC Agent MCP bridge + docs"
git push -u origin main
```

Variante si le code vit encore dans un monorepo GitHub : extraire uniquement `poc-agent-mcp/` vers ce repo DevOps (sparse checkout ou copie + push), pour que les collègues n’aient pas à naviguer dans un dépôt unrelated.

**Recommandation :** repo DevOps **dédié** dont la racine = contenu actuel de `poc-agent-mcp/` (`bridge/`, `docs/`, `README.md`, `.vscode/`).

## Ce que les collègues font ensuite

Voir [`../GETTING-STARTED.md`](../GETTING-STARTED.md) :

1. `git clone …`
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
