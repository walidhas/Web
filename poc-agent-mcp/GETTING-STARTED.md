# Getting started — collègues HSO

Objectif : **cloner** le projet depuis Azure DevOps HSO, l’ouvrir dans **Visual Studio Code**, **exécuter le bridge**.

## 1. Accès DevOps HSO

1. Se connecter à Azure DevOps HSO (compte Entra HSO)
2. Vérifier l’accès au projet **D365FO Add-Ins** / repo **POC-Agent-MCPBridge** (Reader minimum)
3. Si accès refusé → demander au owner du projet HSO

```text
https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge
```

Voir [`docs/06-azure-devops-hso.md`](docs/06-azure-devops-hso.md).

## 2. Prérequis machine

```powershell
node -v    # >= 22
npm -v
git --version
code --version
```

Installer si besoin : [Node 22 LTS](https://nodejs.org/) · [VS Code](https://code.visualstudio.com/) · Git for Windows.

## 3. Clone

```powershell
cd $env:USERPROFILE\source\repos   # ou tout autre dossier de travail
git clone https://dev.azure.com/HSO-France/D365FO%20Add-Ins/_git/POC-Agent-MCPBridge
cd POC-Agent-MCPBridge
```

## 4. Visual Studio Code

```powershell
code .
```

Ou : **File → Open Folder…** → sélectionner le dossier qui contient `bridge/` et `.vscode/`.

## 5. Premier run (MOCK)

```powershell
cd bridge
npm install
Copy-Item ..\config\agent.client.example.env .env
npm run dev
```

Attendu dans le terminal :

```text
HSO Symbio MCP bridge listening on http://localhost:3978
mockMode=true ...
```

Test :

```powershell
Invoke-RestMethod http://localhost:3978/health
```

## 6. Run & Debug (VS Code)

1. Copier `.env` comme ci-dessus
2. **Run and Debug** (Ctrl+Shift+D)
3. Choisir **Bridge: npm run dev**
4. F5

## 7. Appeler l’agent Symbio (hors MOCK)

Réservé aux collègues qui ont :

- App registration / droits Entra adéquats
- Accès à l’environnement Power Platform Symbio (ou guest)
- Valeurs `SCHEMA_NAME`, `CLIENT_TENANT_ID`, `APP_CLIENT_ID` (et éventuellement `DIRECT_CONNECT_URL`)

Dans `bridge/.env` : renseigner les champs, `MOCK_MODE=false`, relancer.

Ne **jamais** committer `bridge/.env`.

## Ce qu’on ne fait pas

- Pas de distribution par **zip**
- Pas de copie OneDrive comme canal officiel
- Pas de dépendance à un IDE propriétaire : **Visual Studio Code** suffit
