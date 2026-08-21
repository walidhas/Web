# Ticket de support — Échec agents Cursor / tool allowlist

**Date :** 2026-08-21  
**Demandeur :** walid hassayoun (`hassayoun.walid@gmail.com`)  
**Produit concerné :** Cursor Agent / Cursor CLI (IDE AI assistant)  
**Sévérité proposée :** High — blocage total de l’assistant (impossible de terminer une requête)  
**Environnement local :** `D:\Sources\data-framework` (branche `main`, modifications locales non commitées)

---

## Titre (à coller dans le portail)

**Cursor Agent bloqué : erreurs serveur répétées + « Unknown tool name in the tool allowlist » (`apply_patch`, `rg`) + attente indéfinie des background agents**

---

## Résumé

Lors de l’utilisation de l’assistant AI Cursor sur le dépôt `data-framework`, la session échoue de façon répétée. Les réponses sont interrompues par des erreurs serveur, un basculement automatique de modèle intervient, puis des erreurs de configuration d’allowlist d’outils apparaissent (`apply_patch`, `rg`). L’UI reste ensuite bloquée sur « Waiting for background agents ».

---

## Impact métier

- Impossible d’utiliser les agents / background agents Cursor sur ce workspace.
- Aucune correction de code ni assistance possible tant que la session reste bloquée.
- Perte de productivité sur le projet `data-framework`.

---

## Étapes de reproduction

1. Ouvrir le workspace `D:\Sources\data-framework` dans Cursor.
2. Lancer une requête agent (assistant / background agents).
3. Observer les messages d’erreur répétés et le blocage final.

---

## Comportement observé

1. **Erreurs serveur répétées** (environ 15 occurrences) :
   - `Response was interrupted due to a server error. Retrying...`
2. **Basculement automatique de modèle** :
   - `Model changed from gpt-5.6-sol (xhigh) to claude-sonnet-5 (xhigh) for this session. Use /config`
3. **Erreurs d’allowlist d’outils** :
   - `Unknown tool name in the tool allowlist: "apply_patch"`
   - `Unknown tool name in the tool allowlist: "rg"`
4. **Blocage UI** :
   - `Waiting for background agents · … esc stop agents`

## Comportement attendu

- Les requêtes agent se terminent sans interruption serveur permanente.
- Les noms d’outils de l’allowlist correspondent aux outils réellement exposés par la session (pas de `apply_patch` / `rg` inconnus).
- Les background agents aboutissent ou échouent avec un message d’erreur actionnable, sans hang indéfini.

---

## Analyse technique (hypothèse)

Deux problèmes distincts semblent se cumuler :

1. **Instabilité backend** : interruptions de réponse côté serveur, avec failover de modèle (`gpt-5.6-sol` → `claude-sonnet-5`).
2. **Désynchronisation de configuration** : l’allowlist référence des noms d’outils obsolètes ou non reconnus dans cette version de Cursor (`apply_patch`, `rg`), ce qui peut empêcher l’agent d’exécuter des outils essentiels (édition de fichiers / recherche) et contribuer au hang sur les background agents.

---

## Informations environnement

| Élément | Valeur |
|--------|--------|
| OS (d’après le chemin) | Windows |
| Workspace | `D:\Sources\data-framework` |
| Git | branche `main`, working tree dirty (`+9 -5`) |
| Modèle initial | `gpt-5.6-sol (xhigh)` |
| Modèle après failover | `claude-sonnet-5 (xhigh)` |
| Symptômes UI | Waiting for background agents |

> Joindre la capture d’écran console fournie avec ce ticket.

---

## Demande de correction

1. Corriger / mapper les noms d’outils de l’allowlist : remplacer ou retirer `apply_patch` et `rg` au profit des noms d’outils supportés par la version actuelle de Cursor (ou accepter ces alias côté serveur).
2. Investiguer les interruptions serveur répétées sur les sessions agent (modèle `gpt-5.6-sol` puis failover).
3. Éviter le hang indéfini « Waiting for background agents » : timeout + message d’erreur clair lorsque les outils / le backend échouent.
4. Documenter la liste officielle des noms d’outils autorisés dans l’allowlist pour éviter les configs invalides.

---

## Contournements tentés / possibles (côté utilisateur)

- Arrêter les agents (`esc` / stop agents) puis relancer la session.
- Vérifier `/config` et la configuration d’allowlist d’outils (retirer `apply_patch` et `rg` s’ils y figurent).
- Basculer manuellement de modèle si le failover automatique ne stabilise pas la session.
- Mettre à jour Cursor vers la dernière version stable.

---

## Où soumettre ce ticket

Ce problème concerne **Cursor** (pas un produit Microsoft Azure / Dynamics). Soumettre via :

1. **Cursor Support / Feedback** : [https://cursor.com](https://cursor.com) → Help / Contact / Feedback  
2. **Forum Cursor** : [https://forum.cursor.com](https://forum.cursor.com)  
3. En interne : coller le **Titre** + **Résumé** + **Comportement observé** + capture d’écran dans votre outil de ticketing (ServiceNow, Jira, etc.) si un ticket « Microsoft / IT » est requis par le process entreprise.

---

## Texte court prêt à coller (anglais — portail Cursor)

**Subject:** Agent session hung: repeated server errors + unknown tool allowlist names `apply_patch` / `rg`

**Body:**

While using Cursor Agent on Windows workspace `D:\Sources\data-framework`, the session repeatedly fails with:

- `Response was interrupted due to a server error. Retrying...` (many times)
- Automatic model switch: `gpt-5.6-sol (xhigh)` → `claude-sonnet-5 (xhigh)`
- `Unknown tool name in the tool allowlist: "apply_patch"`
- `Unknown tool name in the tool allowlist: "rg"`
- UI stuck on `Waiting for background agents`

Expected: agent completes successfully; tool allowlist only contains valid tool names for the current Cursor version; background agents do not hang indefinitely.

Please fix allowlist tool-name validation/mapping, investigate backend interruptions for `gpt-5.6-sol`, and improve failure handling for stuck background agents. Screenshot attached.

---

## Texte court prêt à coller (français — ticketing interne « Microsoft / IT »)

**Objet :** Blocage Cursor Agent — erreurs serveur + allowlist outils invalide (`apply_patch`, `rg`)

**Description :**

L’assistant Cursor est inutilisable sur le projet `data-framework`. La console affiche des erreurs serveur en boucle, un changement automatique de modèle, puis des erreurs « Unknown tool name in the tool allowlist » pour `apply_patch` et `rg`. L’interface reste bloquée sur « Waiting for background agents ».

**Impact :** blocage total de l’assistance AI de développement.  
**Action demandée :** ouvrir un ticket auprès du support Cursor / éditeur, et vérifier côté poste la configuration d’allowlist d’outils ainsi que la version de Cursor.  
**Pièce jointe :** capture d’écran console.
