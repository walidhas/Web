# Correction d’un bon de livraison (BL) — D365 F&O

Code X++ à coller dans l’AOT pour **corriger un packing slip déjà validé** en imposant une **quantité livrée cible**.

Comportement aligné sur le standard : **Ventes et marketing > Commandes client > Préparer > Journaux > Bon de livraison > Corriger**.

## Règle métier

Sur le formulaire standard, la colonne **Update / Quantité** = **nouvelle quantité qui doit rester livrée** (pas la quantité à storno).

Exemple : BL posté à 10, vous voulez 7 livrés → passer `7`. Le système reverse `3`.

- **Diminuer** la quantité : supporté (correction).
- **Augmenter** la quantité : non supporté en correction. Poster un **nouveau** BL pour le complément.
- Quantité `0` : reverse toute la ligne du BL.

## Prérequis

- Le BL n’est **pas facturé**.
- Les articles **ne sont pas** en processus d’entrepôt avancé (WHS). Sinon : corriger depuis la **charge** (load), pas depuis la commande.
- Exécuter le job dans la **société (legal entity)** de la commande.
- Compiler le modèle après import des objets.

## Objets à créer dans l’AOT

| Objet | Type | Fichier |
|---|---|---|
| `EOLSalesPackingSlipCorrector` | Classe | `AxClass/EOLSalesPackingSlipCorrector.xml` |
| `EOLSalesPackingSlipCorrectorJob` | Classe (runnable) | `AxClass/EOLSalesPackingSlipCorrectorJob.xml` |
| `EOLPackingSlip` | Label file en-US + fr | `AxLabelFile/` |

Versions lisibles (même code) : `EOLSalesPackingSlipCorrector.xpp` et `EOLSalesPackingSlipCorrectorJob.xpp`.

Ajouter les objets au fichier `*.rnrproj` du modèle, à la racine de `AxClass/` (pas de sous-dossier `NomClasse/NomClasse.xml`).

Exemple de références projet :

```xml
<Content Include="AxClass\EOLSalesPackingSlipCorrector">
  <SubType>Content</SubType>
  <Name>EOLSalesPackingSlipCorrector</Name>
  <Link>EOLSalesPackingSlipCorrector</Link>
</Content>
<Content Include="AxClass\EOLSalesPackingSlipCorrectorJob">
  <SubType>Content</SubType>
  <Name>EOLSalesPackingSlipCorrectorJob</Name>
  <Link>EOLSalesPackingSlipCorrectorJob</Link>
</Content>
<Content Include="AxLabelFile\EOLPackingSlip_en-US">
  <SubType>Content</SubType>
  <Name>EOLPackingSlip_en-US</Name>
  <Link>EOLPackingSlip_en-US</Link>
</Content>
<Content Include="AxLabelFile\LabelResources\en-US\EOLPackingSlip.en-US.label.txt">
  <SubType>Content</SubType>
  <Name>EOLPackingSlip.en-US.label.txt</Name>
  <DependentUpon>AxLabelFile\EOLPackingSlip_en-US</DependentUpon>
</Content>
<Content Include="AxLabelFile\EOLPackingSlip_fr">
  <SubType>Content</SubType>
  <Name>EOLPackingSlip_fr</Name>
  <Link>EOLPackingSlip_fr</Link>
</Content>
<Content Include="AxLabelFile\LabelResources\fr\EOLPackingSlip.fr.label.txt">
  <SubType>Content</SubType>
  <Name>EOLPackingSlip.fr.label.txt</Name>
  <DependentUpon>AxLabelFile\EOLPackingSlip_fr</DependentUpon>
</Content>
```

Ajuster `RelativeUriInModelStore` des XML labels au nom réel de votre modèle.

## Comment l’appliquer

1. Importer / coller les deux classes et les labels dans votre modèle custom.
2. Ouvrir `EOLSalesPackingSlipCorrectorJob`.
3. Renseigner les constantes en tête de `main` :

```x++
packingSlipId = "BL-000123";  // identifiant du BL posté
salesId       = "SO-000456";  // recommandé si le n° de BL n’est pas unique
itemId        = "ART-001";    // article à corriger (si une seule ligne de cet article)
inventTransId = "";           // à remplir si plusieurs lignes du même article
newDeliveredQty = 7;          // nouvelle qté livrée (unité de vente)
```

4. **Compiler** puis **Run** la classe (clic droit > Open / Run).
5. Contrôler le journal BL : quantité livrée mise à jour, écart en « quantity to be reversed », stock rétabli.

## Appel depuis un autre traitement

```x++
CustPackingSlipJour jour;

jour = EOLSalesPackingSlipCorrector::correctQty(
    "BL-000123",
    7,
    "",           // inventTransId si connu
    "ART-001",
    "SO-000456");
```

Ou par RecId du journal (le plus sûr) :

```x++
EOLSalesPackingSlipCorrector::correctQtyByJourRecId(5637144576, 7, "ART-001");
```

## Points d’attention

1. `parmVersioningUpdateType(VersioningUpdateType::Correction)` **et** `parmCallerTable(custPackingSlipJour)` sont obligatoires. Sans eux, D365 poste un **nouveau** BL (souvent en quantité négative) au lieu de corriger l’existant.
2. `SalesParmLine.DeliverNow` = quantité **cible** après correction.
3. Ne pas envelopper `run()` dans une transaction trop large si le posting standard gère déjà ses `tts` : le code fourni ouvre une `tts` uniquement autour des écritures parm, puis poste.
4. Traçabilité / lots / n° de série : sélectionner la bonne `InventTransId` (et donc la bonne `InventDim`).
