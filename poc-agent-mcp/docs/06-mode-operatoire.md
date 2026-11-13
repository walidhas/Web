# Mode opératoire — POC Bridge HSO ↔ Symbio

Runbook pas-à-pas **spécifique Symbio / lab**.  
Pour partage collègues / autres clients : **[08-mode-operatoire-technique-clients.md](08-mode-operatoire-technique-clients.md)** + zip `share/hso-copilot-studio-bridge-*.zip`.

Prérequis lecture : [01-architecture.md](01-architecture.md).

---

## A. Prérequis

| # | Élément | Qui |
|---|---------|-----|
| A1 | Node.js ≥ 22 | Dev HSO |
| A2 | Accès Copilot Studio **Symbio** (agent Published) | Symbio / HSO guest |
| A3 | Accès Copilot Studio **HSO** (créer façade) | HSO |
| A4 | App registration Entra (voir B) | Admin Entra Symbio ou multi-tenant |
| A5 | Capacité Copilot Studio sur l’env Symbio (crédits ou PAYG) | Admin PP Symbio — **bloquant métier** |
| A6 | Tunnel HTTPS (Cloudflare / Dev Tunnel) si bridge local | Dev HSO |

Chemin projet :

```text
…\Poc Agent MCP\poc-agent-mcp\
```

---

## B. Entra — App pour invoke Symbio (Delegated / interactive)

### B1. Créer ou vérifier l’app

1. Entra (idéalement tenant **Symbio**) → **App registrations** → app POC  
   Client ID exemple POC : renseigné dans `bridge/.env` → `APP_CLIENT_ID`
2. **Authentication**
   - Platform **Mobile and desktop applications**
   - Redirect URI : `http://localhost`  
     *(obligatoire — sinon `AADSTS500113 No reply address`)*
   - **Allow public client flows** = **Yes**
3. **API permissions**
   - **APIs my organization uses** → **Power Platform API**
   - **Delegated** : `CopilotStudio.Copilots.Invoke`
   - Consent admin si requis (« Granted for Symbio »)
4. Si Power Platform API n’apparaît pas : provisionner l’API sur le tenant  
   [docs Microsoft](https://learn.microsoft.com/power-platform/admin/programmability-authentication-v2#step-2-configure-api-permissions)

### B2. Conditional Access

Si login device code / browser → *Accès impossible* après authentification réussie :

- Exclure le compte POC et/ou l’app du CA qui bloque **device code** / clients publics / devices non compliant  
- Ou utiliser uniquement `AUTH_MODE=interactive` (souvent mieux accepté que device code)

### B3. Option Application (hors chemin nominal POC)

Pour `AUTH_MODE=client_credentials` + `APP_CLIENT_SECRET` :

- Ajouter la **même** permission en type **Application** (pas seulement Delegated)
- **Grant admin consent**
- Sinon : token obtenu mais invoke Symbio → **403**

---

## C. Symbio — Agent métier & connection string

1. Copilot Studio **tenant Symbio** → agent **Symbio D365 UAT MCP** (Published)
2. **Channels** → Web app / Native app → **Microsoft 365 Agents SDK** → **Copy** connection string  
   → coller dans `bridge/.env` : `CONNECTION_STRING=…`
3. **Settings → Advanced → Metadata** : noter Environment ID + Schema name  
   (fallback si pas de connection string)
4. Vérifier checklists F&O / MCP : [02-copilot-studio-client.md](02-copilot-studio-client.md)
5. **Power Platform Admin** → licences Copilot Studio : capacité **> 0** ou plan PAYG sur l’environnement

Valeurs POC connues :

| Variable | Exemple |
|----------|---------|
| `CLIENT_TENANT_ID` | `7d842853-a1df-4c03-a44c-b4cd5bdbb496` |
| `ENVIRONMENT_ID` | `4f680da5-2dcc-eace-a4eb-9787feeef742` |
| `SCHEMA_NAME` | `cr10d_symbiod365uatmcp_9v0lfl` |

---

## D. Bridge local — Configuration & démarrage

### D1. Installer

```powershell
cd "…\Poc Agent MCP\poc-agent-mcp\bridge"
npm install
```

### D2. Fichier `.env` (ne pas committer)

Copier depuis `config/agent.client.example.env` si besoin, puis renseigner :

```env
PORT=3978
CONNECTION_STRING=<DirectConnect URL Symbio>
CLIENT_TENANT_ID=<tenant GUID Symbio>
ENVIRONMENT_ID=4f680da5-2dcc-eace-a4eb-9787feeef742
SCHEMA_NAME=cr10d_symbiod365uatmcp_9v0lfl
APP_CLIENT_ID=<app Entra>
AUTH_MODE=interactive
# APP_CLIENT_SECRET=   # commenté pour interactive
BRIDGE_API_KEY=<clé alphanumérique partagée avec la façade>
MOCK_MODE=false
```

Règles :

- `MOCK_MODE=true` → réponses locales sans appeler Symbio (smoke IDE)
- `BRIDGE_API_KEY` : **alphanumérique** (éviter `/` `+` `=` dans la clé)

### D3. Lancer

```powershell
npm run dev
```

Ou F5 → config **Bridge: npm run dev** (workspace `.vscode/launch.json`).

Attendu console :

```text
HSO Symbio MCP bridge listening on http://localhost:3978
mockMode=false canCallCopilotStudio=true
```

### D4. Smoke local

```powershell
curl.exe -sS http://localhost:3978/health
```

JSON attendu : `"ok":true`, `"authMode":"interactive"`.

Test message (PowerShell) :

```powershell
$body = @{
  type = "message"; id = "local-1"; text = "Bonjour"
  conversation = @{ id = "conv-1" }
  from = @{ id = "u1"; name = "test" }
} | ConvertTo-Json -Compress

Invoke-RestMethod -Uri "http://localhost:3978/api/messages" `
  -Method Post -ContentType "application/json" `
  -Headers @{ "x-api-key" = "<BRIDGE_API_KEY>" } `
  -Body $body -TimeoutSec 300
```

Au premier appel `interactive` : navigateur → login compte Symbio → page « HSO bridge — login OK ».

Réponses possibles :

| Texte | Signification |
|-------|----------------|
| Réponse métier / agent | OK bout-en-bout Symbio |
| *out of credits* | Auth + invoke OK ; **crédits Symbio** à provisionner |
| 403 Forbidden | Permission Application manquante (si client_credentials) ou droits agent |
| Timeout / CA | Login interactif non terminé ou Conditional Access |

---

## E. Exposer le bridge (obligatoire pour la façade HSO)

Copilot Studio cloud **ne peut pas** joindre `http://localhost:3978`.

### E1. Cloudflare quick tunnel (POC)

```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3978 --no-autoupdate
```

Noter l’URL `https://….trycloudflare.com`.

Vérifier :

```powershell
curl.exe -sS "https://<tunnel>/health"
```

### E2. Microsoft Dev Tunnel (recommandé si Cloudflare bloqué par APIM)

```powershell
devtunnel user login
devtunnel host -p 3978 --allow-anonymous
```

Utiliser l’URL `https://….devtunnels.ms` affichée.

### E3. Règles tunnel

- Laisser le process tunnel **et** le bridge tournés pendant les tests
- **Chaque redémarrage** Cloudflare quick tunnel → **nouvelle URL** → republier le Connected agent
- Ne pas laisser l’ancien endpoint `loca.lt` (timeout / 503 Tunnel Unavailable)

---

## F. Agent façade HSO + Connected agent

Détail UI : [04-agent-facade-hso.md](04-agent-facade-hso.md).

### F1. Créer la façade

1. Copilot Studio **HSO** → Create → blank agent (ex. `HSO Symbio F&O UAT`)
2. Orchestration generative : ON
3. Instructions : déléguer F&O au connected agent ; ne pas inventer de données ERP
4. **Ne pas** ajouter le tool Dynamics 365 ERP MCP sur HSO

### F2. Connected agent

1. **Build → Connected agents → Add** → **Microsoft 365 Agents SDK agent**
2. Messaging endpoint : `https://<tunnel-or-azure>/api/messages`
3. Nom : ex. `Symbio D365 Bridge` (≤ 30 car.)
4. Description riche (routing) : F&O, clients, commandes, inventaire, Symbio UAT…
5. Auth : **API key** = même valeur que `BRIDGE_API_KEY`  
   Header / champ = **`x-api-key`** (pas d’espace dans le nom)
6. Add → **Publish** la façade

### F3. Canal Copilot / Teams

1. Channels → Microsoft 365 Copilot / Teams  
2. Publier / rendre disponible selon gouvernance HSO

### F4. Test façade

Prompt : « Liste les clients actifs sur Symbio UAT » (ou entités juridiques).

**Succès réseau** = dans le terminal bridge :

```text
[bridge] POST /api/messages headers=[…] type=message
```

Puis soit réponse métier, soit message crédits Symbio.

---

## G. Déploiement Azure (cible entreprise)

> Guide delta complet : **[07-enterprise-bridge-azure.md](07-enterprise-bridge-azure.md)**.

### G1. Modifications minimales à appliquer

| Zone | Modifier |
|------|----------|
| Entra Symbio | Permission **Application** `CopilotStudio.Copilots.Invoke` + admin consent ; app confidential + secret/cert |
| Env bridge | `AUTH_MODE=client_credentials`, `APP_CLIENT_SECRET`, secrets en Key Vault (plus de `.env` laptop) |
| Azure HSO | App Service Node 22 + MI → Key Vault + (reco) App Insights |
| Code | `npm run build` / `npm run start` ; listen `0.0.0.0` (déjà prévu pour containers) |
| Copilot HSO | Connected agent endpoint = `https://<app>.azurewebsites.net/api/messages` + nouvelle API key → **Publish** |
| À retirer | Tunnel Cloudflare / Dev Tunnel / `AUTH_MODE=interactive` en prod |

### G2. Ordre d’exécution

1. Entra Application permission + consent  
2. Provisionner App Service + Key Vault  
3. Déployer `bridge/`  
4. Smoke `/health` puis `/api/messages`  
5. Mettre à jour Connected agent + Publish  
6. Test Copilot HSO  

---


## H. Matrice de dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `AADSTS500113` No reply address | Redirect URI manquant | Ajouter `http://localhost` (Mobile/desktop) |
| Accès impossible après login | Conditional Access | Exclusion CA / compte compliant / interactive |
| Device code expired | Login non fait à temps | Relancer invoke ; préférer interactive |
| 403 `-140032` en client_credentials | Permission **Application** absente | Ajouter Application + admin consent **ou** repasser interactive |
| *out of credits* | Capacité Copilot Symbio = 0 | Affecter crédits / PAYG sur l’env agent |
| Failed tool / 500 APIM *field name* | Clé / header invalide | `BRIDGE_API_KEY` alphanumérique ; header `x-api-key` |
| 502 / 503 Tunnel Unavailable | Tunnel mort ou mauvaise URL | Vérifier process tunnel ; republier endpoint actuel |
| Unable to connect to CS agent | Endpoint non joignable | Tunnel up + URL exacte `/api/messages` + Publish |
| Aucun log `POST` sur le bridge | Trafic n’arrive pas | Endpoint / Publish / tunnel |
| Health OK mais mock | `MOCK_MODE=true` | Mettre `false` + restart |

### Ordre de diagnostic recommandé

1. `GET http://localhost:3978/health`
2. `GET https://<tunnel>/health`
3. `POST` local `/api/messages` (bypass façade)
4. Logs bridge pendant test façade (`POST` présent ?)
5. Message agent (crédits / métier / erreur)

---

## I. Checklist « go / no-go » session de démo

- [ ] Bridge `npm run dev` up, `mockMode=false`
- [ ] Tunnel up, `/health` public 200
- [ ] Connected agent republished avec **l’URL tunnel du jour**
- [ ] `BRIDGE_API_KEY` alignée façade ↔ `.env`
- [ ] Login interactive déjà fait (ou prêt à ouvrir le navigateur au 1er call)
- [ ] Admin Symbio a confirmé **crédits** sur l’environnement agent
- [ ] Prompt de test prêt ; logs bridge visibles

---

## J. Sécurité

- Ne jamais committer `bridge/.env`, connection strings, client secrets
- Rotation du secret app si exposé (chat, ticket, capture d’écran)
- API key façade : longue, alphanumérique, stockée hors git
- En prod : Key Vault, HTTPS only, privilégier OAuth façade→bridge plutôt qu’API key seule

---

## K. Contacts / ownership (à compléter)

| Sujet | Owner |
|-------|--------|
| Crédits Copilot Symbio | |
| Conditional Access Symbio | |
| App registration Entra | |
| Agent façade HSO / Publish | |
| Bridge / tunnel / Azure | |
