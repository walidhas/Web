# Ticket Microsoft / GitHub Support — Échec GitHub Copilot Agent

**Date :** 2026-08-21  
**Demandeur :** walid hassayoun (`hassayoun.walid@gmail.com`)  
**Produit concerné :** GitHub Copilot (Coding Agent / Copilot Chat agent mode)  
**Éditeur / éditeur IDE :** VS Code ou terminal intégré sur Windows  
**Sévérité proposée :** High — blocage total de Copilot Agent (impossible de terminer une requête)  
**Environnement local :** `D:\Sources\data-framework` (branche `main`, modifications locales non commitées)

---

## Titre (à coller dans le portail Microsoft / GitHub Support)

**GitHub Copilot Agent bloqué : erreurs serveur répétées + « Unknown tool name in the tool allowlist » (`apply_patch`, `rg`) + attente indéfinie des background agents**

---

## Résumé

Lors de l’utilisation de **GitHub Copilot** (mode agent / background agents) sur le dépôt `data-framework`, la session échoue de façon répétée. Les réponses sont interrompues par des erreurs serveur, un basculement automatique de modèle intervient, puis des erreurs de configuration d’allowlist d’outils apparaissent (`apply_patch`, `rg`). L’UI reste ensuite bloquée sur « Waiting for background agents ».

---

## Impact métier

- Impossible d’utiliser GitHub Copilot Agent / background agents sur ce workspace.
- Aucune correction de code ni assistance Copilot possible tant que la session reste bloquée.
- Perte de productivité sur le projet `data-framework`.

---

## Étapes de reproduction

1. Ouvrir le workspace `D:\Sources\data-framework` dans l’IDE avec GitHub Copilot activé.
2. Lancer une requête Copilot Agent (assistant / background agents).
3. Observer les messages d’erreur répétés dans la console Copilot et le blocage final.

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

- Les requêtes GitHub Copilot Agent se terminent sans interruption serveur permanente.
- Les noms d’outils de l’allowlist correspondent aux outils réellement exposés par Copilot (pas de `apply_patch` / `rg` inconnus).
- Les background agents aboutissent ou échouent avec un message d’erreur actionnable, sans hang indéfini.

---

## Analyse technique (hypothèse)

Deux problèmes distincts semblent se cumuler :

1. **Instabilité backend GitHub Copilot** : interruptions de réponse côté serveur, avec failover de modèle (`gpt-5.6-sol` → `claude-sonnet-5`).
2. **Désynchronisation de configuration** : l’allowlist référence des noms d’outils obsolètes ou non reconnus par la version actuelle de Copilot Agent (`apply_patch`, `rg`), ce qui peut empêcher l’agent d’exécuter des outils essentiels (édition de fichiers / recherche) et contribuer au hang sur les background agents.

---

## Informations environnement

| Élément | Valeur |
|--------|--------|
| Produit | GitHub Copilot Agent |
| OS (d’après le chemin) | Windows |
| Workspace | `D:\Sources\data-framework` |
| Git | branche `main`, working tree dirty (`+9 -5`) |
| Modèle initial | `gpt-5.6-sol (xhigh)` |
| Modèle après failover | `claude-sonnet-5 (xhigh)` |
| Symptômes UI | Waiting for background agents |

> Joindre la capture d’écran console Copilot fournie avec ce ticket.

---

## Demande de correction (à Microsoft / GitHub)

1. Corriger / mapper les noms d’outils de l’allowlist Copilot Agent : remplacer ou retirer `apply_patch` et `rg` au profit des noms d’outils supportés par la version actuelle (ou accepter ces alias côté serveur).
2. Investiguer les interruptions serveur répétées sur les sessions Copilot Agent (modèle `gpt-5.6-sol` puis failover).
3. Éviter le hang indéfini « Waiting for background agents » : timeout + message d’erreur clair lorsque les outils / le backend échouent.
4. Documenter la liste officielle des noms d’outils autorisés dans l’allowlist Copilot Agent.

---

## Contournements tentés / possibles (côté utilisateur)

- Arrêter les agents (`esc` / stop agents) puis relancer la session Copilot.
- Vérifier la configuration d’allowlist d’outils Copilot (retirer `apply_patch` et `rg` s’ils y figurent).
- Basculer manuellement de modèle si le failover automatique ne stabilise pas la session.
- Mettre à jour l’extension **GitHub Copilot** et **GitHub Copilot Chat** vers la dernière version.
- Se déconnecter / reconnecter au compte GitHub Copilot, puis redémarrer l’IDE.

---

## Où soumettre ce ticket Microsoft / GitHub

1. **GitHub Support** (recommandé pour Copilot) : [https://support.github.com](https://support.github.com) → Contact Support → produit **GitHub Copilot**
2. **GitHub Copilot Feedback** : [https://github.com/github/copilot-feedback/issues](https://github.com/github/copilot-feedback/issues) (issues publiques / feedback produit)
3. **Microsoft 365 / Enterprise** (si licence Copilot via contrat Microsoft) : portail [https://admin.microsoft.com](https://admin.microsoft.com) → Support → Créer une demande, catégorie GitHub Copilot / Visual Studio
4. **VS Code Copilot issue tracker** (si reproduit dans VS Code) : [https://github.com/microsoft/vscode-copilot-release/issues](https://github.com/microsoft/vscode-copilot-release/issues)

---

## Texte court prêt à coller (anglais — GitHub / Microsoft Support)

**Subject:** GitHub Copilot Agent hung: repeated server errors + unknown tool allowlist names `apply_patch` / `rg`

**Product:** GitHub Copilot (Coding Agent / background agents)

**Body:**

While using GitHub Copilot Agent on Windows workspace `D:\Sources\data-framework`, the session repeatedly fails with:

- `Response was interrupted due to a server error. Retrying...` (many times)
- Automatic model switch: `gpt-5.6-sol (xhigh)` → `claude-sonnet-5 (xhigh)`
- `Unknown tool name in the tool allowlist: "apply_patch"`
- `Unknown tool name in the tool allowlist: "rg"`
- UI stuck on `Waiting for background agents`

Expected: Copilot Agent completes successfully; tool allowlist only contains valid tool names for the current Copilot Agent version; background agents do not hang indefinitely.

Please fix allowlist tool-name validation/mapping for Copilot Agent, investigate backend interruptions for `gpt-5.6-sol`, and improve failure handling for stuck background agents. Screenshot attached.

---

## Texte court prêt à coller (français — portail Microsoft / IT)

**Objet :** Blocage GitHub Copilot Agent — erreurs serveur + allowlist outils invalide (`apply_patch`, `rg`)

**Produit :** GitHub Copilot (Agent / background agents)

**Description :**

GitHub Copilot Agent est inutilisable sur le projet `data-framework`. La console Copilot affiche des erreurs serveur en boucle, un changement automatique de modèle, puis des erreurs « Unknown tool name in the tool allowlist » pour `apply_patch` et `rg`. L’interface reste bloquée sur « Waiting for background agents ».

**Impact :** blocage total de l’assistance AI de développement via GitHub Copilot.  
**Action demandée :** ouvrir / escalader un ticket auprès du support Microsoft / GitHub Copilot ; vérifier côté poste la version des extensions Copilot et la configuration d’allowlist d’outils.  
**Pièce jointe :** capture d’écran console Copilot.
