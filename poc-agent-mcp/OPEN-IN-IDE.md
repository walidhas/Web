# Ouvrir le POC en mode IDE (Cursor Desktop)

## 1. Dossier cible OneDrive

```text
C:\Users\WalidHassayoune\OneDrive - HSO\Documents\Travail\HSO\Poc Agent MCP
```

## 2. Synchroniser le contenu

Depuis ce dépôt Git (branche `cursor/poc-agent-mcp-hso-bridge-3c8a`), copie le dossier `poc-agent-mcp/` **dans** le chemin OneDrive ci-dessus (contenu à la racine du dossier POC, pas un sous-dossier imbriqué inutile).

PowerShell (exemple si le repo est cloné ailleurs) :

```powershell
$src = "C:\path\to\repo\poc-agent-mcp\*"
$dst = "C:\Users\WalidHassayoune\OneDrive - HSO\Documents\Travail\HSO\Poc Agent MCP"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Path $src -Destination $dst -Recurse -Force
```

## 3. Cursor

1. **File → Open Folder…**
2. Sélectionne `Poc Agent MCP`
3. Ouvre `README.md` puis `docs/01-architecture.md`
4. Terminal dans `bridge` → `npm install` → `npm run dev`
5. Ou F5 → config **Bridge: npm run dev**

## 4. Première config

```powershell
cd bridge
Copy-Item ..\config\agent.client.example.env .env
notepad .env
```

Renseigne au minimum (depuis Copilot Studio client) :

- `ENVIRONMENT_ID`
- `SCHEMA_NAME`
- `CLIENT_TENANT_ID`
- `APP_CLIENT_ID`
- `BRIDGE_API_KEY`
- optionnel : `DIRECT_CONNECT_URL` (chaîne Agents SDK)

Puis `MOCK_MODE=false` quand tu es prêt à appeler l’agent Published.
