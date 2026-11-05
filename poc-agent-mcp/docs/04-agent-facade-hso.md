# Agent façade — Copilot interne HSO

## Création

1. [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com) → environnement **HSO**
2. **Create** → blank agent  
   Nom : `HSO Symbio F&O UAT` (exemple)
3. Orchestration generative : ON
4. Instructions (exemple) :

```text
Tu es l’assistant HSO pour Dynamics 365 Finance & Operations Symbio (UAT).
Pour toute question ou action métier F&O, délègue au connected agent « Symbio D365 Bridge ».
Ne invente pas de données ERP. Si le bridge est indisponible, indique-le clairement.
```

## Connected agent (SDK)

1. **Build → Connected agents → Add**
2. **Microsoft 365 Agents SDK agent**
3. Messaging endpoint :
   - Local test (tunnel) : `https://<ngrok>/api/messages`
   - Prod : `https://<bridge-hso>/api/messages`
4. Name : `Symbio D365 Bridge` (≤ 30 car.)
5. Description riche (routing) : F&O, clients, commandes, inventaire, Symbio UAT…
6. Auth : **API key** → même valeur que `BRIDGE_API_KEY`
7. Add to agent → Publish

## Canal Copilot HSO

1. Canaux → **Microsoft 365 Copilot** / Teams
2. Publier / rendre disponible selon la gouvernance HSO (admin MAC si besoin)

## Tests

1. Dans Copilot HSO : « Liste les clients actifs sur Symbio UAT »
2. Vérifier les logs du bridge (`POST /api/messages`)
3. Vérifier l’appel MCP côté agent client (Superviser / Test chat client)
