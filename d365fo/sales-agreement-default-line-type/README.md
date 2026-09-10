# SalesAgreementCreate — default commitment from classification

When **Agreement classification** changes on `SalesAgreementCreate`, set **Default commitment** (`SalesAgreementHeader.DefaultAgreementLineType`) from `AgreementClassification.EOLDefaultCommitmentType`.

## Prerequisite

Field `EOLDefaultCommitmentType` must already exist on table `AgreementClassification` (same type as `DefaultAgreementLineType` / `CommitmentType`).

## Deploy

1. Create class `EOLSalesAgreementCreateFormHandler` in the AOT (or import `AxClass/EOLSalesAgreementCreateFormHandler.xml`).
2. Paste the source from `EOLSalesAgreementCreateFormHandler.xpp`.
3. Compile the model.

## Behavior

| Event | Action |
|-------|--------|
| Control `SalesAgreementHeader_AgreementClassification` modified | `SalesAgreementHeader.DefaultAgreementLineType = AgreementClassification::find(...).EOLDefaultCommitmentType` |

Uses `FormControlEventHandler` on `formControlStr(SalesAgreementCreate, SalesAgreementHeader_AgreementClassification)`.
