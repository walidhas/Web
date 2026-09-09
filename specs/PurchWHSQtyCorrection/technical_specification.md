# Purchase over-receipt quantity adjustment (WHS)

## Decision

Do not correct `VendPackingSlipJour` for WHS-enabled receipts. Microsoft blocks product receipt correction/cancel from the purchase order when warehouse processes were used.

## Routing

- Non-WHS item/warehouse: `EOLPurchPackingSlipCorrector` (journal correction).
- WHS: `EOLPurchNegLineReceiptCorrector`:
  1. Toggle `PurchTable.ChangeRequestRequired` off (`doUpdate` of that flag only).
  2. `PurchLine.createLine` with negative `PurchQty` (qty to reverse = received qty − target qty).
  3. `InventDim::findOrCreate` with `wMSLocationId` = `InventLocation.EOLWMSLocationIdDefaultVirtualReceipt`.
  4. Confirm with `PurchFormLetter` / `DocumentStatus::PurchaseOrder`.
  5. Post product receipt for that line only (`VersioningUpdateType::Initial`, `PurchUpdate::ReceiveNow`).
  6. Restore `ChangeRequestRequired`.

The original product receipt journal is left unchanged. Net received quantity is original line + negative line.

On-hand must exist on the Virtual location for the issue to post.
