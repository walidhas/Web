# SalesAgreementCreate — default commitment from classification

When **Agreement classification** changes on the create sales agreement dialog (`SalesAgreementCreate`), set **Default commitment** (`SalesAgreementHeader.DefaultAgreementLineType`) from `AgreementClassification.EOLDefaultCommitmentType`.

## Prerequisite

Field `EOLDefaultCommitmentType` must already exist on table `AgreementClassification` (same type as `DefaultAgreementLineType` / `CommitmentType`).

## Deploy

1. Create class `EOLSalesAgreementCreateFormHandler` in the AOT (or import `AxClass/EOLSalesAgreementCreateFormHandler.xml`).
2. Paste the source from `EOLSalesAgreementCreateFormHandler.xpp`.
3. Compile the model.

## Behavior

| Event | Action |
|-------|--------|
| `SalesAgreementHeader.AgreementClassification` modified on `SalesAgreementCreate` | `SalesAgreementHeader.DefaultAgreementLineType = AgreementClassification::find(...).EOLDefaultCommitmentType` |

Form datasource name is `SalesAgreementHeader` (not `AgreementHeader`).
