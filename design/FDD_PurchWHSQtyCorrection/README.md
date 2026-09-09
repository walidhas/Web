# Correction de quantité reçue WMS — commande fournisseur

## Constat

`EOLPurchPackingSlipCorrector` reprend le bouton standard **Corriger** du journal de réception (`VendPackingSlipJour`).

Ce chemin **ne fonctionne pas** pour un article reçu via **WHS** (gestion d’entrepôt avancée). C’est un comportement Microsoft : *product receipt correction is not supported for warehouse management processes*.

## Options

| Approche | Quand l’utiliser | Limite |
|---|---|---|
| **A.** Corriger / annuler le journal de réception | Article **non WHS** | Impossible si WHS (erreur standard) |
| **B.** Remettre le stock au quai, **annuler la réception depuis la charge**, re-réceptionner | Processus WHS officiel Microsoft | Opérationnel, peu automatisable, exige le même LP / emplacement d’arrivée |
| **C.** **Ligne négative** sur la CF, confirmer, réceptionner | Automatisation WHS / job | Le journal d’origine n’est pas réécrit ; le net (positif + négatif) donne la bonne qté |
| **D.** Commande de **retour fournisseur** | Retour physique / avoir déjà facturé | Processus plus lourd, plutôt après facture |

## Approche retenue : C, avec aiguillage

1. **Non WHS** → continuer **A** (`EOLPurchPackingSlipCorrector`).
2. **WHS** → **C** (`EOLPurchNegLineReceiptCorrector`) :
   - désactiver temporairement le change management (`ChangeRequestRequired = No`) **sans** `PurchRequestChange` ;
   - créer une **nouvelle ligne** avec `PurchQty` **négative** (= qté à storno) via `PurchLine.createLine` ;
   - poser l’emplacement **Virtual** (`InventLocation.EOLWMSLocationIdDefaultVirtualReceipt`) dans `InventDimId` ;
   - **confirmer** la ligne (`PurchFormLetter` / `PurchaseOrder`) ;
   - **réceptionner** cette ligne seule (`DocumentStatus::PackingSlip`, `VersioningUpdateType::Initial`, `PurchUpdate::ReceiveNow`) — ce n’est **pas** une Correction de journal ;
   - rétablir le change management.

Le stock à storno doit déjà être (ou être mis) sur l’emplacement Virtual. Sinon la sortie physique échoue.

## Ce qu’il ne faut pas faire

- Forcer une Correction de `VendPackingSlipJour` sur du WHS (bloqué par design).
- Utiliser `doUpdate()` pour toute la logique métier. `doUpdate` uniquement pour basculer `ChangeRequestRequired`.
- Passer par une demande de changement (`VersioningPurchaseOrder` / workflow).
