Menu family map
Updated: 2026-07-19
Ref: 565ebd668
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
- Tenant doorway: `/<menuId>` is the stable detail route. `/menus` exists as
  the tenant directory only when its result needs presentation; with exactly
  one published menu it temporarily redirects to that root detail. Configured
  Kitchen ownership is implied by app scope and deliberately absent from the
  URL.
- The global `/menus` route follows the public-index family: page header, Menu
  CTA, and the root Menu collection manager. Its view control cycles the Menu
  card family through Preview, Cell, and Pill; Preview is the default and keeps
  the available guest doorways permanently visible without disclosure state.
  Cell keeps the same doorway truth as compact icon actions, while Pill is the
  smallest direct Browse link. The root collection's pick rail filters the
  already-hydrated page by current open state and guest-discoverable Delivery,
  Collection, or Pre-order contexts; combined picks use intersection semantics.
  Kitchen-directory and multi-menu tenant indexes use a smaller scoped list.
  Generic global, kitchen-directory, and tenant detail routes all use the same
  context-free MenuBrowse projection.
- `.delivery`, `.collection`, and `.pre_order` are the guest-discoverable live
  context projections. Each uses the same resolved KitchenMenu manifest,
  Menu style, available-surface rail, catalogue, and transient basket through
  the package-owned MenuOrder shell. Private contexts remain purpose-specific.
- Adding a tenant app is additive. It must not remove, stub, redirect away, or
  replace either the global public doorway or the kitchen-directory doorway.
- When a Kitchen menu has all three published projections, they resolve the
  same underlying KitchenMenu source and order system. A KitchenMenu need not
  have a root Menu, and root quick/document Menus need not have Kitchen or
  tenant projections. Route projections do not copy scoped content. Data scope
  and route scope are deliberately separate.
- A tenant `/menus` request with exactly one published menu returns a temporary
  redirect to `/<menuId>`; zero menus render the empty index and two or
  more render the tenant list. Global and kitchen-directory indexes always
  remain lists, even when their current result contains one menu.
- Ordering contexts append after the menu identity on every doorway, for
  example `.delivery`, `.collection`, and `.kiosk`; see `menu-ordering.md`.
- A request shaped as `/kitchens/<kitchenSlug>.collection` has no Menu identity
  and is therefore never a Collection projection. When the Kitchen resolves,
  the package returns a Kitchen-themed, noindex 404 recovery surface linking
  back to the public Kitchen profile; it does not choose a Menu implicitly.
- Premium global-id claim, reserve, renew, and enforcement policy remains
  `to-confirm`; this map does not claim that enforcement is implemented.
- Current route/source seams:
  `src/runtime/utils/kitchen-menu-route.ts` and
  `src/runtime/server/menu/ownership/public-target.ts` in `fireux-kitchens`.
- `src/runtime/composables/fireux/menu/usePublicMenuIndex.ts` is the one public
  index policy seam. It classifies loading, failure, empty, tenant redirect,
  and list outcomes; owns links; and appends cursor pages. `/api/menus` resolves
  ownership on the server and returns a bounded published page ordered by
  document identity. The default page is 24 rows, the hard request cap is 50,
  and no index decision downloads an unbounded collection. Client-only search
  stays hidden while another cursor page exists so it never pretends to search
  the complete catalogue; a future large-catalogue search must be server-owned.
  The global index resolves each page's current root/app Kitchen display name,
  logo and identity image, referenced KitchenMenu guest-ordering contexts, and
  effective inherited Kitchen operation hours in one bounded batch. Menu cards
  prefer the logo, fall back to the identity image, and can therefore
  expose accurate Browse, Delivery, Collection, and Pre-order doorways plus
  current open state without copying Kitchen identity or operational policy
  onto root Menu records and without issuing per-card requests.
- `src/runtime/composables/fireux/menu/useMenu.ts` is the resolved public
  projection seam. It owns one collision-safe request key, the structured or
  document render decision, safe failure state, and the relative index, Menu,
  and QR paths used by public renderers.
- `MenuRouteScope` owns URL projection as `root`, `tenant`, or `directory`.
  Root means the global `/menus/<globalMenuId>` namespace; tenant means the
  tenant origin's `/<menuId>` namespace; directory means the explicit Kitchen
  namespace. Resolved Firestore ownership remains a separate server concern.
- The kitchens module adds the existing root Menu page and QR page as dynamic
  aliases only in tenant apps. Static tenant pages keep router precedence.
  `menu-tenant-route` validates contextual and QR aliases against the generic
  root match, fails closed on collisions, and temporarily redirects the older
  tenant `/menus/<menuId>` form to the root canonical path. The index policy
  treats any published id that resolves to a static tenant page as a
  configuration failure rather than emitting a wrong link.
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
  public manifest; KitchenMenu does not own `currency_code`. Kitchen menu
  display preferences (`currency_format` and `show_currency`) travel with that
  request-time presentation contract so public Browse does not invent a price
  format or force the currency code to be visible.
- `MenuKitchenPresentation` in `models/kitchen/menu/menu-detail.model.ts` is the
  shared request-time Kitchen identity contract for structured and document
  Menu payloads. The ownership resolver supplies current Kitchen name, optional
  stored identity assets, image-shade metadata, currency, and menu page style;
  the root Menu does not copy those fields.
- `components/Menu/Identity.vue` renders that shared contract as the common
  Browse and live-order title card. Kitchen media and the visible circular exit
  sit inside that card; missing or failed media falls back to text, and stored
  `kitchenImageShade` keeps generic Kitchen marks legible against light and dark
  Menu themes.
- Generic detail routes extend the resolved Menu page style to the full page
  canvas, including outer large-screen margins and the circular exit. Menu
  index lists remain inside their host app theme.
- Document Browse uses the package-owned `Menu/Detail/Document/Viewer.vue` and
  `PdfViewer.client.vue`. Stored objects are read through the same-origin public
  Menu file endpoint, and photo, PDF, and generic document branches always keep
  an explicit open-original fallback.
- Browse surfaces use a short allergy/intolerance advisory near the top.
  Ordering funnels may use a dedicated advisory popup. Allergy records and
  structured allergen metadata are not part of the current MenuItem contract.
- The standard structured Menu style uses a balanced two-column section layout
  on large screens and the compact sticky section selector wherever the shared
  catalogue is rendered. Kitchen colours and typography remain
  presentation deltas; projections and apps do not recreate this layout.
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
  tenant scope uses its configured Kitchen target. The route page awaits the
  shared index controller and executes its one-menu tenant redirect before any
  index UI renders. This keeps detail layout and exit behavior on the detail
  route rather than embedding MenuBrowse inside the tenant layout. A tenant
  list also links to stable root `/<menuId>` details, so adding another menu
  does not change an existing menu URL.
- The kitchen-directory index also renders `MenuIndex` with directory scope;
  it always remains a list and must not fall back to a diagnostic JSON
  projection. Index links open Browse. The generic detail layout owns one
  circular X exit inside the shared identity card: tenant projections
  close to the tenant home, while global and kitchen-directory projections go
  back to their Menu index. Browse does not promote QR generation: QR is a
  distribution surface reached from operator or management tooling, then
  printed or shared to become an entry into the Menu. QR links back to Browse
  and the index as a fallback. Document rendering inherits the detail-layout
  exit and adds only its open-original file action.
- A public Kitchen profile lists Browse plus guest-discoverable ordering
  contexts only. Dine-in/Table service, Kiosk, and Room Service remain
  addressable for operator-generated QR entry but are not advertised by
  Kitchen cards or customer choice rails; their visible management doorway
  belongs in the Kitchen console. Global, directory, and tenant Browse routes
  all derive their public option rail from this same shared policy.
- Kitchen profiles and scoped Menu indexes render the same
  `Menu/Cards/Preview.vue`, which delegates Browse and guest-discoverable ordering
  links to `Menu/Doorways.vue` and computes the same live service badge from
  either hydrated KitchenMenu data or the scoped index's public service-hours
  projection. The bounded index response exposes enabled public contexts and
  service hours only; it does not expose or duplicate the full KitchenMenu
  ordering policy, and it does not issue per-row requests.
  The Kitchen profile consumes the same public index controller with a
  four-row preview rather than opening an unbounded client-side Menu
  collection; the scoped Menu index owns subsequent cursor pages.
- Generic global `/menus/<menuId>`, tenant `/<menuId>`, and directory
  `/kitchens/<kitchenSlug>/menus/<menuId>` routes read one resolved published
  menu contract through MenuBrowse. The server, not the URL renderer, resolves
  global, directory, or tenant ownership.
- Printable QR doorways append `/qr` to those generic detail routes and encode
  the corresponding absolute Browse URL on the same origin. The package-owned
  Menu layout derives close/back behavior from app role and route scope, so
  apps do not recreate Menu chrome. QR routes use the same fail-closed
  ownership resolver, are always `noindex`, and deliberately render without
  Menu chrome. A recognized contextual identity may also append `/qr`, for example
  `/<menuId>.collection/qr` on a tenant. The QR resolves that context through
  the same manifest and encodes the exact contextual target; a disabled or
  unavailable context fails closed rather than falling back to Browse.
- Generic and live order detail responses preserve that resolver truth: missing, unpublished,
  or out-of-scope Menus return 404; configuration, payload, and Firestore
  failures remain 5xx. Browse renders a safe noindex failure state without
  exposing the underlying server message. A tenant index redirect is emitted
  only after the bounded server result proves there is exactly one menu and no
  next page.
- Invalid Firestore document ids are rejected as not found before Firestore is
  called. The public Menu endpoint replaces upstream error details with a safe
  status message before the response can enter Nuxt SSR state.
- `scripts/guards/menu-route-contract.mjs` locks the recognized suffix grammar.
  The Misebox HTTP contracts in `scripts/_lib/app-registry.mjs` lock root,
  directory, tenant, missing, wrong-scope, noindex, and private projections
  whenever the normal app route smoke runs.
- Browse detail includes kitchen/menu identity, a short allergy advisory,
  section navigation, readable item rows, and read-only structured options.
  MenuBrowse does not accept a menu context. `.delivery`, `.collection`, and
  `.pre_order` mount the same noindex MenuOrder shell only when the
  context-filtered manifest explicitly enables that order type. MenuOrder
  renders selectable items, inline variant choices with the lowest valid price
  selected initially, a direct plus for the selected/base item, and an add-on
  dialog only when needed, plus an in-memory basket count and total. The
  basket review keeps each configured line's quantity read-only and offers one
  remove action; adding the same configuration again increments it. Collection
  alone can continue to a package-owned,
  page-local pickup-time selector backed by the resolved Collection order-type
  policy: immediate collection is offered only when enabled and open, while
  scheduled choices obey Collection hours, notice, interval, and horizon. The
  first active pipeline offers name, mobile, and email fields with per-surface
  required-field policy, shows configured Collection handoff instructions,
  groups configured
  settlement methods into Pay now or a surface-aware Pay later choice, posts through the canonical Menu Order endpoint,
  and follows Kitchen acceptance, ready, rejection, and completion status on
  the current page. Configured Pay now starts the existing secure online-card
  checkout. The pipeline does not persist customer/contact input or basket
  contents, but its safe post-submit Order reference, display labels, and
  latest status restore across refresh and equivalent root/Kitchen routes. It
  blocks a second basket while that Order is unresolved; a rejected Order must
  be explicitly acknowledged before the tracking session clears. It does not
  yet extend submission to Delivery or Pre-order. Collection can be paused
  independently of its hours and enabled state: the themed public doorway
  remains readable, ordering controls are replaced by its pause message, and
  stale submissions are rejected server-side.
- Console ordering configuration is layered beneath the Menu editor. The
  parent enables surfaces; focused policy belongs under
  `/console/kitchen/menus/<menuId>/ordering/<surface>`, beginning with
  `collection`. This namespace must not collide with the existing Menu section
  route.
- Time defaults follow the same layers as ownership: Place business hours seed
  a new Kitchen's operation hours, a new Menu inherits Kitchen operation
  hours, and a newly enabled ordering surface inherits that Menu's service
  hours. Each child may later become custom without changing its parent.
- The Kitchen Menu console is a small workspace rather than one long editor.
  `/console/kitchen/menus/<menuId>` owns overview and guest-facing identity;
  its Menu service-hours card chooses inherited Kitchen operation hours or a
  custom Menu schedule without changing any surface policy. Collection timing,
  payment methods, handoff/contact requirements, and operational availability
  remain on the focused Collection child route.
  Those controls use the shared profile-editable molecule structure: each
  field owns edit/save/cancel, optimistic display, validation, and errors while
  the domain passes focused patch functions. Array-safe serialization remains
  inside the ordering mutation composable rather than a page-wide draft.
  `content`, `ordering`, `publishing`, and `source` are explicit child routes
  sharing one package-owned workspace header. Existing section detail remains
  at the legacy child position until it can move atomically beneath `content`.

Kitchen needed:
- Attach menu to a kitchen.
- Convert into dishes/sections/items.
- Manage kitchen menu operations.
- Enable Sproochli/translation later.
- Route through tenant/global kitchen ownership.

Component placement:
- `components/Menu/Index/Index.vue` owns the public Menu index composition;
  its route-owned `usePublicMenuIndex` controller is passed explicitly into
  `Menu/Collection/Manager.vue` so one request state powers policy and display.
  This is not a raw provided collection or per-row hydration seam.
  `components/Menu/Close.vue` owns the shared circular control, while
  `composables/fireux/menu/useMenuExit.ts` supplies its surface-aware exit
  destination. The identity card owns the normal visible control; the
  package-owned `layouts/menu.vue` keeps the same control as a fallback for
  failure surfaces without an identity card. `components/Menu/Browse/Index.vue` owns
  context-free customer detail and its
  shared `Menu/Identity.vue` identity, `Browse/Item.vue` row, and
  `Browse/Unavailable.vue` safe failure seams. `components/Menu/SectionNav.vue`
  owns shared catalogue section navigation, while `Menu/SurfaceSwitcher.vue`
  identifies the current Browse or ordering projection and reveals the other
  enabled public projections through `Menu/SurfaceRail.vue`.
  `components/Menu/Order/Index.vue`
  owns public order
  catalogue resolution and orchestration; its `Intro`, `Unavailable`, `Catalogue`, `Item`,
  `ItemDialog`, `Quantity`, `BasketSummary`, and `BasketDialog` children own the
  shared visible order seams. `CollectionFlow`, shared `CheckoutDialog`,
  `CollectionStatus`, and the temporary `Paused` state own the small active
  Collection pipeline.
  `composables/fireux/menu/order/useMenuOrderBasket.ts` owns transient basket
  arithmetic and validated line correction only, while
  `useMenuCollectionOrder.ts` owns Collection submission, idempotency, online
  checkout handoff, and status polling through server APIs;
  `useMenuOrderTrackingSession.ts` owns the minimal surface-neutral
  post-submit browser tracking record. Shared payment
  timing copy belongs to `utils/menu-order-payment.ts`, not to a surface dialog.
  `components/Menu/Json.vue` remains the temporary renderer for private or
  operational contexts that do not yet own a dedicated public projection.
- Global, tenant-alias, and kitchen-directory detail routes branch on the parsed menu context:
  generic routes project MenuBrowse; Delivery, Collection, and Pre-order
  project MenuOrder; other suffixes preserve the context query for MenuJson. The shared route
  projection classifier also drives `middleware/menu-projection-layout.ts`, so
  the page branch and pre-render layout cannot drift.
- `MenuOrder` is the single target public ordering component family. The
  unshipped `Menu/Detail/Funnel`, `kitchen/order/funnel`, and app-local
  `/ordering/*` development chain still has direct consumers; it is an
  alternate implementation to migrate and delete atomically, not a legacy or
  compatibility system. New ordering work belongs in `MenuOrder` and its
  canonical session seams.
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
- Ordering validates each declared option family atomically. A malformed or
  duplicate row makes the item unavailable; it must never be dropped in a way
  that changes whether an explicit choice is required.
- Selectable sizes, supplements, and add-on prices belong in these structured
  fields, not embedded in Dish descriptions.
- Public Browse, ordering surfaces, Staff POS, tickets, and confirmation must
  preserve the same option labels. Browse shows options read-only; ordering
  surfaces preselect the lowest-priced valid variant (preserving declared order
  when prices tie), let customers choose another, and let customers toggle
  add-ons. The chosen variant identity remains explicit in the basket input.
- Public Browse shows an exact price for base-only items and the lowest
  canonical option price when variants exist, without a `From` prefix. Variant
  rows repeat their absolute full prices without `+`; add-ons show their
  incremental `+` price or `No extra charge`. A zero base price without
  variants remains unpriced.
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
