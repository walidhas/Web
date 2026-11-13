# POC Agent MCP — Symbio D365 → Copilot HSO

Solution HSO pour exposer l’agent Copilot Studio **Symbio D365 UAT MCP** (tenant client) vers le **Copilot interne HSO**, via un bridge Microsoft 365 Agents SDK.

**Source de vérité :** Azure DevOps **HSO** (pas de zip, pas de copie OneDrive).  
Les collègues clonent le repo, ouvrent le projet dans **Visual Studio Code**, et lancent le bridge en local.

## Prérequis (poste collègue)

| Outil | Version |
|-------|---------|
| Git | 2.x+ |
| Node.js | **22 LTS** ou + |
| Visual Studio Code | récent |
| Extension VS Code | optionnel : ESLint / PowerShell |
| Compte | accès lecture (ou contribute) au projet Azure DevOps HSO |

## Cloner depuis Azure DevOps HSO

> Remplacer l’URL par celle du repo HSO une fois créé (voir [`docs/06-azure-devops-hso.md`](docs/06-azure-devops-hso.md)).

```powershell
# Exemple — URL à confirmer avec l’équipe HSO
git clone https://dev.azure.com/<ORG-HSO>/<PROJECT>/_git/Poc-Agent-MCP
cd Poc-Agent-MCP\poc-agent-mcp
```

Si le repo ne contient **que** le dossier solution (racine = bridge + docs) :

```powershell
git clone https://dev.azure.com/<ORG-HSO>/<PROJECT>/_git/Poc-Agent-MCP
cd Poc-Agent-MCP
```

## Ouvrir dans Visual Studio Code

1. **File → Open Folder…**
2. Sélectionner le dossier `poc-agent-mcp` (celui qui contient `bridge/`, `docs/`, `.vscode/`)
3. Ouvrir un terminal intégré (**Terminal → New Terminal**)

## Lancer le bridge (MOCK, sans secrets client)

```powershell
cd bridge
npm install
Copy-Item ..\config\agent.client.example.env .env
npm run dev
```

Vérifier : navigateur ou curl → `http://localhost:3978/health`  
→ `mockMode: true` tant que les identifiants Copilot Studio client ne sont pas renseignés.

Ou **F5** / Run and Debug → configuration **Bridge: npm run dev**.

## Brancher l’agent Symbio (après MOCK)

1. Éditer `bridge/.env` (ne jamais committer ce fichier) :
   - `ENVIRONMENT_ID`, `SCHEMA_NAME`, `CLIENT_TENANT_ID`, `APP_CLIENT_ID`
   - optionnel : `DIRECT_CONNECT_URL`
   - `BRIDGE_API_KEY`
   - `MOCK_MODE=false`
2. Relancer `npm run dev`
3. Auth Entra : device code dans le terminal (permission `CopilotStudio.Copilots.Invoke`)

Détail : [`docs/03-bridge-hso.md`](docs/03-bridge-hso.md)

## Architecture (rappel)

```text
[Copilot HSO] → [Agent façade HSO] → [Bridge] → [Symbio D365 UAT MCP] → [F&O …/mcp]
```

| Composant | Où | Rôle |
|-----------|-----|------|
| Agent métier | Tenant **client** (Symbio) | MCP D365 UAT |
| Bridge | Local (dev) / Azure HSO (cible) | Agents SDK → agent client |
| Agent façade | Tenant **HSO** | Copilot / Teams interne |
| Code source | **Azure DevOps HSO** | Clone + run pour l’équipe |

> Le mode multitenant Copilot Studio (preview) **ne supporte pas les outils MCP**.

Docs : [`docs/01-architecture.md`](docs/01-architecture.md) · Mise sur DevOps : [`docs/06-azure-devops-hso.md`](docs/06-azure-devops-hso.md)

## Structure

```text
poc-agent-mcp/
├── README.md                 # Ce fichier — démarrage collègues
├── GETTING-STARTED.md        # Checklist clone → VS Code → bridge
├── docs/                     # Architecture & modes opératoires
├── config/                   # Templates .env (sans secrets)
├── bridge/                   # API Node.js Agents SDK
└── .vscode/                  # Launch / settings Visual Studio Code
```

## Identifiants de référence (Symbio UAT — ne pas mettre de secrets ici)

| Champ | Valeur |
|-------|--------|
| Nom agent | `Symbio D365 UAT MCP` |
| Environment ID | `4f680da5-2dcc-eace-a4eb-9787feeef742` |
| Schema / bot | voir Copilot Studio client → Settings → Advanced |
| MCP F&O | `https://symbiouat.sandbox.operations.eu.dynamics.com/mcp` |

La chaîne Agents SDK se copie depuis Copilot Studio client → Application ; elle va dans `.env` local uniquement.
