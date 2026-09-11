# EOLVendPackRequestForCorrection — focus by cause type

When the form opens (or `EOLCauseType` changes), set keyboard focus on the field that matches the correction cause.

## Behavior

| `EOLCauseType` | Focus control |
|----------------|---------------|
| `EOLCauseTypeEnum::EOLCauseTypeEnumPrice` | `NewPurchPrice` |
| `EOLCauseTypeEnum::EOLCauseTypeEnumQuantity` | `NewPurchQty` |

## Deploy

1. Create class `EOLVendPackRequestForCorrectionFormHandler` in the AOT (or import `AxClass/EOLVendPackRequestForCorrectionFormHandler.xml`).
2. Paste the source from `EOLVendPackRequestForCorrectionFormHandler.xpp` if needed.
3. Confirm form control names are exactly `NewPurchPrice` and `NewPurchQty` (update `formControlStr` if AutoDeclaration used a different name, e.g. `EOLVendPackRequestForCorrection_NewPurchPrice`).
4. Confirm enum element names match `EOLCauseTypeEnumPrice` / `EOLCauseTypeEnumQuantity` (or adjust the `switch` cases if elements are named `Price` / `Quantity`).
5. Compile the model.

## Alternative (form method on the custom form)

If you prefer to keep logic on the custom form itself, add after `super()` in `run()`:

```xpp
public void run()
{
    super();

    switch (EOLVendPackRequestForCorrection.EOLCauseType)
    {
        case EOLCauseTypeEnum::EOLCauseTypeEnumPrice:
            NewPurchPrice.setFocus();
            break;

        case EOLCauseTypeEnum::EOLCauseTypeEnumQuantity:
            NewPurchQty.setFocus();
            break;
    }
}
```

Controls must have **AutoDeclaration = Yes**.
