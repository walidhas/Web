# Ouvrir le POC dans Visual Studio Code

Source de vérité : Azure DevOps HSO  
`https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge`

## 1. Cloner

```powershell
cd $env:USERPROFILE\source\repos   # ou tout autre dossier de travail
git clone https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge
cd POC-Agent-MCPBridge
```

## 2. Visual Studio Code

```powershell
code .
```

Ou **File → Open Folder…** → sélectionner le dossier qui contient `bridge/`, `docs/`, `.vscode/`.

## 3. Lancer le bridge

```powershell
cd bridge
npm install
Copy-Item ..\config\agent.client.example.env .env
npm run dev
```

Ou **Run and Debug** → **Bridge: npm run dev** (F5).

## 4. Config

Renseigner `bridge/.env` (ne pas committer) :

- `ENVIRONMENT_ID`
- `SCHEMA_NAME`
- `CLIENT_TENANT_ID`
- `APP_CLIENT_ID`
- `BRIDGE_API_KEY`
- optionnel : `DIRECT_CONNECT_URL`

Puis `MOCK_MODE=false` pour appeler l’agent Symbio Published.

Voir aussi [`GETTING-STARTED.md`](GETTING-STARTED.md) et [`docs/03-bridge-hso.md`](docs/03-bridge-hso.md).
