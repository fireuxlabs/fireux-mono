# Menu Photo Import Reusable TODO
Authority: Tier2 (Operational TODO; Tier1 canon and package contracts win)
Updated: 2026-06-09

## Status

Proposed. The La Tapberne photo-source review proved the workflow is useful, but this is not yet a reusable product/tool surface.

## Goal

Create a small repeatable pipeline for:

```txt
menu photos or PDF
-> source text extraction
-> structured kitchen dishes
-> menu sections/items
-> translation refresh plan
-> human-readable diff before write
```

## Canon Direction

- Go QR remains document/URL/QR infrastructure.
- Misebox owns kitchen dishes, menus, and menu migration into kitchen data.
- Sproochli owns translation generation/review once source menu fields exist.
- FireUX AI may provide the server-side extraction seam, but must not expose unrestricted AI calls publicly.

## First Reusable Shape

- `photo-menu-import` should start as a server-side migration/review workflow, not a public tool.
- It should write a report before any Firestore mutation.
- It should compare extracted source against current `Kitchen -> Menu -> Section -> Item -> Dish` data.
- It should flag translation-cache impact separately from source-menu impact.

## Open Questions

- Should variant pricing become first-class for dishes/menu items?
- Should extraction store original source artifacts in Storage?
- Should image/PDF extraction belong in Misebox or a shared FireUX document/AI package?
