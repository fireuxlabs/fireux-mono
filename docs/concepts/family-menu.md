Menu family map
Updated: 2026-07-16
Ref: 0e929a31f
Role: map, not canon

Purpose:
Map the strong Menu/KitchenMenu family without conflating root identity with
kitchen-scoped structured content.

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
  The global id may be a globally unique or vanity identity. The root Menu is
  the small globally addressable entity. It may point to a kitchen-owned
  KitchenMenu source, while quick/photo/PDF/document Menus can stand alone.
- Misebox kitchen-directory doorway:
  `misebox.app/kitchens/<kitchenSlug>/menus` is the kitchen index and
  `misebox.app/kitchens/<kitchenSlug>/menus/<menuId>` opens one menu. This is
  durable kitchen-scoped access whether or not a tenant app exists, and the
  KitchenMenu id only needs to be stable inside that kitchen namespace.
- Tenant doorway: the tenant origin uses `/menus` as its index and
  `/menus/<menuId>` as its detail. It is a branded projection whose configured
  Kitchen ownership is implied by app scope and deliberately absent from the
  URL.
- The public `/menus` route follows the public-index family: page header,
  Menu CTA, and the root Menu collection manager. Generic global, kitchen-directory,
  and tenant detail routes all use the same context-free MenuBrowse projection.
- Adding a tenant app is additive. It must not remove, stub, redirect away, or
  replace either the global public doorway or the kitchen-directory doorway.
- When a Kitchen menu has all three published projections, they resolve the
  same underlying KitchenMenu source and order system. A KitchenMenu need not
  have a root Menu, and root quick/document Menus need not have Kitchen or
  tenant projections. Route projections do not copy scoped content. Data scope
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
- Menu: small root entity in `menus`; owns global identity, public metadata,
  publication status, and either an optional KitchenMenu source pointer or a
  standalone document source.
- KitchenMenu: scoped entity in `apps/{appId}/kitchens/{kitchenId}/menus`;
  owns structured sections/items and operational policy such as ordering,
  service hours, kiosk configuration, and choices.
- A Menu usually points to a KitchenMenu, but either side can exist without the
  other. This is the established FireUX root/scoped entity family shape.

Entity checkpoint:
- Menu and KitchenMenu are separate confirmed models in code.
- MenuSection is a record under KitchenMenu.
- MenuItem is a record under MenuSection and points to Dish when structured.
- MenuSourceUpload is a record under Kitchen.
- Root Menu never stores copied Kitchen identity, image, route, or ordering data.

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

Presentation/data boundary:
- Currency belongs to Kitchen or its Place source and is resolved into the
  public manifest; KitchenMenu does not own `currency_code`.
- `MenuKitchenPresentation` in `models/kitchen/menu/menu-detail.model.ts` is the
  shared request-time Kitchen identity contract for structured and document
  Menu payloads. The ownership resolver supplies current Kitchen name, optional
  stored identity assets, image-shade metadata, currency, and menu page style;
  the root Menu does not copy those fields.
- `components/Menu/Browse/Identity.vue` renders that contract with a visible
  Kitchen name and text-only fallback. Missing or failed media is not a broken
  Menu state, and stored `kitchenImageShade` keeps generic Kitchen marks legible
  against light and dark Browse themes.
- Document Browse uses the package-owned `Menu/Detail/Document/Viewer.vue` and
  `PdfViewer.client.vue`. Stored objects are read through the same-origin public
  Menu file endpoint, and photo, PDF, and generic document branches always keep
  an explicit open-original fallback.
- Browse surfaces use a short allergy/intolerance advisory near the top.
  Ordering funnels may use a dedicated advisory popup. Allergy records and
  structured allergen metadata are not part of the current MenuItem contract.
- Icons, dietary metadata, and calories are intentionally deferred.

Stored kind notes:
- New quick uploads store `kind: doc`, `file_kind`, and `file`.
- Structured root Menus store `kind: menu` and the minimal source pointer.
- Public APIs may still read older flat `doc_*` and `kitchen_*` fields, but
  should emit the cleaner public contract.

No kitchen needed:
- Upload a quick menu source.
- Show a photo/PDF.
- Generate or show a QR doorway.
- Invite owner to upgrade.

Page composition note:
- `/menus` renders `MenuIndex`; global scope browses published root Menus and
  tenant scope uses its configured Kitchen target. A tenant with one published
  menu may feature that same MenuBrowse projection directly on the index.
- Generic `/menus/<menuId>` and `/kitchens/<kitchenSlug>/menus/<menuId>` routes
  read one resolved published menu contract through MenuBrowse. The server,
  not the URL renderer, resolves global, directory, or tenant ownership.
- Generic detail responses preserve that resolver truth: missing, unpublished,
  or out-of-scope Menus return 404; configuration, payload, and Firestore
  failures remain 5xx. Browse renders a safe noindex failure state without
  exposing the underlying server message. A featured Menu on a tenant index
  does not turn that collection route into a detail-response boundary.
- Invalid Firestore document ids are rejected as not found before Firestore is
  called. The public Menu endpoint replaces upstream error details with a safe
  status message before the response can enter Nuxt SSR state.
- `scripts/guards/menu-route-contract.mjs` locks the recognized suffix grammar.
  The Misebox HTTP contracts in `scripts/_lib/app-registry.mjs` lock root,
  directory, tenant, missing, wrong-scope, noindex, and diagnostic projections
  whenever the normal app route smoke runs.
- Browse detail includes kitchen/menu identity, a short allergy advisory,
  section navigation, readable item rows, and read-only structured options.
  MenuBrowse does not accept a menu context. Ordering, kiosk, and staff-POS
  remain separate context-driven surfaces; current suffixed routes retain the
  JSON diagnostic projection until that surface family is rebuilt separately.

Kitchen needed:
- Attach menu to a kitchen.
- Convert into dishes/sections/items.
- Manage kitchen menu operations.
- Enable Sproochli/translation later.
- Route through tenant/global kitchen ownership.

Component placement:
- `components/Menu/Index/Index.vue` owns the public Menu index composition;
  `components/Menu/Browse/Index.vue` owns context-free customer detail and its
  small `Browse/Identity.vue` identity, `Browse/Item.vue` row,
  `Browse/SectionNav.vue` section-navigation, and `Browse/Unavailable.vue` safe
  failure seams. `components/Menu/Json.vue` remains the temporary renderer for
  non-generic context diagnostics.
- Root and kitchen-directory detail pages branch on the parsed menu context:
  generic routes project MenuBrowse, while suffixed routes preserve the context
  query for MenuJson. `middleware/menu-projection-layout.ts` chooses the layout
  before render so the branch is hydration-safe.
- Ordering components remain preserved and outside this public reset.
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
- Selectable sizes, supplements, and add-on prices belong in these structured
  fields, not embedded in Dish descriptions.
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
- Decide the canonical/SEO doorway when the same Kitchen menu has global,
  directory, and tenant projections.
