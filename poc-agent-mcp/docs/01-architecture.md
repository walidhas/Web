# Architecture

## Contexte

- Agent **Symbio D365 UAT MCP** publié sur le tenant **client** (Power Platform).
- Données et sécurité F&O restent sur `symbiouat.sandbox.operations.eu.dynamics.com`.
- HSO veut consommer depuis le **Copilot interne** (tenant HSO).

## Pourquoi un bridge

| Approche | Copilot HSO | MCP D365 | Verdict |
|----------|-------------|----------|---------|
| Multitenant Copilot Studio | Oui (preview) | Non supporté | Rejeté |
| Iframe Web Chat | Non | Limité | Site web seulement |
| Guests sur tenant client | Non (Copilot client) | Oui | Court terme |
| Agent recréé sur HSO + URL MCP | Oui | Oui si guests F&O | Auth lourde |
| **Bridge Agents SDK + façade HSO** | **Oui** | **Oui** | **Cible POC** |

Le MCP Dynamics 365 ERP exige une **identité authentifiée** dans F&O. L’agent métier doit rester hébergé là où la connexion MCP et Dataverse existent.

## Flux cible

```text
User HSO
  → Microsoft 365 Copilot / Teams (tenant HSO)
    → Agent façade Copilot Studio (HSO)
      → Connected agent (Activity /api/messages)
        → Bridge Azure HSO (Agents SDK client)
          → Power Platform API (tenant client)
            → Symbio D365 UAT MCP
              → https://…operations.eu.dynamics.com/mcp
```

## Identités

1. **User → Copilot HSO** : Entra HSO (SSO).
2. **Façade → Bridge** : API key ou OAuth (config Connected agent).
3. **Bridge → Agent client** : token Entra avec scope Power Platform `CopilotStudio.Copilots.Invoke` (user interactif ou flux guest).
4. **Agent client → MCP F&O** : identité de la connexion MCP (user F&O / guest provisionné).

## Facturation & conformité

- Crédits Copilot Studio de l’**agent métier** : tenant **hôte** (client).
- Ne pas activer « No authentication » en prod pour F&O.
- Préférer l’identité consultant (guest) pour la traçabilité des actions MCP.
