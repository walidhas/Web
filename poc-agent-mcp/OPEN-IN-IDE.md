# Ouvrir le POC en mode IDE (Cursor Desktop)

## 1. Dossier cible OneDrive

```text
C:\Users\WalidHassayoune\OneDrive - HSO\Documents\Travail\HSO\Poc Agent MCP
```

## 2. Synchroniser le contenu

Le Cloud Agent **ne peut pas écrire** directement sur ton OneDrive Windows. Choisis une option :

### Option A — script (recommandé)

Depuis le dossier `poc-agent-mcp` du repo (branche PR) :

```powershell
cd <chemin-du-repo>\poc-agent-mcp
.\sync-to-onedrive.ps1
```

Destination par défaut :
`C:\Users\WalidHassayoune\OneDrive - HSO\Documents\Travail\HSO\Poc Agent MCP`

### Option B — ZIP artefact

1. Télécharge `Poc-Agent-MCP.zip` depuis les artefacts de l’agent / la PR
2. Extrais **à la racine** du dossier OneDrive (pas dans un sous-dossier `poc-agent-mcp` imbriqué) :

```powershell
$dst = "C:\Users\WalidHassayoune\OneDrive - HSO\Documents\Travail\HSO\Poc Agent MCP"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Expand-Archive -Path "$env:USERPROFILE\Downloads\Poc-Agent-MCP.zip" -DestinationPath $dst -Force
```

### Option C — robocopy manuel

```powershell
$src = "C:\path\to\repo\poc-agent-mcp"
$dst = "C:\Users\WalidHassayoune\OneDrive - HSO\Documents\Travail\HSO\Poc Agent MCP"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
robocopy $src $dst /E /XD node_modules dist .git /XF .env agent.client.env
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
