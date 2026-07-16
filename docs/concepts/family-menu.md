Menu family map
Updated: 2026-07-16
Ref: 0e929a31f
Role: map, not canon

Purpose:
Map menu concepts without conflating quick uploaded menus and kitchen-owned structured menus.

Vertical links:
- Parent: family-public-index.md
- Parent: family-public-detail.md
- Parent: server-api.md
- Parent: tool-provider.md
- Child: menu-ordering.md

Horizontal links:
- firestore-entity.md
- console.md
- family-tenant-global.md

Current public menu doorways:
- Menu routes use stable plural collection grammar. Menu count changes index
  presentation, never the route shape.
- Global public doorway: `misebox.app/menus` is the public index and
  `misebox.app/menus/<globalMenuId>` opens one globally addressable doorway.
  The global id may be a globally unique or vanity identity. The doorway points
  to the original kitchen-owned menu source; it is not a copied Menu. Root
  quick/photo/PDF/document menus may also use this family.
- Misebox kitchen-directory doorway:
  `misebox.app/kitchens/<kitchenSlug>/menus` is the kitchen index and
  `misebox.app/kitchens/<kitchenSlug>/menus/<menuId>` opens one menu. This is
  durable kitchen-scoped access whether or not a tenant app exists, and the
  menu id only needs to be stable inside that kitchen namespace.
- Tenant doorway: the tenant origin uses `/menus` as its index and
  `/menus/<menuId>` as its detail. It is a branded projection whose configured
  Kitchen ownership is implied by app scope and deliberately absent from the
  URL.
- Root, tenant, and kitchen-directory menu projections expose their own
  `<menu-detail-path>/qr` surface. A QR generated from one projection preserves
  that projection instead of silently switching to a global doorway.
- Adding a tenant app is additive. It must not remove, stub, redirect away, or
  replace either the global public doorway or the kitchen-directory doorway.
- When a Kitchen menu has all three published projections, they resolve the
  same underlying menu source and order system. A Kitchen menu need not have a
  global doorway, and root quick/document menus need not have Kitchen or tenant
  projections. Doorways are route projections, not copied entities. Data scope
  and route scope are deliberately separate.
- One published menu may be featured immediately on an index; multiple menus
  are listed by the same index surface.
- Ordering contexts append after the menu identity on every doorway, for
  example `.delivery`, `.collection`, and `.kiosk`; see `menu-ordering.md`.
- Premium global-id claim, reserve, renew, and enforcement policy remains
  `to-confirm`; this map does not claim that enforcement is implemented.
- Current route/source seams:
  `src/runtime/utils/kitchen-menu-route.ts` and
  `src/runtime/server/menu/ownership/public-target.ts` in `fireux-kitchens`.
- `MenuRouteScope` owns URL projection as either `root` or `directory`; resolved
  Firestore ownership remains a separate server concern.
- Tenant menu resolution is fail-closed: exactly one configured Kitchen target,
  an existing root Kitchen, and explicit `parent_app` or `tenant_app` ownership
  are required. A tenant request never falls through to a global root menu and
  never accepts a directory Kitchen slug.
- Direct Firestore resolution is the sole menu-content authority. Public menu
  rendering must not hydrate or override content from a mutable website URL or
  another app's public API.

Current concepts:
- Root quick menu: starts at `/menus`, can be just a photo or PDF upload.
- Kitchen menu: belongs to a selected kitchen/console and may become structured.

Entity checkpoint:
- Menu is marked `confirmed` in code.
- MenuSection is a record under Menu.
- MenuItem is a record under MenuSection and points to Dish when structured.
- MenuSourceUpload is a record under Kitchen.
- Root `/menus/<id>` currently behaves as a public doorway/upload record, not settled root Menu truth.

Public menu kinds:
- `doc`: uploaded public file doorway.
- `menu`: structured menu doorway.

Public doc file kinds:
- `photo`: public doorway renders an image source.
- `pdf`: public doorway renders a PDF source.
- `document`: public doorway renders a generic document source.
- `url`: kitchen source record points to an existing menu or ordering URL.

Kitchen source inputs:
- File source: PDF/photo upload, processed by AI document extraction.
- URL source: existing menu/ordering URL, fetched as page text and processed
  through the same AI extraction/review/confirm pipeline.

Public source pointer:
- Structured menu doorways use `source.app_id`, `source.kitchen_id`, and
  `source.menu_id` to locate the source of truth.

Language/source note:
- Original menus should usually be treated as `default`, not assigned a
  single source language too early.
- Real restaurant menus often mix languages, brand words, dish names, and
  local phrasing.
- Sproochli/translation can split or infer language-specific fields later.

Stored kind notes:
- New quick uploads store `kind: doc`, `file_kind`, and `file`.
- Structured menu doorways should store `kind: menu` and `source`.
- Public APIs may still read older flat `doc_*` and `kitchen_*` fields, but
  should emit the cleaner public contract.

No kitchen needed:
- Upload a quick menu source.
- Show a photo/PDF.
- Generate or show a QR doorway.
- Invite owner to upgrade.

Page composition note:
- Shared `/menus` delegates to `MenuIndex`; the route page stays light.
- The global/root branch uses a dedicated Menu CTA, not `EntityIndexCta`, and
  lets `MenuCollectionManager` read the public menu collection by default.
- The Menu CTA owns the Go QR upload tool because the tool is the product action, not generic index chrome.
- The tenant branch renders one published menu directly as the `MenuDetail`
  surface or lists multiple published menus. Count changes presentation only;
  it does not select a route family.
- Kitchen-scoped menu pages should use kitchen/menu scoped surfaces, not `MenuCollectionManager` with passed scoped rows.
- Smaller display pieces such as Menu cards/lists may still be shared underneath.

Kitchen needed:
- Attach menu to a kitchen.
- Convert into dishes/sections/items.
- Manage kitchen menu operations.
- Enable Sproochli/translation later.
- Route through tenant/global kitchen ownership.

Component placement:
- Root menu rendering and public menu collection pieces live under `components/Menu`.
- The public detail entry is `components/Menu/Detail/Index.vue`, rendered as `MenuDetail` from public menu routes.
- `MenuDetail` is the public detail switchboard: it resolves the manifest and theme, then routes by format.
- Document/photo/PDF quick menus render through `MenuDetailDocument`; they are first-class fast-onboarding surfaces and should not initialize ordering.
- Structured food menus render through `MenuDetailFood`; customer-facing ordering and `components/Menu/Detail/Funnel/*` live under this food renderer, not under document menus and not under console `Operations`.
- This mirrors root public entity detail entries such as `components/Kitchen/Detail/Index.vue` when kitchen detail owns child slices.
- Kitchen-scoped console menu work lives under `components/Console/Kitchen/Operations/Menus`.
- Console editing, upload, AI processing, publishing, sections, and items should not move into root `components/Menu` unless they become public/shared renderer primitives.
- Inside the scoped menu operation, let the operator UI define the first buckets. `/console/kitchen/menus` starts with `Creation`, because upload, URL import, source queue, and source detail are one creation journey.
- Use workflow buckets only when they name a real visible seam: `Creation`, `Process`, `QR`, `Sections`, and `Items`.
- Keep primary selected-menu panels such as `Menu`, `Detail`, `Ordering`, and `Publish` flat unless they grow their own child components.

Structured item options:
- `price_options`: required or mutually exclusive choices such as sizes,
  pieces, grams, protein choices, or named variants.
- Every `price_options[].price` is the absolute full item price for that
  selection and must be greater than zero. Same-price required choices repeat
  the full price; they are not zero-cost add-ons or price deltas.
- `add_ons`: optional extras such as toppings, sides, sauces, or add-on
  modifiers. Their prices are incremental and may be zero for a labelled free
  option.
- Public Browse, ordering surfaces, Staff POS, tickets, and confirmation must
  preserve the same option labels. Browse shows options read-only; ordering
  surfaces require a variant when several are available and let customers
  toggle add-ons.
- The canonical MenuItem editor supports adding, editing, and removing both
  option families. Invalid or duplicate labels must not be written.
- `image_url`: optional menu-row presentation image. For now this belongs to
  `MenuItem`, not `Dish`, so kitchens can use stock/provider images without
  promoting images into canonical dish truth too early.
- AI menu processing should preserve both shapes before review/confirm so
  operators can correct them instead of rebuilding them manually.
- Re-confirming an AI draft fails closed when a matched or omitted current
  item would lose an existing variant or add-on. The server recomputes this
  comparison at confirm time; persisted review flags are presentation only.

Ordering note:
- Menu ordering is mapped separately in `menu-ordering.md`.
- Menus render readable content by default; only `ordering` decides whether action controls are available.
- Keep `ordering` as the order policy that decides whether order controls are available.

Open questions:
- Exact migration behavior from root quick menu to kitchen menu needs a clear rule.
- Decide whether public doorway remains a record shape or makes Menu a true `both` entity.
- Test a real `doc`/photo public menu after the next sample is seeded to verify the document renderer branch end to end.
- Decide the canonical/SEO doorway when the same Kitchen menu has global,
  directory, and tenant projections.
