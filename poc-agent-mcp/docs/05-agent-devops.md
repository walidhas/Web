# Agent MCP Azure DevOps (Symbio)

Deuxième agent (ou second tool sur un agent dédié).

## Endpoint

- Org : `https://dev.azure.com/symbiofcell/`
- MCP remote : `https://mcp.dev.azure.com/symbiofcell`

## Copilot Studio (tenant client recommandé)

1. Nouvel agent : `Symbio Azure DevOps MCP`
2. Tools → Add → Model Context Protocol
3. URL : `https://mcp.dev.azure.com/symbiofcell`
4. Auth OAuth 2.0 (Entra) — scope typique :  
   `2a72489c-aab2-4b65-b93a-a91edccf33b8/.default offline_access`
5. Org Entra-backed (pas MSA seul)

## Exposition HSO

Même pattern que D365 : bridge SDK + façade HSO, **ou** second connected agent si tu publies un agent DevOps séparé côté client.

Pour le POC, traiter **après** le flux D365 stabilisé.
