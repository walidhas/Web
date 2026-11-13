# HSO Copilot Studio Bridge — package partageable

Pattern : **Agent façade (HSO)** → **Bridge** (`POST /api/messages`) → **Agent métier client** (Agents SDK) → tools (ex. MCP F&O).

## Contenu du zip

| Dossier / fichier | Rôle |
|-------------------|------|
| `bridge/` | Code Node.js (Agents SDK + Express) |
| `bridge/.env.example` | Template config (copier vers `.env`) |
| `docs/01-architecture.md` | Architecture + schéma |
| `docs/07-enterprise-bridge-azure.md` | Cible Azure |
| `docs/08-mode-operatoire-technique-clients.md` | **Mode opératoire multi-clients (étapes)** |
| `docs/images/` | Schéma architecture |

## Démarrage rapide

1. Lire `docs/08-mode-operatoire-technique-clients.md`
2. `cd bridge` → `npm ci` → copier `.env.example` → `.env` → renseigner
3. `npm run dev` → `curl http://localhost:3978/health`
4. Suivre les étapes Entra / agent client / façade / tunnel ou Azure

## Sécurité

Ne pas mettre de secrets dans le zip ni dans les tickets.  
Chaque client = son `.env` / Key Vault.
