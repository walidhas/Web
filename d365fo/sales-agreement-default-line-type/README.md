# SalesAgreementCreate — default commitment from classification

When **Agreement classification** changes on the create sales agreement dialog (`SalesAgreementCreate`), set **Default commitment** (`AgreementHeader.DefaultAgreementLineType`) from `AgreementClassification.EOLDefaultCommitmentType`.

## Prerequisite

Field `EOLDefaultCommitmentType` must already exist on table `AgreementClassification` (same type as `AgreementHeader.DefaultAgreementLineType` / `CommitmentType`).

## Deploy

1. Create class `EOLSalesAgreementCreateFormHandler` in the AOT (or import `AxClass/EOLSalesAgreementCreateFormHandler.xml`).
2. Paste the source from `EOLSalesAgreementCreateFormHandler.xpp`.
3. Compile the model.

## Behavior

| Event | Action |
|-------|--------|
| `AgreementHeader.AgreementClassification` modified on `SalesAgreementCreate` | `AgreementHeader.DefaultAgreementLineType = AgreementClassification::find(...).EOLDefaultCommitmentType` |

If the form datasource is named `SalesAgreementHeader` instead of `AgreementHeader`, update `formDataFieldStr` accordingly.
