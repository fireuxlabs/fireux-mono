Menu family map
Updated: 2026-06-17
Ref: dece0dcde
Role: map, not canon

Purpose:
Map menu concepts without conflating quick uploaded menus and kitchen-owned structured menus.

Vertical links:
- Parent: family-public-index.md
- Parent: family-public-detail.md
- Parent: server-api.md
- Parent: tool-provider.md

Horizontal links:
- firestore-entity.md
- console.md
- family-tenant-global.md

Current concepts:
- Root quick menu: starts at `/menus`, can be just a photo or PDF upload.
- Kitchen menu: belongs to a selected kitchen/console and may become structured.
- Public menu doorway: `/menus/<id>` should remain a stable public URL when possible.
- Tenant menu: tenant apps may expose simpler routes like `/menus/main`.
- Directory menu: global apps may expose `/kitchens/<slug>/menus/<menuId>`.

Entity checkpoint:
- Menu is marked `to-confirm` in code.
- MenuSection is a record under Menu.
- MenuItem is a record under MenuSection and points to Dish when structured.
- MenuSourceUpload is a record under Kitchen.
- Root `/menus/<id>` currently behaves as a public doorway/upload record, not settled root Menu truth.

Public menu kinds:
- `photo`: uploaded photo source.
- `document`: uploaded PDF/document source.
- `kitchen-menu`: linked to a kitchen-owned menu.
- `menu`: processed structured menu in the system.

Public normalized kinds:
- `photo`: public doorway renders an image source.
- `pdf`: public doorway renders a PDF source.
- `document`: public doorway renders a generic document source.
- `menu`: public doorway resolves to a structured Kitchen Menu.

Stored kind notes:
- Quick uploads may store `doc_kind`.
- Linked kitchen menus may store `source_kind` or older `kind`.
- Public APIs should normalize these into the public kinds above.

No kitchen needed:
- Upload a quick menu source.
- Show a photo/PDF.
- Generate or show a QR doorway.
- Invite owner to upgrade.

Page composition note:
- Root `/menus` uses a dedicated Menu CTA, not `EntityIndexCta`.
- The Menu CTA owns the Go QR upload tool because the tool is the product action, not generic index chrome.
- Root `/menus` lets `MenuCollectionManager` read the public menu collection by default.
- Kitchen-scoped menu pages should use kitchen/menu scoped surfaces, not `MenuCollectionManager` with passed scoped rows.
- Smaller display pieces such as Menu cards/lists may still be shared underneath.

Kitchen needed:
- Attach menu to a kitchen.
- Convert into dishes/sections/items.
- Manage kitchen menu operations.
- Enable Sproochli/translation later.
- Route through tenant/global kitchen ownership.

Open questions:
- Exact migration behavior from root quick menu to kitchen menu needs a clear rule.
- Decide whether public doorway remains a record shape or makes Menu a true `both` entity.
