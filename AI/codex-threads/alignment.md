# Alignment Notes - useInterface composables

Updated: 2026-02-26
Scope: view-facing interface helpers for FireUX Firestore models.

Purpose:
- Keep view interface adapters thin and predictable.
- Avoid fallbacks or implicit selection logic in interface helpers.

Rules:
- use*Interface composables are view-layer adapters only. No writes.
- Do not hide missing data; surface nulls explicitly.
- Keep naming consistent with Firestore entity types.

Key files:
- packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface.ts
- packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface.ts

Recent scan (2026-02-20):
- Commit 20b2754f adjusted company/place interface helpers alongside extension runtime updates.

#end
