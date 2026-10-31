# Misebox GPT Context

Updated: 2026-10-31
Ref: 3f46d22a2
Role: living context
Scope: Misebox ecosystem and Apps

## Purpose

Route recurring Misebox work to the correct App, ecosystem, extension, source,
and available tests without copying implementation inventories. This file
inherits `AGENTS.md` and `docs/ai/gpt-context.md`.

## Refresh process

Before each Misebox task:

1. Read `AGENTS.md`, `docs/ai/gpt-context.md`, and this file completely.
2. Read `docs/concepts/fireux-mono.md` and the smallest routed concept map.
3. Inspect `packages/ecosystem/fireux-misebox`, the relevant
   `projects/misebox/<app>`, installed extensions, real consumers, generated
   Nuxt registration, relevant source-owned tests, and `git status`.
4. Compare the nearest maintained Main/tenant App or Workspace sibling.

## Operational tooling ownership

Explicit Misebox database cutovers and reviewed client input catalogues live in
`tools/misebox-migrations`, outside reusable Kitchen runtime. Their guarded
plan/apply/verify commands remain manual; filesystem relocation is not a live
cutover. Package regression tests remain under `src/test`.

## Ownership

```text
Misebox App → fireux-misebox → domain extensions → fireux-core
```

- A concrete Misebox App owns deployment, routes/adapters, brand, SEO, App policy,
  and genuinely App-specific presentation.
- `fireux-misebox` owns Misebox identity and real composition reused across
  Misebox Apps. It does not absorb reusable domain behavior.
- Domain extensions own their Entities, capabilities, models, authority, UI,
  server behavior, and reusable Workspace implementation.
- Core owns product-neutral FireUX/Nuxt mechanics.

Tenant-specific branches, ids, defaults, and copied domain models do not belong
in the ecosystem package.

## Development and Rules authority

Misebox has not been approved to ship. The user-selected development policy for
`misebox-78f9c` / named database `misebox` is the existing development-open
Rules template, with public read/write access. Production hardening and a
restricted Rules rollout require explicit shipping authorization; a P0 label,
real data, or a deployed hostname does not supply that authorization. Never
silently redeploy the production candidate as a repair. Verify live Rules
separately from intended policy and keep exact backups/readback evidence.
Preserve the production candidate, tests and App deployment safeguards for a
future deliberate release. See `firestore-mutations-context.md` for the owning
sources and Rules-only verification boundary.

## Apps and Workspace

### Menu Express delivery

The Misebox catalogue Product is `products/menu-express`, authored through the
existing Products create command from the App-owned
`shared/menu-express-product.ts` offer. Its App-specific Product page composes
Products' public reader and header with the service intake and a self-service
Kitchen entrance. A catalogue-only Product has no provider price and performs
no payment provisioning; no price or delivery-time promise is implied.

Kitchen Workspace's `/workspace/kitchen/food-and-drink/menus/prepare` is the
internal entrance to the existing Kitchen upload/URL, saved-source processing,
review, Menu publication and QR owners. It has no service request, purchase or
demo-payment prerequisite. Ordinary Kitchen authority, capacity and AI usage
policy still apply. The App service adapter `server/menu-express/preparation.ts` transfers the supplied
source through Kitchen’s `menu/server/source/save.ts` and binds the request to
its deterministic source/Menu identity. Operators use the same
`KitchenFoodAndDrinkMenusPreparation` component as native source review; no
download, re-upload or manual Menu linking is required. The service
request owns customer contact/approval/delivery tracking; it does not replace
Kitchen's preparation or publication commands.
The existing Menu record editor provides its record context once. Metadata and
hours controls consume `useMenuRecordMetadata` and `useMenuRecordHours` with
explicit context; lifecycle controls reuse the record owner’s commands and
navigation. These owners belong to Kitchen/Menus, not the Menu Express service.
Section routes provide one lower `useMenuSection` state from explicit Menu input.
Items and Sections consume their shared editing controllers; new-Dish placement
uses `useMenuSectionDishCreation` and the existing Dish/Section commands. Daily
preview rows receive the Sections owner’s catalogue rather than acquiring their
own catalogue. Native controls and one `menu-editor.css` owner supply the
inspected editor presentation.

The Main App owns its Menu Express request under
`apps/{appId}/menu_express_requests/{id}`. Its
[contract and commands](../../../../../projects/misebox/misebox-app/server/menu-express/intake.ts)
link existing Core Conversations, Products checkout and Kitchen/Menu content.
Intake, customer reads/actions, operator actions and payment each have a named
App-owned command file. Source upload/download live in `sources.ts`; their Nitro
handlers delegate to that owner. Their common request DTO and policy stay in `contract.ts`.
Conversation creation, proof validation and messages compose the existing Core
Chat transaction operations; the App does not construct their stored schema.
The customer and operator roots compose focused recovery, source, preparation,
review, delivery and shared conversation components. Client intake draft, retained recovery identity and submission lifecycle belong
to `useMenuExpressIntake`; `MenuExpress/Intake.vue` owns the visible form.
Client actions reuse Core's
`useCommandScope` for account, request, recovery-key and disposal lifetime.
The request does not grant Kitchen access. Operators retain current App admin/dev
membership and the linked Kitchen's ordinary writer authority.

Customer recovery reuses the linked Conversation's hashed, expiring proof.
Corrections and approval bind to the Menu owner's customer-safe content revision.
Publication and the delivered request state share one guarded transaction through
`stagePublishKitchenMenu`; no separate publication writer is added. The initial
review contract supports regular interactive Menus with individual Dishes and
price options; daily/document Menus, promotions, deposits and add-ons fail
explicitly. This is a bounded service, not a new universal commerce engine.

Stripe payment is separate from delivery stages. The App's signature-verified
`/api/menu-express/stripe-webhook` rechecks the provider Session and exact Product
price before advancing payment; a browser redirect cannot confirm it. Demo
payment is limited to labelled requests created by a current operator in local
development, and never invokes Stripe. Price/terms, live provider configuration
and release retain separate product authority. No source change deploys Rules.

Customer source files use existing multipart and Firebase Storage primitives,
with exact request proof on upload/download and no public download token. The
accepted development-open Rules still prevent any production-privacy claim.
Current checks live in the App's `test/menu-express.test.mjs`, Products' checkout
suite and Kitchen's publication tests. Refresh these pointers when ownership or
contracts change; demo evidence belongs in reviews, not this context.

The Main Misebox App explicitly installs Products for its catalogue and checkout
capability. This is not an ecosystem-wide default for tenant Apps. Products owns
price validation, browser-bound checkout status and the return page; see its
[package entrypoint](../../../../extensions/fireux-products/README.md). Menu
preparation and publication remain Kitchen/Menu responsibilities. A confirmed
checkout is not a completed Menu Express delivery.

Bären-specific operational assumptions and owner confirmation belong in
[the Bären context](../../../../../projects/misebox/baeren-ringgenberg/docs/ai/baeren-context.md).
They do not establish shared Misebox defaults or verified business hours.

The unused `misebox-tenant` layout shell is retired. Bären and La Tap retain
their App-owned branded layouts, composing the ecosystem-owned tenant Header
and Footer components directly. Those shared components remain active.

- Main App `/packages` lists its declared direct FireUX dependencies. Package
  details expose explicitly published examples; `/packages/fireux-kitchens/ordering/ticket`
  composes a Kitchen-owned local empty Ticket specimen.
  This catalogue is independent of the operational Orders Workspace and does
  not enable additional channels or perform database writes.
- `misebox-app` is the Main App. `/` presents the Kitchen directory using the same
  `useKitchenCollection` reader and `KitchenCollection`
  component as `/kitchens`. The dedicated directories remain at `/kitchens` and `/menus`, without featured Kitchens.
  `/product` retains Kitchen-team product literature. The saved operational
  composition renders directly at `/` on the declared Workspace origin:
  `workspace.misebox.app` in production configuration and `workspace.localhost:3001`
  locally. `app/pages/index.vue` chooses the host's surface; App middleware supplies
  its layout and Workspace metadata without a root redirect. The App route hook
  excludes inherited `/workspace` and `/workspace/kitchen` Home routes, with no
  redirect or alias. Capability descendants retain `/workspace/kitchen/**`.
  Workspace host responses are noindex. Main public origins send capability
  routes to `workspace.misebox.app`; local loopback origins send them to
  `workspace.localhost`, preserving the local port, path, query and fragment.
  Public entrance actions use Core's `workspaceEntryHref`/`openWorkspace` and the
  App's `workspaceConfig.kitchen.origin`; internal returns use `workspaceEntryPath`.
  Kitchen query selection recognizes Workspace metadata at root, with the same
  settled authority checks as capability routes. Workspace installation starts at
  `/` on its declared origin and never at a selected Kitchen record.
  Public pages, pricing and authentication stay on their current origin;
  tenant and service hosts are not redirected by this Main App policy.
  Authentication remains origin-scoped. `app/tests/workspace-surface.test.mjs`
  protects the exact host split, destination preservation and lookalike-host denial.
- A guest arriving at the Main App's Workspace root (or a tenant's
  `/workspace/kitchen`) is already in Kitchen Workspace, even before
  saving Kitchen information. Getting started describes its content state;
  it does not mean the Workspace is absent. The Kitchen/Place creation and
  onboarding commands retain their distinct persistence and authority roles.
- The Main App owns its host-specific `/`, navbar/SEO framing and short Kitchen
  entry copy in `app/components/Workspace/KitchenHome.vue`. The Kitchen-owned Workspace Index composes the shared
  collection/focus layout, publishes its bounded inspector context, and owns
  the real creation and identity controls. The former draft/workflow landing
  presentation is retired.
- Kitchen Calendar composes the shared month/date surface and a named Kitchen
  Agenda child. No event source is connected; do not report a zero-event total
  as if the agenda had loaded. Notifications remain the User-owned feed across
  workspaces, composed by the shared slideover and User notification items.
- Kitchen Workspace exposes Calendar from the shared top bar rather than as a
  sidebar destination. Calendar opens on the current date and moves through dates;
  Calendar and Notifications appear only for a signed-in user whose selected
  Kitchen root is active. Kitchen identity/presentation completion remains a
  separate progression and does not redefine onboarding lifecycle completion;
  focused current-day work belongs on the registered Kitchen Home once onboarding prerequisites prove
  that the Kitchen is ready for that operational landing state.
- Kitchen's `useKitchenWorkspace` exposes the selected Entity as
  `{ data, id, outcome }` and owns `{ collection, collectionOutcome, select }`.
  There is no separate Index owner. The composable does not own page JSON; the domain Index UI owns its
  bounded landing inspector projection and capability-specific props.
  Kitchen selection is a local App-scoped preference through Core
  `useWorkspace`; it does not invoke the account primary-change command or
  reapply that primary when a consumer mounts. The Choices child is presentation
  only; its Selector parent owns the collection reader. The Index reconciles
  only a completed collection result: keep a valid choice, select the first
  available Kitchen otherwise, and clear only a confirmed empty result.
  The Kitchen-owned `Workspace/Navigation.vue` supplies the persistent selected
  identity and switcher to the Core sidebar through package registration. Kitchen
  Workspace identity avatars prefer the linked Place logo and its saved backdrop,
  falling back to the profile image without tinting it; the shared presentation
  adapter is `kitchen/utils/kitchen-workspace-avatar.ts`, over Place's shared
  `place/utils/place-identity-media.ts`. Supplier identity cards reuse that lower
  media rule, including inside Kitchen. The Brand editor and Appearance preview
  keep the saved logo backdrop separate from photo and menu-theme presentation.
  Pending and error outcomes do not become onboarding or clear the selection.
  Explicit Kitchen switching from a record route returns to the nearest
  registered capability above its first dynamic segment (for example a Menu's
  content page returns to Menus). Static capability routes stay in place;
  selecting the same Kitchen preserves the current route. Kitchen's index
  selection command owns this navigation through `workspace-switch-route.ts`.
- `fireux-kitchens` owns `WorkspaceKitchenAI`, `WorkspaceKitchen`, target
  loading, selection, creation, authority, and operational capability
  components. Each route supplies its own Kitchen Hero copy directly to the
  shared `WorkspaceHero` primitive.
- Kitchen-enabled tenant Apps enter management through `/workspace`, which
  resolves to the authenticated thin `/workspace/kitchen` doorway. A guest
  is sent to Core Auth with the intended route retained through sign-in and
  User setup. Their customer `/` route and brand remain App-owned. Kitchen
  sidebar identity, Dashboard selection, collection recovery, overview and
  creation return/cancel links use `useWorkspaceEntryCta('kitchen')`, preserving
  the App-owned Workspace entry and the tenant management entrance. Public Menu close remains
  customer navigation; it does not return to management.
- The dedicated Kitchen entry uses the App name and a compact heading. It
  shows the selector and Landing AI only after a Kitchen is ready, followed by
  compact Menus/Team/Overview links and the existing collection/focus surface.
  A settled empty dedicated-App association displays the named account and
  Kitchen access recovery, not creation onboarding or generic discovery.
  Existing Kitchen connection uses the trusted onboarding preview/completion
  flow and remains available when new Kitchen creation is disabled. Its existing
  relationship, App role and capacity policy decide whether connection is allowed.
  Account switching reuses Core sign-out with the manager return destination;
  this presentation grants no access and does not infer a Kitchen from branding.
- Non-Kitchen Misebox Apps receive no Kitchen pages, components, plugins, or
  server handlers.
- An App declares `workspaces: ['kitchen']`; `fireux-misebox` conditionally
  installs `fireux-kitchens`. Apps do not repeat the extension module.
- Misebox Apps declare native Nuxt layers at configuration time. The same App
  workspace list includes Kitchen and Misebox runtime layers only when Kitchen
  is enabled; other enabled domain layers remain explicit App composition.
  Module setup retains capability options, component registration and filters,
  but does not add layers in these Apps.

Verify registration through current App layers, package modules and generated
Nuxt declarations/routes, comparing one Kitchen and one non-Kitchen App when
loading changes. The former ecosystem, registration and Workspace guards are
removed.

The App-owned public `/api/fireux/context/product` response also publishes a
bounded identity (name, description, HTTPS image and App URL). FireUX consumes
this as a request-time projection for connected Project Identity and Overview; it is not
a write-back into the Project root or a replacement for Kitchen/Place identity.

## Account preferences and workspace entry

AppUser has no onboarding status. Workspace entry is available from arrival;
Kitchen creation and capability requirements remain Kitchen-owned. Optional
account/profile preferences belong to the concrete App experience and do not
establish App membership or Workspace readiness.

Interlaken Essen exposes locality, offer-name and introduction editing explicitly
from `/mis` through `Market/ProfileEditor.vue` and `useMarketplaceProfile`.
`usePersonalMarketplace` owns the single live `/api/marketplace/account` read;
the editor receives saved values and retains its own unsaved draft. The trusted
`POST /api/marketplace/profile` writes profile data only, requiring existing App
membership. Offer preferences do not grant Store authority. There is no automatic
welcome prompt, completion command, or profile-reset endpoint.

Public browsing uses the existing App navigation configuration in
`app/app.config.ts`. `/kitchens` presents venues; `/menus` groups eligible public
published Collection/Delivery Menus by venue. Food search matches active placed
Dish names or Menu/venue text before pagination, shows matching names and retains
the selected service entrance. Menu discovery reuses its directory response
without an additional client Kitchen read. See the food-search section in
`docs/concepts/family-menu.md` for read ownership and regression checks.
The public Kitchen reader uses published records for every role and does not
inject hidden Kitchens for administrators. Kitchen/Place presentation and
Firebase-hosted media retain their domain owners.

Public Kitchen detail and its `/menus` customer chooser share the same complete
`KitchenDetail` composition, built from Place's header, About, gallery and visit
information slots with Kitchen-owned menus and service timing. Menus, About and
Opening hours navigation stays on the current page. Operator controls appear last
and require current access to the exact Kitchen; admin status alone does not grant
Kitchen access. The `/menus` route remains the customer entry, while Kitchen and
Place routes retain their directory identity and route-owned SEO. Kitchen directory
cards keep their `/kitchens/<slug>/menu` destination.

Place owns the header's venue open/closed status and opening timetable. Its
`opening-hours-status` helper evaluates timezone-local weekly ranges, overnight
hours, adjacent shifts and the next start. The compact venue status includes a
same-day reopening after the current window and all of today's opening ranges;
the weekly timetable remains available through its opening-hours link. Verify
timing and presentation with the Place `opening-hours-status` and
`opening-hours-status-view` tests. Kitchen public service summaries expose
only enabled offering names, explicit serving hours and combined ordering pause
state; they never borrow venue opening hours or expose notification recipients.
Kitchen detail, Menu cards and Menu browsing reuse `ServiceTimes` for
“Serving now”, next starts and unknown/paused states. These are schedule indicators,
not checkout acceptance guarantees. Missing enabled schedules remain unknown.
Menu readers, cards, read outcomes and pagination remain shared.
Individual Menu URLs remain unchanged. `MenuBrowse` consumes the existing
Menu logo projection through `MenuRecordHeader`. The public payload carries the
Place's `media_backdrop_color` as the presentation-only
`kitchenMediaBackdropColor` for logo contrast, separately from the
saved Menu palette;
public presentation does not enable ordering or change publication.

## Kitchen Workspace navigation

Route `nav` metadata under `fireux-kitchens/src/runtime/pages/workspace/kitchen`
is the current navigation source. Core's Workspace layout renders it, and
`Workspace/Overview/Capabilities.vue` reuses it for capability doorways.
Follow `docs/concepts/components.md#workspace-navigation-contract`; these groups
can evolve with operator feedback and are not a fixed Workspace taxonomy.

Group indexes compose short summaries, supported lightweight Tools/configuration and links to substantial children. They are navigation composition, not new configuration owners. Do not add a stored setting merely to fill an index; report filters are local view state, and unfinished capabilities remain explicit. Venue opening hours belong to linked Place identity; serving schedules belong to Offerings. The Orders index distinguishes those two responsibilities.

Orders composes `FoodAndDrink/Services/Controls.vue` over the existing
`useKitchenOfferings` reader and protected update/interaction commands. Saved
Offerings expose their master enable state, serving-hour summary and pause controls
for enabled ordering interactions; full configuration stays at the Offering record.
The panel never mounts the order-board controller or uses its local Open now state.
Account/Kitchen authority and record-set changes invalidate unfinished intent;
loading, failure and a settled empty collection remain distinct. This composition
adds no subscription policy: exact Free/Plus tool allocation remains unproved.

POS New order uses settled signed-in staff identity and Kitchen access before
creating an empty local draft. Staff identity is verified on first Save and
preserved on later edits; the library remains a separate illustrative specimen.

The Ordering foundation is `kitchen/models/order.model.ts` (Order, OrderLine,
channel vocabulary and separate SavedOrderDraft revision envelope),
`utils/ordering.ts` (pure draft/line behaviour and strict detached projection),
and `components/Orders/Ticket.vue` (one order prop plus editing intents). Misebox
configures pos, kiosk and website; the Workspace draft entry creates POS drafts.
The App declaration validates support, not a working customer checkout.

The Workspace draft surface owns local order/form state. Its explicit Save draft
uses `useKitchenOrderDraftSave` and the thin order-drafts/save HTTP route into
`kitchen/server/orders/save-draft.ts`. The command checks current timestamp-bound
Kitchen/App membership authority inside a guarded transaction, creates only at
expected revision zero and updates only a matching revision. Channel is immutable
on a saved record. Writes preserve creation stamps and add server-owned audit
updates. Canonical draft data lives at `kitchens/{kitchenId}/order-drafts/{id}`
with schema_version 1, Kitchen ownership, revision, number, channel, lines and
stamps; document IDs come from snapshots rather than duplicate stored id fields.
Empty lines are valid for drafts. Input caps bound stored payload size.

`useKitchenOrderDraftCollection` uses Core's paged live window, newest update first,
and admits only the current membership-granted Kitchen. Retained rows are masked
while unavailable; invalid records fail explicitly. The same read-only source
supplies the Overview summary, with a plus marker for an incomplete count.
The save adapter captures account/App/membership/Kitchen/disposal scope and stops
obsolete credential dispatch and completion. Reopening detaches the saved Order;
unsaved changes and unfinished line edits block New draft and Open actions. Discard
changes affects local state only. Revision conflicts retain edits and never
silently overwrite another save. No new subscription gate is introduced.

The separate connected order exchange now supplies submission, operator
acceptance/rejection and preparation/ready/completed response states. Its
Kitchen-owned command, customer-scoped reads, entrypoints and limits
are mapped in `docs/concepts/order-processing-kitchen-fulfilment.md`. No payment,
dispatch or physical handoff service is claimed. Published structured Menu
selection now reaches this command through the Menu-owned selector and trusted
canonical multi-Menu item/option/extra/meal-choice/deposit resolver. The resolver
reads current Kitchen/Place/service/Menu windows and commercial terms inside the
existing transaction. Standalone promotions apply on the venue-local serving day;
meal deals retain set prices and supplements. Order lines carry canonical choice
notes for customer and operator tickets, and stored Menu selections retain the
structured references. Pricing is snapshotted separately from
Order facts; delivery-zone charges and payment are not yet connected.
The previous execution stack, checkout/webhooks, kiosk sessions, tracking and
legacy model are deleted. The new draft collection neither reads nor migrates
those stored records. Verify through `test:ordering`, the consuming App type
check, route registration and browser checks. Controlled transaction/adapter/UI
checks are not live Firestore write evidence.

Menu browsing and Offering/Fulfilment configuration remain independent. The retained Offering projection lives in `menu/server/offerings`; the small
Website ordering entrance follows the App channel declaration, published structured
Menu contract and enabled Kitchen offerings linked to that Menu. Supported services
require configured hours and enabled, unpaused interactions; table ordering also
requires table QR. Buttons, direct entrances and transactional submission share
this configuration boundary. Current opening hours are enforced; advance slot selection remains deferred. Immutable historical Sales own their
pricing snapshot through `kitchen/models/sale.model.ts` and
`kitchen/server/finance/sale-pricing.ts`, independently of an Order model.
The small Order uses UBL vocabulary but is not a conformant UBL exchange document.
The current source and focused tests establish this boundary; browser and full
customer journey evidence must be rebuilt with the corresponding behaviours.

Current group prefixes and destinations (relative to `/workspace/kitchen`):

| Sidebar group      | Route prefix      | Pages                                                                                                                   |
| ------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Orders             | `/orders`         | index, board (local views and filters)                                                                                  |
| Prep & Production  | `/prep`           | index, plan, Recipes and Ingredients (`/food/*`), stations, batches                                                     |
| Food & drink       | `/food-and-drink` | index, Items (`/items`), Menus (`/menus`), Promotions (`/promotions`) and Services (`/services`), all under this prefix |
| Stock & Purchasing | `/stock`          | index, inventory, purchasing, receiving, suppliers, waste                                                               |
| Food Safety        | `/food-safety`    | index, checks, records, actions, procedures                                                                             |
| Team               | `/team`           | index, people; Responsibilities remains a section anchor in people                                                      |
| Reports            | `/reports`        | index, finance, performance, costs, waste-report                                                                        |
| Identity & brand   | `/identity`       | Kitchen listing; venue profile, operating hours and appearance children                                                 |
| Settings           | `/settings`       | payments, integrations, access                                                                                          |

Home is the single primary arrival entrance. Its settled selected-Kitchen view
contains the App header, Kitchen AI and the selected Kitchen card. Operators
with multi-Kitchen management and more than one available Kitchen get the
existing visible Kitchen selector in the top toolbar, above AI, using the existing
selection command. The toolbar omits its full-width divider; the selector wraps
its choices within the available width. Home has no capability shortcuts,
status badge or Kitchen collection panel; empty/access/error states retain their
existing owners. Home uses the existing Kitchen pill above the sidebar user menu,
which also offers Kitchen switching. It is not repeated in the primary navigation;
Overview remains a separate primary entrance.
Overview presents one entrance per visible Kitchen area, using route-owned names,
descriptions and destinations; it does not flatten child pages or show placeholder
summaries. Group labels open their indexes. Orders, Prep & Production, Stock &
Purchasing, Food Safety, Team, Reports and Settings use the same
Core named Workspace composition with route-owned content and one NuxtPage outlet.
Their indexes are mini overviews; the child pages remain the working surfaces.
Food & drink has its own group index at `/workspace/kitchen/food-and-drink`,
composing the existing Group component. Items, Menus, Promotions and Services
are sibling children under that route; Menus is not the group
index and Promotions is not nested beneath it. Route order puts Identity & brand
and Team before the Kitchen working groups, with Settings last. Identity & brand is also a top-level entrance,
with the Kitchen listing and its venue/brand editors; it is not nested in Settings.
Settings retains Payments, Integrations and Access. Overview adds no collection readers or mutations.
Item and Menu creation open dialogs from their indexes; no separate create routes
are retained. The Items catalogue includes food and drinks with kind filters.
Existing Item and Menu detail/import/research pages remain for their consumed
editing workflows. Recipes and Ingredients live under Prep & Production.
Verify these distinctions with `workspace-navigation.test.mjs`.
Overview is a direct sidebar entrance for the selected Kitchen;
the Menu setup tool directory remains a contextual route hidden from the sidebar.
The combined catalogue reads the existing live Dish collection once, filters
All/Food/Drinks locally, and opens the unified `/food-and-drink/items/[dishId]`
editor. `FoodAndDrink/Items/Collection/Index.vue` composes Controls, Results and
Dialogs. `useDishCatalogue` owns shared filters, pagination and return-query state;
its strict provided context never acquires another collection. Dialogs owns local
creation, category and AI disclosures, clearing them on Kitchen changes. Controls
and Results emit actions without owning commands or dialog state.
Kind-specific detail contexts retain their filtering and authority. Catalogue
URLs and editor return links retain kind, search, category, completeness filter,
layout and page using `kitchen/utils/dish-catalogue-route.ts`. Both editors return
to the combined catalogue; initial loading preserves the requested page, while
settled shorter results clamp it. See `dish-reader-internals.test.mjs`.

Menus keeps collection search and Show archived in `useMenuList`, in memory for
the mounted App session and isolated by App, account and Kitchen. Returning from
a Menu or source editor restores those choices; a full reload starts fresh.
The collection controller owns collection/creation state, not record write helpers
or QR service acquisition. `useMenuQrTargets` acquires its own scoped service
read; record edits and publication remain with `useKitchenMenuRecordContext`.
Verify list restoration and owner isolation with `menu-format-list.test.mjs`,
alongside the reader, record and source/QR checks.

Kitchen Ingredients Create links an existing shared catalogue record, and Delete
removes only that Kitchen association through the direct
`kitchen/server/ingredients/create.ts` and `delete.ts` owners.
Both commands use current App membership and exact Kitchen access bound to that
membership’s creation timestamp, through `requireKitchenRecordMutationAuthority`.
They do not require a same-ID Place; existing Place-dependent workflows retain
`requireKitchenMutationAuthority`. Audit stamps retain the acting App. Creation is
idempotent without overwriting an existing link; removal rejects references in
recipes, dishes, prep items and supplier links, including later collection pages.
The preview opens the existing record route, whose removal dialog confirms scope.
`useKitchenIngredients` reuses Core `useFirestoreRead` for live Kitchen links,
including source reset and failure state; it combines that error with the live
canonical Ingredient projection error. A failed read is not an empty collection
or an indefinite loading state. `kitchen-ingredient-read-state.test.mjs` checks
loading, error, empty, ready and missing-canonical-record outcomes.
No Kitchen-local identity overrides or Update fields exist. Changing the linked
ingredient is not an implemented Update: document identity and downstream references
retain the catalogue ingredient id. Shared catalogue curation remains separate.
The focused `kitchen-ingredient-crud.test.mjs` uses in-memory fixtures; production
Rules and deployment readiness are separate from these command checks. Removal
checks existing references in its transaction; Recipe and Prep creation/update now validate their submitted Ingredient
associations in the same transaction. Other reference writers and document-only
Recipe deletion remain separate boundaries; this is not a universal referential
integrity guarantee. `kitchen-crud-boundaries.test.mjs` verifies membership-bound
authority and the Recipe update allowlist. Recipe updates accept only name,
description, translated names/descriptions and validated preparation; identity,
Kitchen ownership and unknown patch fields are rejected before the write primitive.
Its optional architecture disclosure is dynamically imported only in development
and contains source annotations, not operational payloads.
Identity & brand owns the Kitchen listing and the Venue profile, Operating hours
and Appearance links. Settings owns Payments, Integrations and Access. Food & drink,
Orders, Prep & Production, Food Safety and Team retain index-link navigation.
Existing editor routes and domain commands remain unchanged.
Stock & Purchasing and Reports retain their existing group indexes. Developer
routes remain hidden from Workspace navigation and Overview.
Their existing
working screens remain children at `/orders/board`, `/prep/plan`,
`/food-safety/checks` and `/team/people`. Indexes do not initialize those working
controllers or invent configuration stores. Existing small controls remain with
their owning capability; larger setup stays in child pages. The separate Settings Access component retains
its explicit unconnected-controls notice and existing authority boundary.
Menu records, imports and research live under `/menus`, an explicit exception to
the sidebar group prefix. Public Menu URLs and HTTP command
endpoints are unchanged. Operational Kiosk device setup remains unfinished; the
retired `/settings/kiosks` page is not registered. Calendar remains a contextual doorway; record details, creation,
research and parked routes are not primary sidebar entries. Research routes follow
the capability they describe. There are no retired-route aliases or fallback readers.

Orders retains its index and board over saved drafts and submitted orders. The
current exchange owns acceptance/rejection and preparing/ready/completed states;
dispatch and physical handover remain separate unfinished work.

Ordering is Kitchen-owned. Orders indexes its working and configuration children;
website connection setup remains under Settings → Integrations. Settings must
not repeat the retired per-Menu ordering configuration. Its Integrations and Access
availability notices do not imply completed tools. Queue/pass, prep views, food-safety
views and Access are explicit child pages composed from their existing owners.

Other maintained Workspaces currently have ordinary Workspace sections rooted at
`/workspace/<family>`, rather than Kitchen's nested operator groups; no artificial
`workspace/workspace` segment is introduced. Apply the same group-to-route contract
when those Workspaces gain actual nested groups, respecting explicit capability
route contracts such as Kitchen Menus.

## Kitchen and Place

`kitchen/utils/kitchen-presentation.ts` owns the shared Place-backed Kitchen
presentation (branding, currency and Kitchen palette). Kitchen identity and Menu
readers consume it directly; Kitchen identity does not depend on Menu ownership.
Verify this projection with `kitchen-identity-shape.test.mjs`.

Kitchen Identity at `/workspace/kitchen/identity` composes the five focused venue
edit sections, Kitchen listing controls, and separate Kitchen and Venue context.
It reuses Core WorkspacePage framing and shared Identity read states.
The separate `/identity/profile` page is retired without an alias;
`/workspace/kitchen/identity/operating-hours` owns venue and Kitchen schedules;
`/workspace/kitchen/identity/appearance` owns Kitchen menu palette editing.
The former duplicate `/identity/place` editor is retired without an alias.
These are explicit child pages, without query-view switching. Venue profile
excludes hours from the shared Place editor; standalone Place editing retains them.
Kitchen publication remains on Overview and uses Kitchen read/access
state independently of Place loading or failure. Currency is edited in the
Place-owned Visit section and follows Place read/access state. The root
update command checks Kitchen record authority; Place edits still require the
same-id Place. Identity research lists implemented human controls separately
from agent-callable tools and does not propose Place relinking or a Workspace
completion/theme layer. See `identity-state.test.mjs` and
`kitchen/identity-publication.test.mjs` for scope and delayed-result checks.
The shared hours editor presents a Monday–Sunday schedule, with a focused editor
for selected days, split opening times, overnight closing and 24-hour opening.
`place/components/OpeningHours/Schedule.vue` owns that shared presentation and
delegates saving to its caller; `OpeningHours/Week.vue` renders the same week
without loading an editor in read-only service previews. Place's BusinessHours editor supplies the Place
command; Kitchen's OperatingHours/Kitchen supplies the Kitchen operation-hours
command. Inherited Kitchen hours stay compact; separate hours begin from the
effective venue schedule and persist only when the operator saves an edit.
The Operating hours page also composes `OperatingHours/Offerings.vue`.
Its Service panels show effective inherited/constrained hours and selected Menu
availability through the same focused preview used in the Services editor.
The parent retains the stored records for diagnostics and resolves effective
Service hours from the already-acquired Kitchen and Place. Empty membership and
Menu read failures remain distinct; publication does not create service membership.
Pre-order schedules describe dining times, not request
intake; diagnostic customer funnels remain labelled unfinished.
The Operating hours composition places venue and Kitchen panels side by side
when space permits and published Menu panels in an independent-height grid.
It uses the shared weekly presentation's compact spacing without changing day
membership or hiding schedules. Routine timezone controls and labels are omitted
here; the saved venue timezone remains in use, with missing/conflicting schedule
timezones reported explicitly. Manual Place setup retains its timezone editor.
This presentation does not establish Google verification or change timezone data.
Identity pages expose one client-only, development-only bottom `FireDiagnosticsDebugPanel`
with Copy JSON. The owning reader/composition supplies bounded source projections
and derived state; `kitchen/utils/identity-debug.ts` excludes credentials, private
operational fields and signed media URLs. Operating hours reuses its one Menu
reader for both presentation and diagnostics, showing saved venue, Kitchen and
Offering schedules separately from effective hours. Appearance includes its local
draft and preview state. Research pages inspect their existing authored payload.
Updates preserve the exact day membership of unrelated windows and use the existing
Place hours command. An empty schedule remains unset under the current Place model.
Venue profile presents five current-value sections: Profile, Brand, Photos, Contact
and Location and currency, with saved logo/wordmark and photo previews. Each opens its existing Place-owned editor in a focused
side panel. The Overview listing card shows the nested Identity URL and
status, reuses the Home listing editor, and retains the directory visibility
switch even when Place details are unavailable. Editor panels close synchronously
on Kitchen or write-authority changes. Opening/operating hours and colour editing
remain explicit destinations from the relevant section. `PlaceEdit` composes
those same named editors together on protected public edit pages. Operator-facing
copy describes the venue or Kitchen, without exposing the underlying Place relationship.
Place ownership and explicit Kitchen mutation authority remain unchanged; Supplier
relationship flags are not part of this workflow. Profile owns name, short name,
tagline and about; Brand owns profile image, logo, wordmark and backdrop; Photos owns
cover and gallery; Contact owns contact/social fields; Visit owns address, timezone, shared currency and advanced map fields. The
Kitchen Identity page composes that Place editor with explicit Kitchen/Place
mutation authority; it states that venue changes apply wherever the venue is
used. Place remains a shared profile, without a required capability Workspace.
The Place Location form reviews and saves full address plus directory locality
in one authorised patch, with a stale-draft check. Prepared Identity proposals
also expose locality and include it when the full address changes. The editor
does not infer structured address, map coordinates or Google verification from
free text. Public Place/Kitchen detail composes the Place-owned Contact block
for phone, email and supported social links; empty/invalid links are omitted.
Directory cards and public details consume the same Place fields through their
existing live readers, without a separate publication copy.
Brand uploads use the existing trusted `image`, `logo` and `wordmark` storage paths
and independently update their matching fields. Directory publication is a
single labelled switch shared with the public Kitchen edit surface, inside the Kitchen listing card, without repeated visibility copy.
Visibility uses the existing Kitchen publication commands and does not enable ordering
or publish Menus. Place mutations retain explicit Kitchen operator authority.

`PlaceEditGoogleReview` provides a transient, read-only comparison of saved name,
phone, website, timezone and regular venue hours against Google Maps. Kitchen
Venue profile and the full Place editor compose the same comparison.
The authenticated `/api/places/[placeId]/google` read verifies the exact provider
Place ID, excludes AI copy and secondary/exceptional schedules, uses `no-store`,
and performs no Firestore operations. Missing or unrepresentable provider values
are not empty-value suggestions. Location fields remain outside this comparison
until structured address and coordinates can be updated coherently.

Persistent Google refresh is not exposed. Place has no per-field historical
provenance, and Google's storage/caching requirements need resolution before a
provider-import action can be presented as ready. Attribution does not resolve
retention restrictions. Existing provider-derived creation persists its current
payload unchanged; that pre-existing retention behavior remains subject to the
same review. Current references are Google's
[Place Details (Legacy) contract](https://developers.google.com/maps/documentation/places/web-service/legacy/details)
and [Places policies and attribution requirements](https://developers.google.com/maps/documentation/places/web-service/policies).

The ecosystem-owned `/places/[id]` route composes Place detail with the existing
public Kitchen lookup filtered by exact Place id. When a Kitchen is present, the ecosystem composes the same complete Kitchen detail
through its Place/Kitchen adapter; Place itself has no Kitchen dependency. Missing or
unpublished Kitchen relationships add no Kitchen content; failed relationship
reads remain visible errors. Supplier enrichment is deliberately disconnected.
Kitchen workspace actions carry `kitchenId` through the App-owned host redirect;
the receiving Workspace selects it only after its current access-bound collection
contains that id. Public and local Misebox workspace paths use the dedicated
workspace host. This does not grant access or share authentication across origins.

- Canonical Kitchen has root `id` and nested `identity` with `slug`, `status`,
  `visibility` and optional `source`. Source is `user` for an explicitly created
  shell and `place` when onboarding selects a Place; an unrecorded historical
  origin remains unset rather than inferred from classification or document id.
  Audit stamps and proved Kitchen capability configuration remain separate
  root concerns. Readers and protected edits use nested Identity exclusively.
  The joined display profile is named `presentation`, so it cannot replace the
  canonical Identity map. See `kitchen-identity-shape.test.mjs`.
- A name-only Kitchen shell may use a generated id while being manifested, but
  its name is persisted on the same-id Place rather than copied onto Kitchen.
- Same-id Place owns venue name, tagline/presentation, address/geo, media,
  classification, price level, timezone, business hours and shared currency at
  `default_currency_code`. Kitchen stores no active currency copy. The stored
  Place field name is retained; it is authoritative for Kitchen prices and new
  orders, not merely a seed.
- Kitchen Team owns the roster, role labels and invitations. Its shared person
  editor manages name and linked account. Linked names
  come from User accounts. Kitchen Identity and the public Place edit route compose
  the same Place-owned inline controls under `place/components/Edit/Index.vue`.
  Kitchen keeps those controls inside its Workspace and passes its explicit
  mutation authority; the public route retains Place owner/admin access and
  returns to Place detail. The trusted boundary checks current App membership,
  the Kitchen-owned access grant and the same-id Kitchen/Place for Kitchen edits.
  Directory visibility is a Kitchen-owned control exposed directly in Identity;
  it does not require Menu publication or ordering. The bounded
  `place/components/Edit/Identity.vue` dialog remains available for prepared
  identity proposals.
  Team labels do not grant or revoke workspace access.
- The Main App's User detail composition may append the Kitchen-owned
  `KitchenUserMemberships` relationship surface for the viewed User. Its
  trusted projection is limited to the User themself or a current-App
  administrator/developer, resolves canonical Kitchen and same-id Place
  records, and reports matching Team access without moving Kitchen meaning into
  Core User or mutating inconsistent records. Its Workspace entrance reuses Core
  `useWorkspaceEntryCta` so App-owned paths and separate Workspace origins remain
  respected.
- Menus and Orders remain their own records beneath their proved owner. Every
  newly created Kitchen atomically receives ordinary draft `main` and `drinks`
  Menus. There is no primary/specials Menu configuration on Kitchen.
  Their parent-scoped ids may repeat across Kitchens; public Menu
  projections remain separate and use Kitchen-qualified ids when these defaults
  are published.
- Operations is a Workspace grouping, never a generic stored field.
- Menus proves Collection / Focus: its collection header and direct record links
  lead to the canonical Menu destination, whose perspectives use local state.
  Creation stays with the collection; editing and publication stay with the record.
  Contextual AI follows the collection in `FoodAndDrink/Menus/Index.vue`.
- Kitchen owns the shared numbered-table count at `tables.count`. Its trusted
  Kitchen update command validates 0–500. Seating, tabs and billing
  remain separate Front-of-House responsibilities.
- App-support and legacy Kitchen-root operational maps are migration preimages,
  not authority.

Read current Kitchen and Place models plus
`docs/concepts/family-workspace-entity.md`,
`docs/concepts/place-kitchen-media.md`, `docs/concepts/menu-ordering.md`, and
the current Kitchen source and relevant source-owned tests.

## Kitchen and Menu read contracts

Stored contracts remain `kitchen.model.ts`. The sole Menu model is
`menu/models/menu.model.ts`, with Kitchen-scoped storage declared in
`menu/models/menu-storage.model.ts`. Menu owns catalogue metadata, publication,
audience, interactive/document format and an optional document attachment.
Kitchen owns named Offerings and its palette; Menu readers derive those inputs
from Kitchen and currency from the linked same-id Place.
`menu/models/menu-directory.response.ts` owns the public Menu directory entries,
Kitchen presentation and cursor. `kitchen/models/kitchen-detail.response.ts`
owns the public detail response. Associated Workspace choices use the live
`useKitchenTargets` collection; individual routes use `useKitchenRead`
with an exact associated id. The retired targets/current/primary/choices HTTP
readers and workspace response model are removed. Operational configuration
continues through its capability-owned readers. No response is the type of a
raw Kitchen document.

`useKitchenRead` binds only the live database, optionally hydrating the same-id
Place. Its collection override supports App-scoped operator records; it does
not select a demo or simulation database. Demo payloads remain outside this
reader, and the separate Test capability does not reinstate simulation storage.

`kitchen-interface.model.ts` owns resolved presentation inputs and card outputs.
Its identity presentation describes resolved display fields, while public
response fields remain explicitly bounded. `useKitchenComputed` consumes that
presentation contract. The live associated-Kitchen collection reads `Kitchen`
records and joins their same-id Place for presentation; Workspace selection
adds no stored model or second data owner. The association ceiling belongs to
`kitchen/utils/kitchen-capacity.ts`, independently of response types.

Public Menu detail is read by `menu/composables/useMenu.ts`; Browse, Order and
QR consume it directly. The unused aggregate reader and detail forwarding wrapper
are retired. Cards consume `useMenuCardPresentation`, while opening-hours display
consumes `useMenuOfferingComputed` directly, without importing mutation adapters.
The collection manager searches actual directory fields; it does not manufacture
item counts, availability or display order in a second card model.

## Public Menu discovery

Menu has one authoritative record at `kitchens/{kitchenId}/menus/{menuId}`.
There is no root Menu projection, standalone document Menu or directory sync.
Both formats use the Kitchen Workspace create/edit/publish/QR flow. Global
`/menus` discovery reads the collection group directly, accepts only exact
Kitchen Menu paths, joins visible active Kitchen/Place presentation and links
to the Kitchen-directory route. Pagination uses full paths to distinguish equal
Menu IDs in different Kitchens. Tenant reads stay bounded to their Kitchen.

Menu metadata uses `useMenuUpdate`; publication uses
`menu/composables/publication/useMenuPublication`. Trusted publication validates
content and writes only the canonical Menu in its guarded transaction. Retries
reread authority and content; repeats preserve the status-change audit stamp.
Imports and metadata no longer dispatch a second directory write.
Verify `menu-publication.test.mjs`, `menu-publication-client.test.mjs`,
`menu-canonical-discovery.test.mjs`, `menu-discovery.test.mjs` and
`menu-workspace-commands.test.mjs`.

Public Menu directory/detail, customer Order status/history, Team projections
and other server-owned Misebox views use normal Nuxt API fetching. Their existing
server projections retain authorization and related-record joins. Successful
client actions refresh Nuxt data; direct Firestore views keep Firebase listeners.
Changes from another browser require refresh on server-only views. Local
basket/editor drafts remain separate from stored records.

The custom SSE bridge, streaming endpoint override and transport-only CORS
middleware are removed. These APIs return normal uncached JSON through H3
handlers. Verify reader refresh, scope, pagination and publication projection
behaviour with the owning Menu/API tests and native Nuxt App typechecks.

The public `/menus` route is a customer discovery surface, separate from Kitchen
Workspace management. It presents one Menu collection, grouping only records
with the same explicit App/Kitchen source relationship. Document menus are Kitchen-owned first-class results. Origin kinds are not customer
categories; never infer venue relationships from matching names.

`menu/models/menu-directory.response.ts` owns the bounded public contract.
The server resolves optional Kitchen enrichment. Menus have no food/drink
classification or special deletion status. Main and Drinks are ordinary starter
Menu names; content classification belongs to items. Do not infer it from Menu
names or ids. Search uses published names, descriptions and venue names;
interaction filters use the projected supported contexts, not a promise of current
opening or checkout availability. Filters apply to loaded pages, with an explicit
load-more notice. Only published, public canonical Menus enter discovery.

`menu/utils/menu-discovery.ts` owns tested filtering and grouping. The public
route retains one acquisition debug panel; its presentation-only list adds none.
Discovery cards show venue description and one offering doorway rather than
Menu counts or a Menu list. The canonical Kitchen slug opens its public Menu
chooser; document Menus open directly. Reviewed promotional copy belongs to the
concrete App in `app/app.config.ts#menuDiscovery`, with its exact source
relationship, conditions and source URL; it never alters ordering prices.
The public discovery route uses compact branded customer framing rather than
the default product navigation. Search, filters and results take priority;
Workspace, product-demo and publishing calls to action do not appear here.
Customer accounts, vouchers and order links require proved customer routes
before adoption. Publishing/QR remains available through its existing solution. Changes here preserve the separate
Kitchen-owned Menu management contract and existing public Menu URLs.

Kitchen-owned Menu presentation uses the Kitchen's `theme.palette`, with the
application default when no palette has been configured. Menus store no palette
or kiosk skin. Document Menus use the same Kitchen presentation authority.
`menu/server/payload/theme.ts` resolves colours and `useMenuThemeSurface` renders
them through local Nuxt UI tokens without changing the host App's shell.

Place owns `default_currency_code`; Menu creation, imports, Sellables and
customer payloads read it from the linked same-id Place. Kitchen creation does
not copy it. Unset currency blocks tools that require prices until an operator
sets it through the Place command. Order context validation rechecks the Place
snapshot before commit; historical Orders and Sales retain their saved currency.
Changing shared currency does not convert existing commercial terms. Their
existing mismatch validation remains in force.

### Theme and capability entitlement decisions

Basic Kitchen background, text, primary and text-on-primary colours are editable
on every plan with Kitchen write authority. Paid presentation tools remain
undefined; do not invent plan gates or Menu layout/typography fields. Public
rendering does not depend on the viewer's subscription.

Kitchen has no `menus` configuration block. Published Menu records and their
`sort_order` govern browsing; primary/specials shortcuts and shared arbitrary
style/context fields are removed. Kitchen-owned Menus use an optional `doc`
object for attached documents; import uploads remain separate. `choices` belongs
to the derived ordering service profile, not the stored Menu. Menu identity
comes from its document and parent path; writers do not duplicate `id` or
`kitchen_id`. Ordering policy belongs to Kitchen Offerings, not saved Menu settings.

## Kitchen onboarding

`useKitchenOnboarding` owns the full domain flow, including post-create collection
reconciliation, selection and navigation. It consumes Core `useOnboarding` for
progression mechanics; there is no separate completion composable.

- `KitchenOnboarding` owns the shared search-first flow. Workspace, menu entry,
  and admin provision use the trusted association/creation commands. Existing
  records are resolved before any optional identity or branding changes.
- The directory route passes explicit `directory` intent and invokes
  `kitchen/server/index/onboarding/directory.ts`. Contribution records creator
  attribution and preserves the selected location identity or existing first-shell
  identity contract; it creates no Team membership or Kitchen access grant.
  All newly created Kitchens, including name-only entries, publish automatically.
  Existing visibility and data are preserved. A later Add to My Kitchens action
  is explicit and uses the ordinary capacity and access checks.
- Optional branding and enrichment follow creation. Search identity is
  preserved so an existing local result wins over the same Google location.

## Capability storage and migration

Kitchen Team's organisational role catalogue lives at
`kitchens/{kitchenId}/roles/{roleId}`. Each role owns its name; Team members
reference selected stable ids in `role_ids`. Suggestions are optional authored
starting points, not automatically created records. The Team Roles surface uses
named domain commands and the shared label/assignment mechanics under Core
`server/utils/workspace-team/roles.ts`. These labels do not introduce permission
rules. Fixed Dev and Operator labels coexist with authored industry suggestions.
Stored Team profiles contain only name, user_id and role_ids.

- Named capabilities live beneath `kitchens/{kitchenId}` only when readers,
  writers, authority, and consumers prove the exact owner and path.
- Fulfilment authority is `kitchens/{kitchenId}/fulfilment/policy` with singular
  `KitchenFulfilment` data. Runtime is child-only; retained root fields remain
  protected preimages until a separate export/deletion gate.
- Sproochli attachment authority is
  `kitchens/{kitchenId}/integrations/sproochli`. Runtime reads are child-only:
  missing means unconfigured/disabled, disabled children win, and failed reads
  remain failures. The guarded attachment command initializes from explicit
  input/defaults, never root data; existing child profile/requested languages
  remain owned there. Public Kitchen/Menu projections consume that reader.
  Root/App copies are retained preimages until a separate deletion gate, not
  fallback authority. Root models and canonical surface projections no longer
  advertise those copies. Demo fulfilment is separate from root configuration.
  See Kitchen's `server/core/sproochli-attachment.ts`,
  `server/identity/sproochli.ts` and `src/test/kitchen-child-attachment.test.mjs`.
  Provider cache/database ownership and live conversion remain separate work.
- Do not create generic settings/config registries, redundant ids, stamps, or
  parallel models.
- The former migration scripts are removed, with no supported repository
  replacement. Any authorized migration still needs an exact-target audit and
  reviewed plan, normalization, a confirmation hash, protected preimages,
  create-only changes where possible, post-write verification and a separate
  deletion gate. Runtime APIs do not become migration tools by default.

Use `docs/ai/firestore-mutations-context.md` and the Firestore skill for any
Firestore work.

## Access, subscription, and privacy

Kitchen Landing can create one real, unpublished Kitchen for the current anonymous
Firebase identity through `kitchen/server/index/onboarding/guest.ts`. Its id is
the anonymous uid; Place, Kitchen, default menus and the initial Team record are
created atomically without a User or AppUser. The guest Landing reads that exact
Kitchen live. Kitchen's `utils/guest-kitchen-claim.ts` persists an App-scoped,
random recovery secret before creation; browser locks serialize creation of that
local key across tabs. The trusted command stores only its hash at
`kitchens/{id}/claims/guest`, in the same transaction. The key has no sign-in
deadline and is removed from the browser only after successful adoption. Clearing
browser site data (including ending a private session) removes this recovery
proof. The original authenticated anonymous session can reissue an unconsumed
key; after that identity is replaced, recovery requires the retained key. It is
not account-independent recovery from another device.

After User/AppUser provisioning, `useKitchenAnonymousAdoption` invokes the
Kitchen-owned `server/index/onboarding/connect-guest.ts` action from Landing or
Dashboard. Onboarding preview, completion and empty Kitchen creation are separate
action owners at `preview.ts`, `complete.ts` and `create-shell.ts`; shared recovery
proof helpers belong to `guest-claim.ts`. HTTP adapters import these owners directly. It checks the proof,
original creator, owning App and current membership; the transaction transfers
Team, grants membership-bound access and marks the claim consumed by that account.
The Index selects the adopted Kitchen only once its live collection contains it.
Retries by that account are idempotent, but cannot restore revoked access; another
account cannot reuse a consumed claim. Existing-account capacity still applies.
Firebase anonymous tokens are not retained and Core authentication has no domain
handoff hook. Supplier and Project have not adopted this Kitchen-specific flow.
The accepted development-open Rules remain a separate pre-release boundary; this
is the trusted-command contract, not a claim that the database is access-restricted.

Other Kitchen workspace tools require a signed-in account, current App membership and
its Kitchen-owned access record at `kitchen_access/{uid}`. Only its
`apps[appId]` entry is selected, and that entry must match the current AppUser
creation timestamp; a previous
membership grants nothing after rejoining. Team labels do not
gate workspace access. Subscription limits remain enforced; every person counts
toward Team capacity. Individual role restrictions are deferred for development.

Menus owns its creation allowance in
`packages/extensions/fireux-kitchens/src/runtime/menu/utils/menu-capacity.ts`:
Free allows two retained Menu records per Kitchen; Premium and Business are
unlimited. This policy uses the acting user's actual AppUser subscription,
separately from Kitchen membership, and is consumed by the Workspace, its AI
context and trusted creation commands. It is not App Nuxt configuration.
Existing menus survive downgrade; price correction, item availability and
unpublish remain available to associated members regardless of their tier.
The trusted boundaries and retained legacy writers are mapped in
`docs/concepts/menu-ordering.md`.

- User-facing subscription vocabulary is Free, Professional, and Business.
- Role is separate: User, Admin, or Developer.
- Kitchen allowance is owned by
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-capacity.ts`
  and exposed by `useKitchenCreate`: Free and Premium allow one associated
  Kitchen; Business has no subscription count limit. Kitchen’s separate
  50-id access ceiling remains enforced by its domain access helper. Both new Kitchen creation and
  adding an existing Kitchen use this policy in trusted onboarding transactions.
  Existing associations remain readable/manageable over allowance; reopening one
  does not count again. UI creation uses the actual AppUser subscription and
  hides unavailable Create controls. Preview tiers do not grant capacity.
  Kitchen entry, selector, and sidebar use `useKitchenWorkspace` to show
  one selected Kitchen for Free/Professional and the multi-Kitchen chooser for
  Business. This is presentation only: retained associations and selection are
  not truncated on downgrade. The subscription badge lets a settled App Admin
  or Developer cycle their own actual subscription through the existing
  administrative `set-subscription` command, targeting the current account.
  This follows role authority in both local and hosted builds; ordinary members
  and guests go to pricing. The command captures account, App and membership
  intent before dispatch, while the live AppUser listener supplies the result.
  It is not a separate local preview. Core's
  `src/test/subscription-control-internals.test.mjs` protects this boundary.
  Kitchen no longer reads its allowance from App Nuxt configuration. Team and
  Test still use the existing App-configured capacity readers; their policy
  ownership must be resolved separately rather than inferred from Kitchen or Menus.
  Directory contribution consumes no My Kitchens association.
- Kitchen Team creation currently allows three members on Free, seven
  on Professional, and unlimited members on Business. The trusted Team
  create command enforces the limit; temporary page selection does not alter
  Team membership or AppUser state.
  Team management controls use the Kitchen-bound availability returned by the
  authorized Team reader; a display projection’s `can_write` field is not their
  authority. Every mutation still rechecks the actor on the Server.
- Administrative/developer previews do not create domain authority exceptions.
- Protected operational data is absent from public Kitchen/detail projections.
- The current Misebox Firestore Rules source is deliberately development-open;
  it does not decide whether a Kitchen operation belongs to Client or Server.
  Domain `useXCreate`, `useXUpdate`, and `useXDelete` operations make that
  transport decision from relationship, transaction, secret, and authority
  requirements. The live Firebase project retains its last deployed Rules
  until an explicit Rules deployment.
- Public route visibility never implies public execution authority.

Pricing copy and gates must agree with `docs/concepts/product-language.md` and
current Core App-access source.

## KitchenAI

Kitchen, linked venue, ordinary Menu, Dish and Recipe documents each support one optional
`context` string for operator background, decisions and questions. It lives on
the owning document, not in question records or a context subcollection. Existing
sparse documents without authored context read as empty text. Kitchen Identity &
brand and Menu Settings compose Core's `components/Context/Editor.vue` text area;
Core's scoped `useRecordContext` controller saves changes on leaving the field;
Dish and Recipe detail reuse `FireContextRecord` over the same Kitchen endpoint. The trusted
`kitchen/server/context/command.ts` updates only the selected document's context
and audit stamp after current App membership and Kitchen association checks.
Concurrent edits compare the previously read text before updating; failed edits
remain visible. Context is omitted from public Kitchen/Place/Menu projections.

`kitchen/server/context/authorized.ts` supplies the current Home and Menus intent
interpreters with saved strings after selected-Kitchen authority. Menus includes
up to 12 listed Menu contexts, prioritizing the selected Menu. Client page facts
cannot override that context. The ecosystem agents and Menu summary endpoint
reuse their already-read Kitchen/Menu/Dish/Recipe documents and read the linked Place's
context through `kitchen/server/context/read.ts`. Saved text is background, not
instructions or measured evidence. Questions and provisional assumptions remain
unconfirmed until the owner decides. Editing context never changes hours, prices
or other operational settings. These are human Workspace commands, not new
agent-callable write tools. Verify `fireux-kitchens/src/test/record-context.test.mjs`.

- KitchenAI is Misebox’s Kitchen coordinator over registered capability agents,
  evidence, and named tools.
- It never invents live operational facts or bypasses selection, subscription,
  authority, confirmation, or approval.
- Search-demand literature is not runtime evidence.
- A capability is agent-callable only when a registered tool and trusted command
  prove it.
- UI, context, inference, tool selection, confirmation, and mutation remain
  distinct responsibilities.

Menu `tools` definitions describe the existing Workspace import workflow;
they are not standalone agent-callable registrations and do not accept injected
tool context. Their catalogue links open the import screen. Team retains its
real shared definitions and server executors; agent-only actions are reference
entries, not direct human action links. Verify the rendered distinction and
doorways with `src/test/kitchen/tool-catalogue.test.mjs`.

Current source has an unresolved ownership seam: Kitchen-extension Workspace AI
components call Misebox ecosystem `/api/workspace/kitchen/agent*` endpoints.
Do not deepen that implicit upward dependency. Before changing it, decide whether
Misebox owns AI composition mounted above Kitchen Workspace, or Kitchen receives
one explicit optional provider contract. Two real consumers are required before
creating shared provider infrastructure.

Inspect current source under Kitchen `components/Workspace/AI*` and
`models/operation-*`, Misebox `runtime/ai` and `runtime/server/agent/kitchen`,
and the owning tool/command consumers. The capability-tools guard is removed.

Kitchen Home, Menus, Identity and Team intent interpreters, plus the shared Test
interpreter, use the existing Codex development transport without a forced model
id. Codex selects its supported default for the signed-in account; an API model
name is not proof of Codex availability. Production retains the configured AI
provider and model. Their source-owned intent tests protect the unpinned request
and unchanged production envelope.

Kitchen Team owns its bounded dialog-intent endpoint under
`fireux-kitchens/src/runtime/kitchen/server/team/intent.ts`. It prepares the
existing Team dialogs without performing membership mutations. Other Kitchen AI
consumers retain their existing integration boundaries.
Kitchen Team presents basic person CRUD, workspace role labels and a separate
copy-invitation action. Core’s shared role catalogue includes fixed Dev and
Operator labels alongside workspace-defined roles. Assigning these labels does
not change workspace access. Core `models/workspace-team-member.model.ts` defines the exact
three-field stored profile: name, user_id and role_ids. Legacy access,
job-title and dossier fields are retired. AI prepares basic person controls and
directs role assignment to the selected-person panel.
`useKitchenWorkspaceTeam` is the page command entrypoint for create, update,
remove and invitation preparation. It combines one live
member collection with an authorised account-identity projection; these have
different responsibilities and are not interchangeable read implementations.
Create uses the shared person form directly. The former Team AI suggestion
composables and forwarding Write component are retired. Linked names are
projected from the User account, and the Team update command preserves the account name on
a linked record. Existing generic tool executors remain adapters to the same
trusted commands for external AI consumers; they do not reimplement writes.

## Industry research

Misebox App owns its market interpretation through
`projects/misebox/misebox-app/app/search-demand.ts` and its named research files.
It consumes Core's research contract without making Core responsible for Kitchen
capability choices. `search-demand/industry-evidence.ts` links direct sources to
operator-job clusters; `search-demand/capability-assessments.ts` separates need
confidence and market-validation gaps from dated source implementation evidence.
Research groupings do not change runtime navigation, record owners, entitlements
or command authority. Historical observations retain their original dates.
Refresh evidence and source assessments when their inputs change, and verify
reference integrity through Core's `src/test/app-research.test.mjs`. Live operator
acceptance remains distinct from source inspection.

## Product literature and Demo

- Derive copy from current capability source, not a parallel marketing vocabulary.
- App Tools/Operations/Discovery components are literature and doorways;
  execution remains with the owning capability.
- Public Demo/Product Demo is read-only presentation over package-owned
  deterministic fixtures. It never becomes Live/Test authority or writes data.
  The public demo routes are `/demo` and `/demo/menu`; the retired Kiosk and
  order-board previews have no public demo links or sitemap entries. Keep the
  Kitchen and Supplier examples and their required Company/Place relationships
  with their domain owners. Ingredient presentation uses the supported public
  canonical reader, so the showroom is not an offline catalogue. Historical
  Deanos data keeps its explicit sample period and does not represent current
  customer activity. The App-owned product-demo-foundations.test.mjs protects
  the canonical Kitchen table boundary. See [Demo data](../../../../../docs/concepts/demo-data.md)
  for source owners, read-only boundaries and verification.
- Media, brand, SEO, translation, finance, jobs, blogs, and marketplace work read
  their named concept maps and owner source rather than expanding this context.

## Verification

The Main App owns release tooling at `projects/misebox/misebox-app/release`.
`build:release`, `prepare:firebase-output`, `deploy:preflight`, `deploy` and
`deploy:hosting` no longer depend on removed root scripts. Output preparation
materializes complete production dependencies from its isolated frozen lockfile;
preflight checks the Firebase SDK discovery entrypoint, executable and version.
The uploader starts the current Firebase CLI in a temporary neutral directory
with the absolute App config and retains its exact Main App targets. The explicit
`--rules-policy development` selection composes the authored Misebox template
through Core's `composeFirestoreRules`, validates only `misebox-78f9c` / `misebox`
and the effective reviewed public read/write policy. Omitted selection or
`--rules-policy production` retains the restricted production source and required
allow/deny emulator tests. Upload in either mode reads the existing named-database
Rules release and requires an exact match to its selected source, recording the
policy and target with the proof. These commands never deploy Rules, Storage policy
or tenant Apps; the development template is never a production fallback. The candidate permits
membership-bound Kitchen and Offering reads while keeping all Kitchen mutations
and raw Sellable terms server-owned. The candidate has no direct browser Kitchen
CRUD grants; existing trusted commands retain their validation and authority.
Blog, Product and provider-price mutations also remain server-owned; their
raw Product/price reads are admin-only. Public Product collection and detail
responses use Products' allowlisted server projection, excluding provisioning,
provider metadata and audit identities. Public discovery and admin catalogue
management are explicit separate reader modes.

Protected Place, Ingredient, Blog, Product and Professional image uploads use
the owning domain routes and Core's existing server Storage mechanics. They
validate image bytes, write immutable revisions and recheck authority before
issuing the URL. The separate authored `storage.production.rules` closes browser
SDK access; explicit public image token URLs remain readable. Production
preflight requires both localhost policy suites, and production upload compares
both exact live policy sources. Neither command deploys policies. Historical token classification and legacy deployed consumers remain separate
rollout decisions. Compatibility source/evidence is recorded in the dated access
review. The candidate supports owner-only private account reads, App-admin
featured settings, and Kitchen-operator Menu uploads, drafts, table tabs and
promotions. App metadata and join policy share Core's safe App-status snapshot;
public User directories and member display identities reuse their server
projection owners. Canonical membership lookup remains App-admin scoped and
independent of public tenant-directory eligibility. Its six-App authority must pass the required
overlapping-stale-grant access-budget regression, deleted/malformed earlier
App grants and non-string ID denial before release. See that
directory's README for commands and local-versus-live verification boundaries.

The Main App's native generated typing check uses
`app/.nuxt/tsconfig.app.json`, after preparation with the current dependency
graph. Its authored App config also remains a separate check. Stop the Main
App development server before `build:release`, and restore it after verification;
the release command never grants deployment authority.

For relevant changes:

- prepare/typecheck the Main App or affected tenant;
- verify one Kitchen App and one non-Kitchen App when registration changes;
- inspect generated component/plugin/server-route ownership;
- run relevant source-owned tests and package builds;
- run `git diff --check`.

The former `scripts/` guard suite is removed. Report existing
typecheck failures explicitly; passing focused tests does not excuse them.

## Authority and maintenance

Current source and executable tests outrank this context. Update this file only
when a stable recurring Misebox ownership, authority, language, or verification
boundary changes. Keep task state, migration counts, fixture inventories, route
dumps, and chat history out. Point to owning source and available tests instead.

## Optional shared sign-in

The Main App owns an optional FireUX account connection and custom-auth participant
at `server/user/connections/fireux.ts`. Core Auth System still owns post-auth
navigation; the App supplies its additional provider through the explicit slot.
The participant authenticates the existing local account and preserves its User,
AppUser, profile, subscription and workspace identities. There is no email-based
merge, bulk migration or automatic membership grant. Read
`docs/ai/account-connections-context.md` for the hub/private-store authority and
separate activation checks. Ordinary ecosystem development Rules are unchanged.

## App product context

The Misebox App owns its bounded product context at
`apps/misebox-app/context/product` in its runtime database. Its implementation
lives in the concrete App: `server/app/context`, the matching `server/api/app/context`
adapters, and `app/pages/dashboard/context.vue`. This is App-specific product
background, not a universal context registry or operational Kitchen state.

The reader requires current Misebox App admin/developer membership, projects
only supported fields, and returns a content revision and source path. The
read-only AI consumer rereads that source and rejects a mismatched preview
revision. It supplies context to `fireux-ai`; the AI package owns neither
source discovery nor access policy. Source context is background data, not
trusted instructions. App context works without a FireUX Project connection.
Published product context is separate from this internal draft record. The App-owned
`server/fireux/context/product.ts` publishes explicitly authored public literature
through `/api/fireux/context/product`, with schema version 1, public visibility,
a bounded description and content revision. It requires no caller credentials,
Project relationship or Firestore read. Never project internal draft context or
operational records into that public response automatically.

FireUX Project Overview validates and displays this public response. Its internal
page endpoint retains Project operator authorization, but the outbound public
request carries no token. The current reader configures only the Misebox Project;
other child Apps and generated-App template installation remain unimplemented.
The previous draft-sharing command and UI are retired. Historical stored grants
have no effect on public discovery.
The public integration uses no service-account impersonation or cross-database
access. App-owned server credentials still protect any future database-backed
publication writer; public read access does not authorize writes.
Development-open Rules still prevent describing stored context as private;
this record contains only non-sensitive product background.

### Workspace and AI seams

Kitchen presentation and shared Workspace mechanics are mapped in
`docs/concepts/family-workspace-entity.md` (Landing/Test/Team comparison,
Team construction, Collection/Single presentation and KitchenAI handoff).
Keep these boundaries when changing the UI:

- Published UI context is bounded presentation data, not command authority or
  repository/chat history. Pending/error states are not empty accounts.
- Kitchen Identity keeps its selected Place editor section during a same-Kitchen
  live refresh, pausing the editor while data is pending. Kitchen/authority
  changes and missing/failed Place reads dismiss it; a field save does not
  require reopening the section. The owning Index and Place editors retain
  their separate presentation and mutation responsibilities.
- Domain commands retain authority. AI intents prepare the existing controls;
  they do not mutate records or prove that a proposed action succeeded.
- Account, Kitchen and route changes invalidate obsolete results, including
  round trips back to the original selection.
- Landing → Menus handoff is one-use, memory-only, exact actor/Kitchen scoped
  and expires after two minutes. Other capability AI routes have not adopted it.
- Domain Index components compose shared controls; domain roles, invitations and
  operational details stay with their owner. Do not restore forwarding UI copies.

The owned intent sources are Kitchen `server/index/landing-intent.ts`,
`server/menus/intent.ts`, `models/ai-handoff.ts` and
`composables/workspace/useKitchenAIHandoff.ts`. Verify the seam through
`src/test/kitchen-ai-handoff.test.mjs`, `menus-intent.test.mjs` and
`landing-intent.test.mjs`; the separate KitchenAI ownership limitation above
still applies. Test remains a disposable string pipeline, not a client feature.

Menu records use `/workspace/kitchen/food-and-drink/menus/[menuSlug]` with local Items & prices
(Dates & selections for daily Menus), Publishing, Import & source and Settings perspectives.
Section and source-upload records remain separate destinations. Shared selected
Menu state is scoped by App/account/Kitchen and reconciled only from settled
live data; it grants no access. Verify navigation through
`menu-record-controller.test.mjs`, `menu-record-view.test.mjs` and
`menu-record-navigation.test.mjs`. Public links use the owning App's Menu route
grammar; publication does not establish service or payment readiness.

## Kitchen branding and Menu presentation

Kitchen owns shared branding colours. Its Appearance colour editor uses
`theme.palette` and the trusted Kitchen theme command; basic colour editing is
available on every plan with Kitchen write authority and is not gated by
identity completion. Menu-specific presentation tools and paid-plan boundaries
remain separate product decisions.
Appearance groups the four palette fields into Page and Highlights and renders
a local menu-style preview. Draft colours require an explicit save; discarding
restores the latest saved palette. A newer incoming palette blocks saving a stale
draft until it is discarded. Preview presentation does not alter the Workspace theme.

Kitchen-owned Menus consume that palette directly. Separate Menu layout and
typography tools have no stored contract yet.

Customer Item images use Kitchen-owned `services.item_images`, edited in Appearance
through the existing protected Kitchen update command. Absent/false means text
only; true shows Item images when available across Browse and service catalogues,
including Collection selection. Images remain Dish-owned; missing/failed images
retain names, prices and choices. No Menu image copy, image generation or required
photo is introduced. Operational Kiosk presentation is not implemented by this
preference. See `item-presentation.test.mjs` and `menu/server/payload/presentation.ts`.

Kitchen `services.title` is the shared customer-facing food title, edited inline
at the top of Workspace Services through the trusted Kitchen update command.
Missing or cleared titles display “Food & drinks”. Public food portal cards use
this title rather than concatenating Menu names; service configurations remain
separate Kitchen-owned records.

Kitchen pages declare `workspacePage: true` and `layout: false`. Core AppShell
selects `workspace/components/Index.vue`, composing Sidebar and Page. Page owns
Navbar, Breadcrumbs and the root NuxtPage outlet. Domain routes supply named
content components; group indexes use PageLinks when they need navigation cards.
The old Workspace layout and GroupPage shell are retired. Native Nuxt UI slots
remain component API details, not custom FireUX page-composition contracts.

The Food & drink overview composes `FoodAndDrink/Index.vue` with one shared
Service/Menu acquisition for its summary, page JSON and slim KitchenAI composer.
`useFoodAndDrinkIndex` owns that shared read coordination and safe page publication;
the parent provides it once through `useFoodAndDrinkIndexContext` and assembles
Items, Menus, Promotions, Services and AI children without threading state props.
Consumers require that mounted provider and never create another overview.
Children own their presentation and
local interaction state, while the shared overview avoids duplicate readers.
It reuses `serviceOverviewSnapshot` for setup facts; AI receives the same page
context rather than acquiring another catalogue. Home, Menus and Food & drink
inherit the Kitchen-owned `kitchen/server/ai/role.ts` instruction: one KitchenAI
role with page-local focus, supplied evidence and explicitly available actions.
The shared role explains the wider Workspace without claiming access to unsupplied
records; Food & drink remains read-only. `food/answer.ts` reuses
`context/authorized.ts` for authorized saved Kitchen/Place/Menu background and
`useFireuxAi` for transport. Replies are brief and read-only, with no tool or
mutation actions. Other capability agent/chat consumers remain separate; this
page does not adopt their ecosystem endpoint dependency. Verify with
`food-overview-ai.test.mjs`.

## Menu operator entitlements

Free permits two retained Menus, with Main and Drinks as new-Kitchen starters. Plus operators may rename
Menus and have the existing unlimited Menu allowance. Professional and Business
both map to Plus features; Business additionally permits multiple Kitchens.
Name editing requires the acting User's Plus entitlement and Kitchen write
access, not a Kitchen subscription or another Team member's entitlement.
Downgrade preserves all existing Menus and saved names; future creation and
renaming follow the actor's current entitlement. Basic Kitchen colours remain
Free. The name editor and trusted rename command enforce this gate; creation
offers Main and Drinks for Free creation; existing Food names remain accepted without renaming stored records. Kitchen-owned Menus store an explicit
unique sibling slug. New records use generated document IDs; workspace and public
links use the slug while mutations and ordering references use the stable ID.
Menu `name` is customer-facing; optional `internal_name` distinguishes versions
in Workspace lists, headings and service selection. Blank internal names fall back
to `name`. Public directory projections use only `name`; changing either label
does not change the saved slug, content or service references.
Standalone document Menus retain their own existing identity authority.

## Kitchen offerings

Named offerings are independently managed Kitchen child records at
`kitchens/{kitchenId}/offerings/{offeringId}`. Snapshot identity supplies their
runtime ID; new commands omit a redundant stored ID. Root `services` arrays are
migration preimages, never runtime authority. `kitchen/server/offerings/read.ts`
and `kitchen/utils/offerings.ts` own the canonical child read. A malformed child
fails the collection projection instead of producing partial choices. Saved
interaction fields share the pure validation constraints used by the trusted
command and retain valid settings exactly during unrelated edits.

`useKitchenOfferingCollection` binds only an exact current membership-granted
Kitchen, preserves authority/child failures, and masks stale data across scope
changes. Menu links, QR targets, kiosks and schedule summaries consume this read
with independent loading/error states. Public Kitchen/Menu projections consume
child records and retain their private-notification allowlist. Order creation
rechecks the complete child collection inside its guarded transaction, including
added/deleted Offerings. Demo offerings live outside root configuration.

The offline `tools/misebox-migrations/kitchen-offerings.py` proposal preserves
exact supplied root/child preimages, hashes and revisions, never overwrites a
conflicting child and has no network or apply mode. Its structural proposals
require the current canonical reader and complete-inventory verification before
any future application. See `src/test/kitchen-offering-storage.test.mjs`,
`kitchen-offerings.test.mjs`, `offering-configuration.test.mjs` and
`menu-order-commit-guard.test.mjs`. These prove controlled source behavior,
not stored conversion or authenticated browser/provider operation.

`kitchen/models/offering.model.ts` owns the current `KitchenOffering` record contract. Each has a stable
ID, name, enabled state, eligible `menu_ids`, an inherited or custom serving
schedule and a list of interactions. The operator surface presents the provided
Services; Menu selection within a service keeps concepts such as Breakfast and
Lunch separate from service identity. Kiosk retains its two Menu sets.
`kitchen/models/ordering.model.ts` owns the ordering interaction policies: notice,
contact, pause, notifications and fulfilment instructions/deposit.

Place owns venue opening hours. Kitchen service hours inherit Place or narrow
its window. Each service inherits Kitchen hours or narrows them. Regular
interactive Menus may further narrow availability through `serving_hours`; absent
or null means throughout the linked services. Effective public availability is
the intersection, without rewriting stored children when a parent changes.
Pre-order request intake is separate from future serving hours. Menu owns
catalogue content and publication; Daily Menus retain their separate dated selections.
Order execution and submission remain outside this Workspace/public-display slice.
Ordinary published Menu browsing remains available independently of offerings.
An enabled offering can also provide a named browse doorway. Ordering requires an
enabled offering and interaction, published Menu membership and configured hours;
paused interactions and missing offering identities fail closed on the server.

The Operating hours page composes the venue editor, Kitchen operating schedule
and service schedules. `FoodAndDrink/Services` configures services inline at
`/workspace/kitchen/food-and-drink/services`; there is no individual Service page.
New offerings start disabled with browse configured and no selected Menus or hours.
Selecting an interaction in the editor performs no write and enables nothing.
Kitchen schedule writes retain the independent `ordering/hours` command and
`orders.operation_hours` storage. Removing that schedule restores venue inheritance
for Kitchen operations only.

`kitchen/server/offerings/create.ts`, `update.ts` and `update-interaction.ts` own
their direct protected actions; route adapters import each owner. Transactions
check Kitchen write authority and selected Menu ownership. The existing pure
interaction validator returns strict detached settings before credentials or
transaction retries; Offering schedule and configuration envelopes reject
unsupported shape and scalar values before actor resolution.
`kitchen/utils/offering-policy.ts` normalizes admitted policies for public response
derivation; `kitchen/utils/offerings.ts` validates saved children.
`menu/utils/menu-ordering.ts` derives each Menu's eligible ordering interactions.
Public projections omit private notification configuration. Notification delivery,
customer doorways, checkout, tracking and receipt execution are removed. Offering
configuration retains its own records, authority, schedules and supported Menu
associations; it does not establish a working Ordering flow.

`menu/server/offerings/projection.ts` combines Offering/Fulfilment configuration
for readable Menu payloads without enabling Ordering. `service-strategy.ts` owns
only that projection's Kitchen service classification. Menu public routing and
browse/document presentation retain their existing owners. Draft import planning
and protected Menu/item writes are independent of order submission.

Workspace Services composes the seven provided service types over independent
`kitchens/{kitchenId}/offerings/{offeringId}` records. On reveals inline menus
and hours; changes persist automatically through the existing trusted configure
command. Table service and QR table ordering have separate record identities,
menus, schedules and activation. Their fixed, explicit channel flags identify the
record's service even while Off; no absent-channel fallback grants both. Existing
public QR record identities remain stable when shared data is split. The command
rejects targeting a different service's record. Kitchen-wide table numbering is a
separate shared venue setting, not a shared service schedule. See the current
Services composition and tests described under Services configuration.
Website ordering/testing and the Delivery & payment doorway belong in Integrations.

`Fulfilment` uses the existing
`kitchens/{id}/fulfilment/policy` live reader and trusted command for delivery zones
and payment methods. Its delivery editor lives under Kitchen composables and
its pure zone helpers under Kitchen utilities. `Integrations` at
`/workspace/kitchen/settings/integrations` owns Website ordering: button preview,
copyable code and the direct customer link. The former Channels and Settings
index entrances redirect there. Website code targets the Kitchen's stable
`/kitchens/:slug/order` entry, or `/order` in a tenant App. This chooser consumes
the live published Menu directory and its safe offering-option projection, excludes
paused and unsupported interactions, and carries the exact selected offering id
to the existing per-Menu checkout. The dedicated Collection service entrance
separately combines eligible Menus in one basket through `useCollectionCheckout`
and the canonical multi-Menu resolver. Ordinary offering/menu edits do not require a replacement snippet.
Kitchen-owned `components/Ordering/Setup.vue` is the shared website-ordering
workflow in the App setup entrance and Workspace Integrations. It consumes live
Kitchen/Menu/Offering records through the existing identity and offering readers.
An explicit Kitchen id uses current membership-bound access without initializing
Workspace selection. Payment summaries consume that same explicit Kitchen through
`useKitchenFulfilment`; the existing Workspace reader remains the default for
Workspace-only consumers. Payment-edit actions in standalone setup use its
explicit authorized handoff rather than another saved Workspace selection.
Services composes inline `FoodAndDrink/Services/Service.vue` and its Setup
children; there is no exact-record Service route. Each local editor owns
availability, menu selection, hours and its scoped automatic configure command.
Credential waits reject obsolete account, Kitchen, App, membership, access,
draft and disposal epochs. Same-owner refresh preserves authored drafts; owner
changes dispose editors. Exact existing record identity is retained independently
of masked live reads, preventing an update from turning into creation.
Service readiness consumes `kitchen/utils/service-menus.ts` directly; the retired
setup-progress summary and empty-service creator have no runtime replacements.
The native configure endpoint is `/api/workspace/kitchen/services/configure`,
matching the client adapter. Storage remains Kitchen-owned `offerings`.

The public selector is `?offering=<id>`; Menu payloads and directories use `offerings`, `offering_options`, `selectedOfferingId` and `offering_hours`. Protected Offering commands accept `offeringId` and return `offering`; WhatsApp tests return `kitchen_offering_id`. Kiosk and customer Order/receipt/recovery references use the same `kitchen_offering_id`/`kitchen_offering_name` fields. Existing stored Orders, kiosk records and browser recovery made with retired reference names require an audited conversion or explicit reset before reuse. Source renaming alone does not perform that conversion, and no runtime alias infers an Offering from an order-numbering period.

Customer-facing services use `/services` for the catalogue, `/services/ordering`
for the ordering introduction, and `/services/ordering/setup` for setup. These
App-owned destinations compose existing capabilities; they are not a service-layer
registry. Ongoing management remains in Workspace. `/mvp` redirects to setup.

Main Misebox `/services/ordering/setup` reuses the public `landing` layout and its account controls.
It is an App-owned find/create entrance without the Workspace
shell. Signed-in users first see their live membership-bound Kitchens through
`useKitchenTargets`; local choice does not change Workspace selection.
The setup URL retains that choice as `?kitchen=<id>` for reload/resume; it is
only a requested identity, never access evidence. Pending collection reads do
not discard it. Current membership-bound access still gates the setup reader,
and only an explicit handoff updates the Workspace selection. A requested
Kitchen absent from settled access/collection results shows an unavailable
state with Choose another Kitchen; pending reads remain pending, and failed
reads show a check failure rather than an indefinite wait.
The public layout owns account controls. The page directly composes root/directory
`KitchenOnboarding`, reusing its Place-backed search, prerequisites and explicit
contribution commands. Its selected-review slot displays membership-lifetime-bound
`useKitchenAccess` results for an existing Kitchen; unknown/error reads are not
negative membership results. Searching/selecting does not join or select a
Workspace. Directory contribution and management access retain separate actions.
Place-derived directory contribution writes only the Kitchen listing (and a
non-physical Place for name-only creation), retaining attribution and existing
records without Team/access grants. It does not seed Menus or a Pass. Authorized
management completion creates Main/Drinks draft starters only when it creates a new Kitchen root. It never adds or recreates Menus on an existing Kitchen, including an empty collection after deletion. Pass initialization remains separate; existing records are preserved. Guest creation/adoption and explicit shell provisioning
retain their separate contracts. See `kitchen/server/index/onboarding/directory.ts`,
`commands.ts`, `system-menus.ts` and `src/test/kitchen/kitchen-management-defaults.test.mjs`.
The service entrance keeps a directory result visible with an access-check and
back-to-search path; it does not select a Workspace or infer authority from creation.
Workspace Offerings links to its existing Integrations setup, which renders the
same saved-state workflow without a second search or service-to-Workspace prompt.
A listing is not trading authorization. Existing App/Team association policy
contains no independent venue-operator verification; management onboarding for
a previously absent Kitchen must not be described as proving that right.
Ordering configuration and operational proof remain separate; the delivery contract
is in `docs/concepts/menu-ordering.md#website-ordering-delivery-contract`.
The external Blank website remains a snippet consumer, not a configuration owner.
Its selected public Kitchen slug does not change the signed-in Workspace selection;
the operator explicitly chooses that Kitchen in Misebox.

Allowed websites is a live, operator-edited integration at
`kitchens/{id}/integrations/website-ordering`, written by the guarded
`workspace/kitchen/website-ordering` command. The matching authenticated live
GET uses the existing server-only integration access boundary; it does not
grant browser Firestore access. It stores explicit HTTPS origins;
`www` and non-default ports are separate, and paths and wildcards are rejected.
An empty, invalid or unreadable policy permits same-origin framing only.
Kitchen ordering and Menu pages resolve their owning Kitchen on the server and
send CSP `frame-ancestors` with private, non-cacheable HTML. The Nitro response
hook preserves any independent CSP restrictions. Framed navigation into another
ordering route loads a new document to receive its policy; hydration does not
reload. The workspace preview uses its own origin. Direct public links remain
accessible, and this embedding control does not authorize orders or replace
order-abuse controls. Local HTTP origins are accepted only in development.
`allowed-websites.test.mjs` covers origin validation, policy resolution, headers,
framed navigation and authorized/denied mutations.
`offering-configuration.test.mjs` and `kitchen-ordering-choices.test.mjs` cover the
configuration and selection boundary. Kiosk device management remains in Settings.
Kiosk and per-Menu checkout URLs use current Menu slugs while device and Offering
references retain stable IDs. The existing Kiosk management component derives
device rows directly from its authorized live source and distinguishes loading,
read failure and a settled empty collection. Its actions capture exact account,
App membership/access, Kitchen and local selection before credentials; disposal
or changes away and back suppress obsolete navigation, refresh and feedback.
Activation validates the returned active/current device, Menu, Offering and exact
internally derived path through `kitchen/utils/kiosk-device.ts`.
`test/kitchen/kiosk-client-internals.test.mjs` protects these client boundaries;
server session policy is unchanged. Cookie-mutating activation and revocation
share a Nuxt-app-local physical in-flight guard that survives owner/screen resets
and disposal/remount, preventing response reordering within that app instance.
Kiosk activation explicitly selects the named Offering and Menu; session
authorization rechecks that binding and current
Offering eligibility. Devices without an Offering reference require reactivation or an audited conversion. Website buttons use the configured
App customer site origin, keeping localhost previews local. Ordering and integration
screens preserve pending, failed and empty Menu read states. POS remains an unfinished diagnostic
surface; it does not gain a separate backend in this cutover.

Source-only Demo fixtures author a Counter Offering with multiple interactions per
Kitchen. They never write Firestore or put policy back onto Menu records.
`tools/misebox-migrations/kitchen-offerings.py` is the current offline child-storage
proposal tool, with no network or apply mode. The older `named-services.py` and
`named_services_runner.py` describe a historical root-array intermediate shape;
their output must not be applied to the current child-only runtime. Current
proposals preserve supplied preimages, hashes and revisions and block conflicts;
complete inventory, canonical target validation and separately authorized apply
remain required. Order/kiosk reference conversion is separate from that storage
proposal and must preserve independent order-numbering-period fields.

Run `src/test/kitchen-offerings.test.mjs`, `kitchen-ordering-whatsapp.test.mjs`,
`kitchen/order-submission.test.mjs`, migration unit tests and affected public Menu,
recovery and Workspace tests when changing this boundary. Audience restrictions
and completed room-service/POS products require their own authorization design;
reserved interaction names do not imply those products are implemented.

## Ingredient identity and classification

`fireux-kitchens/runtime/ingredient/models/ingredient.model.ts` owns the simple
canonical culinary identity: name, slug, aliases, one category, optional image,
and audit stamps. IDs are exposed by readers and remain stable across edits.
`ingredient-taxonomy.ts` owns Misebox culinary browsing categories. Public
Ingredients, Kitchen ingredient grouping and the App's Workspace preview consume
that same list; no separate food-group classification is inferred from IDs or
processing kinds. Fresh/dried distinctions can be explicit ingredient names.

Catalogue curation uses direct `ingredient/server/create.ts`, `update.ts` and
`list-for-curator.ts` owners. `curation-input.ts` validates actual text, aliases,
categories and image URLs and detaches supported input before credential waits;
`curation-storage.ts` retains canonical identity, provenance and transactional
uniqueness. Creation respects the same 500-record bound as both indexes; edits
remain available at that bound. Kitchen association creation accepts only an
active, readable canonical record. It does not copy or edit catalogue identity.
Verify with `ingredient-command-internals.test.mjs`, `ingredient-identity.test.mjs`
and `kitchen-ingredient-crud.test.mjs`.

Kitchen Ingredients presents those live identities as a searchable category
catalogue with grid/list views and an image-completion filter. Its card component
handles missing or failed images without modifying identity. The add drawer and
dedicated add route reuse the Kitchen ingredient selection form; the catalogue
does not create a second ingredient library or supplier offer store.
Catalogue cards open a read-only ingredient panel, preserving the current search
and filters. Previous/next follows the visible category order. The panel and
dedicated detail route reuse `PrepAndProduction/Ingredients/Preview.vue`; global identity
editing remains with Ingredient curation.

The Kitchen Ingredient detail route uses a bounded live Kitchen-link query
matching the requested document id or canonical `ingredient_id`, rejecting
ambiguous links. It hydrates only that link's canonical identity through
`useIngredientDetail`; a missing canonical root remains an explicit linked
missing-root record. Collection browsing retains `useKitchenIngredients` and
its list hydration. Existing Kitchen membership access and deletion commands
remain the authority. Verify with `kitchen-ingredient-detail.test.mjs` and the
existing Kitchen Ingredient read-state/CRUD tests.

Ingredients collection and detail management bind only to an exact ready
Kitchen. Owner failures, inactive selection, child loading and settled empty or
missing results remain separate. Canonical catalogue refresh masks retained rows;
private curator reads rebind across account, App and membership changes. The
shared detail reader consumes Core read outcomes, and the public route follows
reactive IDs while keeping missing records separate from read failures. Source
proof lives in `ingredient-reader-internals.test.mjs` and the existing Kitchen
Ingredient detail/read-state checks.

Add/remove tools include the local dialog or search intent in their credential
lifetime. Closing a removal before dispatch cancels it; dispatched results stay
truthful. A successful removal can return to the collection after its own live
record disappears. Curation preserves dirty drafts across unrelated live changes,
prevents overlapping upload/save actions and suppresses obsolete completion.
Live read invalidation supplies refresh; successful writes do not depend on a
redundant Nuxt cache refresh. Verify with `kitchen/ingredient-tool-scope.test.mjs`.
These are source-owned controlled checks, not signed-in browser or live-provider
acceptance.

Ingredient curation owns `ingredient/server/image-generation.ts`: an authorised
missing-image command reuses `fireux-ai`'s server-only `generateFireuxImage`
primitive, uploads immutable WebP artwork through Core Storage, and attaches
`image_url` through the guarded Ingredient target. Existing images and concurrent
uploads win. A bounded stored `image_generation` lease prevents overlapping
requests; its operational metadata is excluded from public ingredient identity.
The Ingredient editor offers generation/retry only while an image is missing.
The directory's admin-only `Image/Batch.vue` runs the same command sequentially
for a snapshot of missing images, displays progress, stops on the first error,
and supports stopping after the current image. Leaving the page stops further
requests; successful images remain saved and a later run picks up only gaps.
The create endpoint starts the same command after the Ingredient is saved;
failure never rolls back creation. Development and hosts with `waitUntil`
support run it in the background; other hosts await it to retain the execution
lifetime. This is not a durable queue: interrupted work can be retried after the
lease expires. Direct database imports do not invoke this endpoint hook.
The AI primitive uses the existing App credential in enabled `app` mode and
supports a separate `FIREUX_AI_IMAGE_MODEL` override. Its catalogue declaration
is `ai.image.generate`; it does not expose a public unauthorised generation API.
See the image-generation tests in both owning packages for permission, provider,
lease, failure and concurrent-edit checks.

Supplier catalogues map their items to `ingredient_id`; supplier categories never
overwrite canonical Ingredient categories. Supplier offers retain commercial
packaging, prices and availability; KitchenIngredient retains Kitchen usage.
No supplier offer is established by a guessed menu input or provisional supplier
choice. Recipe preparations, stock and purchase facts remain separate owners.
Kitchen sourcing choices use `kitchens/{kitchenId}/supplier-ingredients` with
`supplier_id` and `ingredient_id`; the Kitchen supplier connection lives in
`kitchens/{kitchenId}/suppliers`. These links do not establish Supplier-owned
ingredient coverage, catalogue availability or Supplier Workspace access.
Supplier identity resolves through its Company and same-id Place.
The live Kitchen supplier directory is a Bringli consumer: identity lives in
`bringli-b0517/bringli`, while Kitchen connections remain in
`misebox-78f9c/misebox`. See `docs/concepts/suppliers.md` and the Kitchen
`server/api/supply/suppliers.get.ts` reader before migrating Supplier data.

Curation accepts identity fields only and permits missing images. Stored legacy
retirement/merge metadata is preserved and still gates public reads; it is not
exposed as everyday Ingredient identity or editable through the simplified form.
The bounded v2 category read bridge in `ingredient/server/category-migration.ts`
keeps unmigrated records readable during rollout. Current writers accept only the
new categories. Remove the bridge after all relevant stored data and runtimes
have completed the cutover, not merely after changing the TypeScript model.

`tools/misebox-migrations/ingredient-catalogue.py` and its reviewed JSON specify the exact
Misebox category cutover and Bären food-input seed. The runner preserves existing
fields/IDs, creates missing records and Kitchen links, requires a managed export
and source-bound private preimages, and checks update-time/create preconditions
before one atomic commit. It never removes old metadata or fabricates Supplier
products, prices, availability, recipes or stock. Seed evidence distinguishes
menu mentions from working assumptions. Verify with `ingredient-identity.test.mjs`
and `tools/misebox-migrations/test_ingredient_catalogue.py`, plus the representative App check.

## Workspace component placement

Kitchen navigation follows the accepted convention: capability entrances and
record destinations where required have URLs; Surface capabilities need no record
layer. Perspectives within a record use local view state. Groups
organise navigation and may have overview entrances without owning capability
paths. Dialogs serve bounded create, quick-edit, confirm and delete actions.
Other existing capability routes remain outside this bounded adoption.

All Menu collection rows open `/workspace/kitchen/food-and-drink/menus/<slug>`. The
`Menus/Detail` composition owns Items & prices (Dates & selections for daily),
Publishing, Import & source and Settings as local views, reusing the existing forms and commands.
Both Menu types open their contents first. The collection groups regular and daily
Menus without changing their record destinations. Date navigation lives in
`Sections/Collection/Week.vue`; `Schedule.vue` owns adding and copying selections. View state
resets on account, Kitchen or record changes and on a fresh page load; it is not
persisted in URLs or browser storage. `useMenuRecordNavigation` carries one
short-lived, scope-bound route-entry intent for section returns, creation and
legacy perspective links. It survives Nuxt transition remounts and clears on
leaving the record or selecting a local view. The old `/content`, `/publishing` and `/source`
entrypoints hand off on the client and replace themselves with the canonical
record URL; server redirects cannot preserve this in-memory intent. Section
records (`/<slug>/<sectionId>`) and source-upload records (`/uploads/<uploadId>`)
remain separate destinations. Create Menu retains its allowance-gated dialog.

Menu record framing shares `WorkspaceHeader`, `IdentityBar` and `Navigation`;
local view controls sit beneath the identity heading, and breadcrumbs wrap on
mobile. This is Kitchen-local presentation, not a cross-domain Core component.
Verify scope resets and default views with `menu-record-view.test.mjs`, handoff
isolation with `menu-record-navigation.test.mjs`, canonical links with
`menu-workspace-destination.test.mjs`, and commands with
`menu-workspace-commands.test.mjs`; browser checks cover local views and legacy
entry behavior without changing live Kitchen selection or publishing data.

Menus, Food, Drinks, Recipes and Ingredients collection route adapters share
one dashboard-panel/header/body composition with the same bounded content width.
Each owns its existing context and metadata; capability information occupies the
navbar's right slot. `Workspace/Collection/Header.vue` supplies their Kitchen content title and
actions without owning reads or permissions. Core's Workspace frame owns the
single route-breadcrumb trail; the Kitchen header does not derive another one.
Menu AI composition lives in the Menu capability rather than its route adapter.
CollectionToolbar supplies the shared search/count row and optional controls and
filters. Menus and Recipes use FireCollectionRow with domain-owned summaries; their
rows open the record directly. Food, Drinks and Ingredients default to compact
lists and retain optional image grids. Ingredients opens its record directly,
without a compulsory preview step. Food/Drinks and Ingredients render 40 filtered
records per page and reset pagination when filters or Kitchen change. This is
client-side presentation pagination over existing live readers, not server-side
query pagination. Existing readers, permissions and commands remain domain-owned.
Menu AI composition lives within its capability; collection-specific filters and
image controls remain explicit. Verify search, empty results, direct record links,
layout switches and mobile wrapping in the browser, and run the Kitchen package
check. The shared components are Kitchen-local, not a cross-domain Core contract.

Kitchen component capabilities follow the responsibility groups mapped in
Kitchen component organisation below. `Workspace/Home` owns entry controls and
Kitchen creation; Workspace Navigation, AI, Research and Tools retain cross-page
composition. `FoodAndDrink` and `PrepAndProduction` group their actual domain
responsibilities rather than following arbitrary sidebar labels. Menu, ordering
and command ownership are unchanged. App-specific entry presentation stays in
`misebox-app/app/components/Workspace/Kitchen/Home` with distinct generated names.
Food and drink catalogue routes share `FoodAndDrink/Items/Read.vue` and its
card components. The catalogue defaults to a compact list with category and
completion filters; cards open the specification directly. Kitchen AI is an explicit
side-panel action. Optional Dish `category` describes culinary role independently
of Menu sections or breakfast/service context. `Categories.vue` and the identity
editor use the existing scoped Dish update command; unknown categories remain
unclassified rather than inferred at read time. Menu item selection reuses this
category list and excludes dishes already in that section. Creation visibility uses selected-Kitchen
membership, matching Ingredients; command authorization remains authoritative.

The all-Workspace contract is `docs/concepts/components.md`; verify moved
consumers against Nuxt registration, Vue compilation and App typechecking.

## Dish specifications

Kitchen Dish may hold an optional `spec` with its portion basis, station text,
purchased ingredient quantities, Kitchen Prep Item quantities, recipe references,
assembly steps and source notes. `models/dish.model.ts` owns this bounded contract;
`kitchen/utils/dish-specification.ts` owns pure authored-input validation, shared
by the editor and the trusted update action. `useDishUpdate.ts` transports that
validated intent; the server remains authoritative. `FoodAndDrink/Items/Spec.vue` reads linked records live and edits the
specification independently of public identity copy. Prep definitions created
there persist independently if the dish edit is cancelled. Recipe-backed prep
items reference the recipe through `recipe_id`; they do not duplicate its inputs.
The Dish surface defaults to Spec and uses a `view` query parameter for Spec,
Preparation and Menus. Existing inbound paths retain Dish identity. Menu-to-Dish
links carry the originating menu/section for a return link. `Dishes/Menus.vue`,
`Menu.vue` and `MenuSection.vue` compose existing live Menu, section and item
readers only while that perspective is mounted; they show saved dates and prices,
with independent loading/error states. No menu presence is inferred from names.
Spec presents ingredients and mise en place beside assembly, with recipe links
and secondary source notes. Preparation groups saved requirements by the linked
Prep Item station and opens its batch method or recipe. Manage dish contains identity/category editing and
deletion. Order, training and performance placeholders are not dish tabs; those
perspectives require their own real records before being exposed. Each perspective
composes its domain reader rather than adding unrelated data to Dish.
Station text and alternative dressing notes are descriptive only, not production
routing or automatically calculated choice/stock demand. Menus continue to
reference Dish identity. Verify saved specifications through the dish editor and
readback; recipe readiness remains separate from menu publication.

Dish and Drink remain one Kitchen-owned record family partitioned by `item_kind`.
Workspace readers bind only an exact ready Kitchen and preserve owner and child
read outcomes; record routes react to their ID and treat the wrong catalogue kind
as missing. Collection counts and creation controls wait for a settled result.
An open specification editor retains its same-record draft through its own live
refresh, while actor, Kitchen, record and local editing changes invalidate pending
preparation. Field tools pass Core's actual editing intent to the command adapter;
completed commands retain truthful results while obsolete surfaces suppress feedback.

Create snapshots its authored flags and text before credentials. It validates
an optional `is_flagship` draft flag but always creates an unpromoted record;
promotion and media attachment retain separate actions. Record commands do not
require Place data. Submitted specifications recheck canonical Ingredient
associations and active catalogue records, plus same-Kitchen Prep Item and Recipe
references, in the write transaction. Unchanged links do not gate an identity-only
update; deletion remains document-only and idempotent.

Image and flagship endpoints recheck their existing Kitchen writer policy in the
committing transaction. Dish identity comes from the exact document path and
stored `kitchen_id`, without a duplicate stored `id` requirement. Image conflicts
clean up only the new unreferenced upload; uncertain commit outcomes retain it
for recovery. Provider normalization and Storage ownership remain with
`kitchen/server/dishes/image.ts`. These contracts are covered by
`test/kitchen/dish-commands.test.mjs`, `test/kitchen/dish-media-internals.test.mjs`,
`test/dish-reader-internals.test.mjs` and the Dish tool lifecycle tests; fixtures
remain separate from signed-in browser and live-provider acceptance.

## Recipe ingredients and prep outputs

Kitchen recipes separate purchased Ingredient references in `preparation.ingredients`
from Kitchen-owned Prep Item references in `preparation.prep_items`. The latter
reference `kitchens/{kitchenId}/prep-items/{prepItemId}`; names and production
methods remain on that record, not copied into recipe lines. The existing
`kitchen/models/prep-item.model.ts` owns preparation inputs and output yield.
Recipe quantities describe consumption; they are not completed production or
stock balances. Purchased beef strips remain an Ingredient even though the
supplier has sliced them. Output names describe the food without a redundant
“prepared” prefix.

`kitchen/models/recipe-preparation.ts` owns the preparation types;
`kitchen/utils/recipe-preparation.ts` owns stored-data normalization and strict
authored-input validation. Omitted draft fields retain their supported defaults;
explicit null, mistyped collections/quantities/text, unknown nested fields and
invalid document references are rejected before normalization. Workspace Recipe
editing enters through `Recipes/Form/Index.vue`, preserving its existing Nuxt
component name. The parent acquires Ingredient/Prep collections once and owns
one Recipe draft and Save lifecycle. Identity, Ingredients, PrepItems and
Instructions sections edit that draft through models without additional reads
or commands. `PrepAndProduction/PrepItems/Create.vue` owns the separate Prep draft,
creation command and errors. Its busy event prevents overlapping Recipe Save;
only a current successful creation emits the reference to the unsaved Recipe.
The existing Recipe/Prep scope guards and parent intent capture suppress obsolete
attachment and feedback. Target changes remount that nested creator; live
same-record refresh does not reset authored drafts. Names and methods remain
on the saved Prep record. Cancelling Recipe editing does not delete a created
Prep definition. Recipe Preparation remains the saved-recipe read surface;
daily prep scheduling and batch execution are separate, unconnected surfaces.

Recipe create/update/delete are direct action owners under `kitchen/server/recipes`.
Validated inputs, source language and translated-language deltas are detached before
credentials; update merges only the captured language edits with the current
transaction snapshot, preserving concurrent other-language changes and explicit
language clears. `kitchen/server/prep-items/create-input.ts` separates authored Prep
parsing from the existing create-only transaction. These actions use record-level
Kitchen authority because their payloads do not depend on Place facts.
`kitchen/server/core/preparation-references.ts` validates submitted Recipe inputs
against current Kitchen Ingredient associations and active readable catalogue records,
plus exact Kitchen Prep Item records. Prep creation validates its purchased inputs
and any referenced Recipe in the same transaction. Identity-only Recipe edits do
not newly revalidate untouched preparation; Delete still removes one document only.
Every reference read precedes the write. The command tests are local transaction
fixtures, separate from live Firestore, Rules and signed-in operator acceptance.

Recipe and Prep command adapters capture actor/App membership readiness, Kitchen
access, route and local owner/draft intent. Translation preparation checks that
intent between asynchronous stages; result IDs must be canonical strings, with
Update/Delete returning the exact requested record. A dispatched write reports
its truthful result, while obsolete screens suppress feedback. The Form blocks
Recipe Save and Prep Create from overlapping, preserves dirty same-record drafts
across live updates, hydrates clean drafts, and resets only on authority/record
changes. Draft edits invalidate pending action intent without clearing the new
draft. Explicitly opened editors survive their own read refresh within that same
scope. Ingredient/Prep read failures stay distinct from empty input lists.
Source checks include `test/recipe-reader-internals.test.mjs` and
`test/kitchen/recipe-editor-lifetime.test.mjs`.
Verify this boundary with `src/test/recipe-preparation.test.mjs`
in `fireux-kitchens` and the recipe editor/read surfaces.

## Dish-owned commercial terms

Dish carries no Menu, Promotion or deal classification. The retired `is_deal`
flag is neither accepted by Dish creation nor emitted by catalogue/public
projections or AI import schemas. Meal deals belong to Kitchen Promotions and
can be placed on regular interactive Menus; Order pricing remains separate.

`kitchen/models/dish.model.ts` owns normal `price`, `price_options` and `add_ons`.
`kitchen/utils/dish-pricing.ts` owns validation and the canonical reader; Dish
create/update commands own writes. The focused Dish Pricing editor uses the
existing Dish mutation scope. Menu placements own Dish or meal-deal references, availability
and order, and reject pricing fields. Dish entries resolve normal terms from
the referenced same-Kitchen Dish; meal-deal entries resolve set price and choices
from the referenced Kitchen Promotion. Dish offers apply explicit price overrides
without changing normal terms.

There is no shared Sellable record, adoption control or placement-price fallback.
Imports put commercial terms on Dishes and reject conflicting terms on an existing
Dish instead of silently repricing it globally. Import comparison reads normal
terms from the referenced Dish through the same pricing validator as public reads,
never from placement fields. Archived sections/items are excluded before pricing
validation; missing Dish terms and meal-deal entries produce explicit errors rather
than zero-price comparison rows. Verify `menu-import-current.test.mjs`. Package Demo Dishes also own their
normal terms; Menu fixtures carry references only. `menu-demo-terms.test.mjs`
loads complete scenarios and checks their public pricing projections. Dated copies preserve references
and organisation, not copied prices. Stored-data conversion uses the reviewed
`tools/misebox-migrations/dish-pricing-plan.py` and sparse, update-time-guarded
`apply-dish-pricing.py`, preserving typed preimages. Source checks do not prove
that any particular database has completed that cutover. Historical Sales remain
independent; Order records are outside this conversion.

Verify Dish commands, Menu content commands, publication, draft planning and
`menu-record-input-internals.test.mjs`. The migration planner has separate offline
tests. Public runtime proof requires converted records.

## Daily menu selections

Menu publication state is presented as Published, Unpublished or Archived.
The stored `draft` value means Unpublished in Menu UI; it does not describe
recipe readiness or an unfinished menu. Import review drafts retain their own
draft terminology. No separate visibility flag is required.

Kitchen-owned Menus may use `schedule: daily`; absence retains regular Menu
behaviour. Daily selections reuse MenuSection and its dish-backed MenuItems,
with an explicit ISO calendar `date` on each section. Names such as Lunch or
Dinner remain operator-authored labels. Group membership, exclusivity, rooms,
bookings and headcounts are not part of this contract.

`menu/server/daily-menu.ts` owns Plus-authorized schedule changes, dated
selection creation and copying one date to an empty destination date. Copies
create new section/item identities while reusing Dish references. Existing
populated menus cannot silently change schedule. The Workspace calendar uses
live section and item readers, retains its selected date during navigation,
and reuses the ordinary item editor. Add-by-name composes existing Dish and
MenuItem creation; those writes are independent and a failed item attachment
can leave the newly created Dish in the catalogue.

Daily publication is explicit per date and browse-only. The Menu-owned
`publication/daily.ts` command validates that date's active selections and items,
requires current Plus/Kitchen authority, and atomically records `published_dates`
on the existing Kitchen Menu route. The scoped Publishing control reuses Calendar's
selected date and the existing mutation adapter. Copying never publishes a date.
Public Menu/QR routes stay stable, resolve today in the linked Place timezone,
and expose only today's published selections; empty days never show yesterday.
The mounted reader refreshes at the server-provided local date boundary. Daily
ordering remains blocked by projection and submission. See `family-menu.md` and
`daily-menu-publication.test.mjs` alongside the existing date/copy/publication tests.

## Bounded capability UX proofs

Collection / Focus and Surface describe capability interaction; they are not
architectural levels or stored fields. Workspace → capability → destination(s),
with contextual tools, is the product grammar. A Surface need not introduce a
record destination. Navigation groups remain composition; existing grouped routes
are not the capability model. Mixed or unproved capabilities remain unclassified.

Menus is the Collection / Focus proof. Identity is the contrasting Surface proof:
`Identity/Index.vue` composes the Kitchen listing and explicit child-page
navigation. `Profile.vue` owns current-value venue sections, focused editors and
the public-page destination; `Listing.vue` owns URL, status and publication.
They retain the existing state and authority branches.
These two local compositions do not yet prove a shared renderer or Core contract.
See `docs/concepts/family-workspace-capability-tool.md`.

Stations has one capability entrance at `/workspace/kitchen/stations`, linked
from Prep & Production. Its existing Kitchen-owned station editor replaces the
retired prep-stations placeholder. The retired Settings → Kiosks destination is not registered and its dead
navigation link is removed; no device-management capability is claimed. Station printer,
recipe and mise en place assignment UI remain separate implementation work.

Kitchen onboarding creates the default Station at `stations/pass` in the root
creation transaction. The Stations workspace invokes an authorised create-only
ensure command for existing Kitchens; repeated calls preserve the stored station,
including its name. This is gradual repair on workspace access, not a bulk
database backfill. The default-station command and focused station-default test
live under Kitchen server/stations and src/test/kitchen respectively.
The Stations surface preserves the live reader's loading, failure and empty
outcomes and hides rows and counts until settled. Default-Pass setup invalidates
obsolete credential waits and late errors synchronously when Kitchen, account or
writable state changes, and when its watcher is disposed. Server authority still
governs execution. Verify the client watcher and rendered read states with
`src/test/kitchen/station-read-scope.test.mjs`.

## Selected Menu record composition

Kitchen's routed Menu record and section-record entries provide one
`KitchenMenuRecordContext`. The header, local perspectives and nested tools
consume it through `useKitchenMenuRecordContext`; they do not recreate the
Menus collection controller or Kitchen creation/adoption composition.
The Menu-owned `useKitchenMenuRead` uses Core's live query binding, restricted
to the selected Kitchen and exact routed slug with a two-match bound. Ambiguous
slugs fail instead of selecting an arbitrary record. Account/App membership
scope changes rebind the query; source and sections remain live, separately
owned readers.

Access reuses `useKitchenAccess` and its current App-membership lifetime check.
The selected Kitchen is read through `useKitchenRead` and presented through
`useKitchenInterface`. The existing Menu edit roles remain separate from
Kitchen access. Record entries distinguish pending, failed, denied, missing
and read-only states; a source failure does not hide a loaded Menu.

Collection selection, creation allowance and the upload queue remain in
`useKitchenWorkspaceMenus`. The source-upload tool uses the record context
when mounted inside a record and the collection context otherwise, including
source-only uploads without a Menu. The independent upload-detail route and
the section editor's item/Dish workflow retain their existing owners.
Routes and local view handoffs are unchanged. Verify sharing, scope changes,
read outcomes and upload entry with `menu-record-controller.test.mjs`; use
`menu-record-view.test.mjs` and `menu-record-navigation.test.mjs` for view resets.

## Protected capability writes

Active writers below use strict supported inputs, source-owned storage targets
and transaction-time current App membership plus membership-bound Kitchen
access. Client adapters snapshot intent and synchronously invalidate obsolete
account/Kitchen/destination/disposal continuations across credential waits.
Live readers retain separate loading, failure and empty outcomes. Controlled
checks prove their bounded contracts, not live writes, deployment or providers.
Paths below are relative to `packages/extensions/fireux-kitchens/src/`.

| Responsibility                    | Owning source                                                                    | Focused evidence and preserved limits                                                                                                                                                                                                                                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dish/Drink create, update, delete | `runtime/kitchen/server/dishes/{create,update,delete}.ts`                        | `test/kitchen/dish-commands.test.mjs`, `test/kitchen/dish-ui-scope.test.mjs`, `test/kitchen/dish-image-scope.test.mjs`. Delete is document-only and refuses saved Menu/Promotion references. Media and Dish → Menu placement are separate effects with explicit partial-success recovery; dispatched media cannot be rolled back by client invalidation. |
| Recipe create, update, delete     | `runtime/kitchen/server/recipes/{create,update,delete}.ts`                       | `test/kitchen/recipe-commands.test.mjs`, `test/recipe-command-internals.test.mjs`, `test/kitchen/recipe-scope.test.mjs`. Direct route adapters consume each action; Delete is document-only. Edited-language deltas merge with stored translations; blank clears only that language. Forms use `translate: false`; pure seeding/results remain.          |
| Prep creation                     | `runtime/kitchen/server/prep-items/create.ts`                                    | `test/kitchen/prep-create.test.mjs`, `test/kitchen/prep-scope.test.mjs`. Create-only; separate from Recipe Save. Its reference remains an unsaved Recipe edit until Save. Unused Prep Update/Delete adapters have been retired; no write capability is claimed.                                                                                          |
| Waste observation                 | `runtime/kitchen/server/waste/record.ts`                                         | `test/kitchen/waste-command.test.mjs`, `test/kitchen/waste-scope.test.mjs`. Identity, time and audit are server-owned; this does not claim immutable storage under development-open Rules.                                                                                                                                                               |
| Menu sections/items               | `runtime/menu/server/sections/commands.ts`, `runtime/menu/server/items/write.ts` | `test/kitchen/menu-content-commands.test.mjs`, `test/kitchen/menu-content-scope.test.mjs`. Draft edits preserve Dish-owned commercial terms and do not publish. Current section/item action menus invoke archive and adjacent movement commands; their transaction boundaries are mapped in the Menu family map.                                         |
| Menu metadata/removal             | `runtime/menu/server/records/update.ts`, `runtime/menu/server/records/delete.ts` | `test/kitchen/menu-metadata.test.mjs`, `test/kitchen/menu-metadata-scope.test.mjs`. Metadata writes only the canonical Menu; naming alone needs acting-user Plus. Status remains publication-command owned.                                                                                                                                              |

Menu manual creation lives in `menu/server/records/create.ts` and shares
`menu/server/creation-capacity.ts` with reviewed draft imports. Pure
`menu/utils/menu-metadata.ts` supplies the same complete typed document and
description contract for creation and metadata updates. Explicit item writes
validate numeric add-on and variant terms before forgiving display/extraction
normalization, so malformed prices cannot become zero-priced options. These
commands detach inputs before credential waits. The source-owned
`menu-record-input-internals.test.mjs` checks those contracts alongside the
existing transaction authority, projection, rollback and publication checks.

The Menus collection and source-upload readers bind only after the selected
Kitchen has an exact ready Workspace outcome. Kitchen failures/loading remain
distinct from empty Menu collections, and independent upload failures retain
their own outcome without hiding loaded Menus. Section/item and uploaded-source
pages render failure and loading before missing/empty copy or counts.
`src/test/menu-reader-internals.test.mjs` checks these owners and full templates.

Menu creation, URL import and Dish pricing editors capture
their account/App/membership, destination and local editing lifetime. Completed
writes stay truthful, while obsolete navigation, draft resets and feedback are
discarded. Upload credentials are cleared immediately on scope change and an
older token cannot replace the current token. Scope/disposal checks live in
`menu-create-scope.test.mjs` and `kitchen/menu-tool-completion.test.mjs`; they do
not establish a signed-in browser or provider transaction.

Menu Archive preserves the canonical record, content and service references.
Restore returns to draft. Permanent Menu Delete removes only an empty,
unpublished regular Menu with no service references or document attachment;
there is no section/item/upload cascade or root projection writer. Stable IDs,
Menu content and publication remain Kitchen-owned.
The surviving Menu Record and Dish route owners handle successful navigation
when their own live deletion unmounts child editors; external intent changes
still invalidate completion. No stale record is retained to disguise deletion.

## Directory and Workspace entrances

Misebox Main App renders public Kitchen discovery at its public origin's `/` and
management directly at its Workspace origin's `/`. There is one registered Home;
the inherited `/workspace` and `/workspace/kitchen` entrances are excluded without
aliases or redirects. The App owns its discovery copy; Core DirectoryHome owns
shared framing and Header exposes Workspace without an account-mode toggle.
The Workspace sidebar omits a separate Directory row. Its logo opens Workspace
Home; existing account and brand navigation remain available. Tenant Apps retain
their customer root and domain-scoped management. Workspace manifests start at Home; this is not
proof of dual-PWA installation, offline support or cross-origin account handoff.

## Capability read-state and Overview boundaries

Kitchen working collection pages distinguish target readiness, loading, failure and settled empty results. Orders draft reads mask obsolete scope results; Sales invalidates obsolete account, App membership, Kitchen and range reads and closes transaction details when the report is unavailable. Supplier association reads retain their binding and projection failures. Overview Activity consumes read-only owned sources, never station-default setup or write controllers solely to display counts. Ingredient and Supplier counts measure associations; completed-Sales counts do not establish payment receipts or profit. The family contract and optional-extension composition live in `docs/concepts/family-workspace-entity.md`. Verify these boundaries through `fireux-kitchens/src/test/kitchen/capability-read-state.test.mjs` and consuming App checks; signed-in browser evidence remains separate.

Misebox's pricing wrapper derives its Menu allowance and supported actions from current commands: Free supports two Menus, with Main and Drinks as new-Kitchen starters, Plus permits custom regular Menus and the existing domain tools. Team roster/invitation support does not claim fine-grained permissions; preparation execution, tables, costing and outgoing finance must not appear in pricing without connected source. Existing Jobs and Engagement claims have their own owners and require separate verification. No local copy or controlled test establishes an accepted commercial price, live provider readiness or shipping authorization.

Kitchen Orders has its index and `/orders/board` under `/workspace/kitchen`.
Services is a separate visible capability at `/workspace/kitchen/food-and-drink/services`,
alongside Items, Menus and Promotions in Food & drink. Its configuration overview
and inline setup are composed by `FoodAndDrink/Services/Index.vue`.
It reuses the existing scoped Offering reader and setup commands, including
Delivery settings. Payment settings remain a Kitchen Identity child at
`/workspace/kitchen/identity/payments`. The old Orders/Channels route and sidebar
child are removed without aliases. No Offering/Fulfilment storage, price or
Order-processing command changes accompany this move.

Payments presentation is composed directly by `Identity/Payments/Index.vue`;
Delivery settings by `Orders/Delivery/Index.vue`. Both reuse the existing
Kitchen Fulfilment reader and protected commands, without a section-switching wrapper.
Services configures the existing service choices and their menus and serving times.
Order ticket examples compose `Orders/Examples/Index.vue`; stage previews share `Orders/Examples/Preview.vue`; success presentation is
`Orders/Examples/Success.vue`, with local example state and shared validation retained.

## Kitchen Workspace component sections

Kitchen’s inner capability entries now name Collection, Detail, Create, Add and
Edit responsibilities where consumed. Ingredient Add remains a Kitchen
association workflow; Menu source-upload records remain separate from Menu
creation. The current physical map is in `docs/concepts/components.md` and
the source-owned reader/scope tests. Existing context providers, Kitchen
selection, serving checks, commands and authority remain the same owners.

Daily specials editing requires the acting User's Plus entitlement, independently
of Kitchen authority. Free accounts can read retained daily selections and withdraw
published dates, but cannot create, copy, edit or publish daily content. The record
context separates `canManage` (Kitchen authority) from `canWrite` (content editing);
section/item commands enforce the daily editing tier inside their transactions.
Verify `daily-menu.test.mjs`, `daily-menu-publication.test.mjs` and
`menu-workspace-commands.test.mjs`.

## Ordinary Menu creation formats

Kitchen Menu creation starts with Interactive or Document, independently of daily
specials. `Create/Index.vue` owns that choice and `Create/Form.vue` creates a draft
with its format. Existing records without a format retain their document metadata
or interactive content. Interactive imports remain source/AI review workflows;
`Detail/Document.vue` instead uploads one guest-facing PDF or image through
`document-upload.post.ts` and the existing metadata command. It neither creates an
import source nor invokes AI. New files use a unique storage scope; prior files
are retained so failed replacement cannot break the attached document. Orphan-file
cleanup is separate. Publication requires a document for document-format drafts.
The stable public Menu and QR routes remain unchanged. Verify creation validation,
`menu-document-upload.test.mjs`, publication checks, and the two editor entrances.

The Menus collection offers Breakfast, Lunch and Specials as optional interactive
Menu suggestions. They create no records until selected by a Plus actor; Free
accounts see locks and an upgrade destination. These are ordinary named Menus,
not the dated Daily specials feature. Settings exposes confirmed Menu removal
through the existing deletion command; catalogue records are retained and deleted
starters are not automatically recreated. Creation and removal retain their existing
actor/Kitchen scope guards. Verify the onboarding defaults tests and Menu tool
completion checks.

The public Kitchen entrance is `/kitchens/<slug>/menu`, labelled Menu. Its route
lists only published Menus using the existing scoped directory reader, with simple
browse links as the default food landing. Collection and Delivery actions appear only when
the existing service-filtered reader finds an eligible published public Menu. The old collection route has no alias
or redirect. Individual Menu and QR destinations retain `/kitchens/<slug>/menus/<menu>`
and its `/qr` page, independently of the collection entrance, preserving existing
QR destinations. Root discovery remains `/menus`; Workspace remains plural.
Verify `menu-public-slug.test.mjs`, discovery and public QR checks.

The public Menu entrance reuses the existing Kitchen presentation for its logo,
venue name and address through `kitchen/components/Detail/MenuHeader.vue`. Menu cards consume
published offering hours through `KitchenDetailOfferingTimes`; no availability is
inferred from missing schedules. The entrance uses the same content for QR, direct
and website arrivals and retains a Venue information link. No referrer-based flow,
additional record reader or ordering action is introduced.

## Ordinary Menu audience

Publication state and audience are independent. Absent audience retains Public
behavior for existing records. Public Menus are discoverable; Private link Menus
are excluded from root/scoped directories and cross-Menu choices, but remain
readable by their published direct links. The source Menu is authoritative even
without a second publication or audience copy. Private-link detail pages declare
noindex/nofollow; that is a discovery preference, not authentication.
`Detail/Audience.vue` owns the ordinary-Menu control and Publishing explains each
result. Daily specials does not expose this control. Protected group is visibly
unavailable, rejected by metadata/publication, and denied by shared detail/file
resolution; no password verifier or credentials are stored in the development-open
database. Real protected content requires separate secure storage and file delivery.
No live database Rules or stored files are changed by this implementation.
Verify discovery, publication, public-slug and audience metadata tests.

## Customer Menu service surfaces

Collection composes Menu-owned `components/Selection/Index.vue` over the existing
service sources. Catalogue, item selection and basket review are focused children;
The Selection owner stays mounted through catalogue loading, errors and empty
results, keyed by Kitchen slug and service entrance. `useServiceBasket` owns
component-local selections, while `service-basket.ts`
validates option/extra/meal choices and calculates display totals in integer minor
units. The serving-time notice is composed once above Collection sections. The
projection retains each chosen offer's Kitchen/Menu/Section identity, and basket
lines retain service IDs and item identity. Changed or missing catalogue selections
are flagged without silently repricing existing basket lines. During loading or
failure, the basket stays accessible but availability is explicitly unverified;
Add, Edit and quantity increases are blocked, while reduction and removal remain available.
Successful recovery rechecks existing lines against current offers. The
`menu-service-basket.test.mjs` lifecycle regression renders the ServiceMenu template
through refresh, error, recovery, changed/missing items and owner changes. This basket is
component-scoped and resets on a different Kitchen/service entrance; the Collection
recovery owner below restores the same customer session after reload.
Basket Edit reuses `Selection/Item.vue` with a detached copy of saved choices.
`useServiceItemEditor` owns the local selector lifecycle; cancelling preserves the
line and returns to the basket. `useServiceBasket.update` validates before replacing
a line or merging identical selections, including the quantity limit. Stale or
unverified selections cannot be edited, and edits never write catalogue prices
or submit Orders. Verify replacement, cancellation, merging and stale-update
behaviour in `menu-service-basket.test.mjs`.
Collection required-field messages appear after that field loses focus or a
submission attempt. `Selection/Checkout.vue` owns only this presentation timing;
`useCollectionCheckout` retains validation and submission guards. Service and
catalogue blockers stay visible and disable submission immediately. Verify with
`collection-validation-display.test.mjs` and `collection-checkout.test.mjs`.

Collection composes `Selection/Checkout.vue` with the existing customer Details
and a focused customer `Selection/Confirmation.vue` receipt. The receipt uses
the saved response for quantities, choices, line amounts, total, status and
Kitchen estimates, and receives collection details from the existing public venue
projection. It adds no reads or order writes. Update failures keep the saved
receipt visible and expose the existing response refresh. `useCollectionCheckout` owns customer input,
one immutable submission attempt and response polling through `useOrderExchange`.
The existing `/api/ordering/menu-submit` adapter and Kitchen submission command
accept selections across the same Kitchen's menus. Each selection retains the
canonical Menu/section/item IDs, choices, service IDs and expected unit amount;
the anchor Menu route uses its stable public slug. Ambiguous failures retain the
same reference and payload. A definite rejection checks the existing receipt
before unlocking edits, preventing a missed success from producing another order.
Collection recovery uses tab session storage through `useCollectionRecovery`,
scoped to App, Kitchen, Collection entrance and customer. It preserves basket
choices, customer fields and the exact pending submission payload/reference.
Refresh checks for a receipt without automatically submitting; unresolved retries
reuse that payload. Restored basket entries retain current catalogue checks,
and reset clears the saved session. Storage failure is visible. There is no new
server submission store or payment integration.
Delivery, table and room presentation do not yet consume this selection slice. Regression evidence lives
in `menu-service-basket.test.mjs`, `menu-service-view.test.mjs` and
`collection-checkout.test.mjs` and `collection-confirmation.test.mjs`.

Dish may configure an optional `bottle_deposit` amount through the existing
protected Dish command. Zero/absence means no deposit. Pricing composes the
focused `FoodAndDrink/Items/Deposit.vue` field without another record reader;
normal price, variants and extras are independent. Pricing retains the one
existing Dish context and save coordinator, composing focused `Pricing/Options.vue`
and `Pricing/Extras.vue` draft controls. Those controls add no readers or writers.
Public manifests project
`bottleDeposit` explicitly; descriptions never determine runtime charges.
Collection item selection composes `Selection/Bottle.vue` for an explicit new
bottle or matching-bottle exchange choice. New bottles add the configured amount
per drink; exchanges add zero. Basket lines retain the choice, show the drink
subtotal and separate deposit, and distinguish otherwise identical selections.
Deposit changes invalidate existing local selections. This is display/selection
behaviour only; existing Order submission and pricing remain outside the slice.
Verify `dish-bottle-deposit.test.mjs` and `menu-service-basket.test.mjs`.

`/kitchens/<slug>/menu.collection` and `/kitchens/<slug>/menu.delivery` are
public service surfaces, not named Menus.
The food portal Results component owns search/service controls only;
`menu/utils/food-venue-groups.ts` derives venue cards, service actions and quiet
other-Menu links from the supplied directory records. Its shared result type is
consumed directly by `Cards/FoodVenue.vue`; unused card projections are omitted.
`Detail/ServiceMenu.vue` consumes the existing live reader through
`/api/menus/service/items`. It returns the eligible public source manifests, and
the existing venue clock refreshes their price presentation without refetching
for time alone. The endpoint scans all eligible public published Menu
pages, reuses their public detail payloads and combines interactive items.
`Detail/ServiceMenu.vue` retains route context, read outcomes and the single
service-item acquisition. It composes the Collection selector or Menu-owned
`Service/Catalogue.vue` for read-only Delivery/Table/Room presentation. The
catalogue receives resolved sections and performs no acquisition or commands.
`service-sections.ts` merges section labels and deduplicates catalogue Dish
identity across placements while retaining distinct commercial offers. A current
service takes precedence over a future window; otherwise the next serving window
supplies the shown price. An active scheduled promotion wins over normal terms
for the same serving time, independently of source order. Equal commercial terms
share schedules; differing offers remain available under Other serving times and
prices. Items
Meal deals deduplicate by Kitchen/Promotion identity and follow their applicable
serving weekday. Other items without catalogue identity retain their scoped placement identity. Shared serving
times appear once per section; differing schedules remain beside their items.
Document Menus remain accessible through the default food landing, rather than inventing items
from files. Daily specials remains separate. Collection composes the local selection
and basket slice described above; other service presentations and Order execution
remain unchanged. Configured
service schedules are shown, not a promise of order/timeslot acceptance.
The public Menu entrance defaults to browsing food and drinks, with prominent Collection
and Delivery actions only when its service-filtered reader finds an eligible published public Menu.
Their dedicated URLs retain incoming intent. Public service views switch directly
between Collection and Delivery without an All menus return action; a quiet
Explore other menus link opens `/kitchens/`. The shared `Detail/MenuServices.vue`
owns the two existing service-eligibility reads, independently of item projection.
Eligibility uses the existing explicit collection/delivery options and schedules, with table mapped to
`dine_in` options already filtered by the existing table QR channel policy;
Delivery does not infer address coverage or enable checkout. All four views reuse
one renderer and item projection, without copied Menu records. At your table has
a dedicated `/kitchens/<slug>/table-service/<table>` entrance. Its required table
label is displayed and retained in the path through section browsing and refresh.
It has no public selector button, availability lookup on that page, table picker
or All menus switch. Missing/invalid table links do not open a tableless surface;
table pages declare noindex. The table label is presentation context, not a table
session or order authority. No tables or orders are created or modified.
Room service has a separate `/kitchens/<slug>/room-service/<room>` entrance,
with a required room label in its path. It is absent from the public selector and
performs no public availability lookup there. The route supplies the room number
to the shared presentation; section anchors retain that path, and there is no room
picker or All menus switch. Missing/invalid room links do not open a roomless
surface. Room-specific pages declare noindex. The room label is presentation
context, not proof of a stay or order authority. Existing `room_service`
interactions supply items/times; no room assignment, session or order is created.
Verify `menu-service-view.test.mjs`, public route/discovery checks and consuming
App rendering, including mobile, duplicate items and serving times.

## Kitchen Promotions

Promotions are Kitchen-owned records at `kitchens/<id>/promotions`, separate
from Menu metadata and Daily specials. The Workspace capability is
`/workspace/kitchen/food-and-drink/promotions`, composed by `FoodAndDrink/Promotions/Index.vue`
and its focused Editor. `useKitchenPromotions` reuses settled Kitchen authority,
Menu/child-collection readers and scoped authenticated commands. Menu Settings
links to this capability rather than owning another price editor.

Both forms share name, active/paused status, venue currency and venue-local
weekdays. The content fields distinguish them without a compatibility type:

- Dish offer: `dishes: [{ dishId, price }]`, unchanged from the existing contract.
- Meal deal: `price` and `groups: [{ id, name, choose, dishes: [{ dishId, supplement }] }]`.

Prices and supplements are non-negative ordinary currency amounts with at most
two decimal places. A zero supplement means included; Dish normal prices are
never added automatically or rewritten. Each group has a stable id, a name and
an exact positive number of distinct Dishes to choose. Groups cannot require
more choices than they contain. One promotion references at most 100 distinct
Kitchen Dishes and a meal deal has at most ten groups. Dish references may recur
across different groups. Mixed offer/bundle fields are rejected.

`FoodAndDrink/Promotions/Index.vue` composes the shared collection header and one
Collection or Editor. Collection owns read outcomes; its Row owns one saved
promotion summary and edit action. The strict `useKitchenPromotionsContext`
provider acquires `useKitchenPromotions` once and owns the editing session.
`usePromotionEditor` owns detached draft values, validation and scoped save
completion; Editor composes the common fields, Core weekday multi-select pills,
DishOffer and MealDeal controls. The latter own per-Dish pricing and meal-deal
choice editing. No child acquires another collection or command owner.

An open editor survives same-owner read loading and failures with its draft
intact. Save waits for settled Kitchen, promotion and Dish sources. A confirmed
missing promotion keeps the draft visible but blocks Save; account, Kitchen or
membership/role changes close the session. Command intent still invalidates on
readiness or authority changes. `promotions-workspace.test.mjs` exercises the
mounted parent lifecycle; `promotion-editor.test.mjs` covers detached drafts,
validation and unchanged command payloads. These checks do not write live data.

Regular interactive Menu entries reference exactly one `dish_id` or
`promotion_id` (a meal deal); placements own availability and order, never copied
commercial terms. Section editing shares one provided section state across its
controls and offers Add meal deal alongside Dish controls. The trusted placement
writer rejects mixed references, non-meal Promotions and Daily specials placement.
Publication validates the deal and every referenced choice. The public reader
joins choice names from Kitchen Dishes, omits paused/deleted deals, and exposes
set price, choose counts and included/supplemented choices through the focused
`Menu/Detail/MealDeal.vue` presentation. Browse filters deals by today's venue-local
weekday; service surfaces use their current/next serving weekday and deduplicate
by Promotion id. Standalone Dish offers never reprice a meal deal. Collection selection and the canonical Menu resolver retain meal choices,
supplements, extras and deposits when calculating the submitted pricing snapshot.

The protected writer validates current Kitchen authority, venue currency and
ownership/status of every referenced Dish. Active Dish offers cannot overlap on
the same Dish and weekday. Meal deals can share Dishes with other promotions
because they do not reprice standalone items. Converting forms removes the prior
form's fields in the same Promotion update. No Dish, placement or Order records
are written.

`kitchen/server/promotions/read.ts` loads active Kitchen promotions, excludes meal deals from standalone item
repricing and projects only Dish offers matching IDs present in the resolved Menu. Audit metadata and
unrelated promotional dishes do not enter the public manifest. Daily specials
remains separate. The pure `kitchen/utils/promotions/pricing.ts` matches `dishId`
across Menu placements, applies base/required-variant prices, and retains extras.
Browse resolves today's local price; service surfaces resolve now when open or
the day of their next serving window. Existing Menu publication and service
eligibility still determine where dishes appear; a promotion alone does not
publish an unplaced dish or enable a service. `menu/server/ordering.ts` applies
current promotional terms in the submitting transaction and snapshots prices
separately from Order facts; payment and delivery charges remain separate.

The Sunday pizzas data cutover preserves the prior promotion as audit data and
replaces Menu/section targeting with the explicit existing pizza Dish IDs at
price 11. Retired migration controls and endpoints are not runtime fallbacks.
Verify `kitchen-promotions.test.mjs`, `promotion-editor.test.mjs`,
`menu-pricing.test.mjs`, `menu-meal-deals.test.mjs`, publication/content-command checks, service-view checks,
and the editor/customer presentations. The controlled `food-foundation-journey.test.mjs` carries one fixture record set
through Item creation, Menu placement/publication, Promotions and public Service
projection, asserting unchanged catalogue terms and no Order path access. These
checks do not establish a live customer journey or release readiness.

## Unset Dish prices

Dish normal price is optional while a catalogue item is incomplete. Missing
`price` remains absent through creation and catalogue projection; explicit zero
is a valid free price. Both item creation and Menu add-by-name ask for a normal
price. Menu readiness and trusted publication reject unpriced placements; public
Menu manifests omit them without hiding unrelated items. Existing saved amounts
are not rewritten. Verify `dish-commands.test.mjs`, `dish-reader-internals.test.mjs`,
`dish-ui-scope.test.mjs`, `menu-publication.test.mjs` and `menu-meal-deals.test.mjs`.

## Dish removal boundary

Kitchen Dish deletion checks all saved Menu-section and Promotion references,
including archived placements and paused offers, in the deleting transaction.
The removal control shows the same live usages through the protected Dish usage
reader; it stays disabled while references, loading or failure remain. Deletion
removes only the selected unreferenced Dish. Menu section editing separately
removes one placement without deleting its catalogue record; the item
controls retain no availability toggle; removed Dishes can be added back from
the catalogue. Public Menu reads omit unavailable
Dishes and incomplete meal deals without hiding unrelated entries. Prices and
Order records are not part of this operation. Source and checks are mapped in
`docs/concepts/family-menu.md#safe-dish-removal`.

## Menu archive and focused editing

Kitchen Workspace Create Menu offers three focused methods: PDF or photos,
Menu URL, and Start blank. The parent switches between the native upload,
URL import and manual creation controls. Upload and URL sources receive internal
random identities and open the same FireUX AI review flow; only Start blank asks
for a Menu name immediately. `useMenuSourceUpload` calls the existing Kitchen
upload endpoint directly. There is no format choice or creation queue.
Existing document records retain their viewing, editing and publication paths;
Daily specials and archived records stay separate. The existing children retain
scoped commands and completion guards; the parent only coordinates the visible
workflow. Go QR and provider-tool transport are not used for Menu ingestion.
The saved source route composes the existing processing/review controls with
its acquired source context. No additional record provider or reader is created.
AI processing still requires its existing explicit confirmation; successful
import confirmation links to the created Menu.
New uploads receive a hidden random source identity, never `main-menu` or an
operator-entered public slug. Imported Dish identities are deterministic within
that source's Menu and separate across imports; names never imply catalogue
reuse. Existing dishes are chosen deliberately through the section catalogue
picker. The import price guard remains for already-created import identities.
The review keeps Menu items and confirmation visible, with processing and
technical reports behind disclosures. Items without detected image candidates
need no separate media decision. See `menu-draft-plan.test.mjs` and
`menu-import-media-gate.test.mjs`. Existing-record uploads retain their explicit
target. Extraction preserves a visibly printed title as a suggestion (blank
when absent); the operator confirms the new Menu name in review. The import
commit requires that name, validates its path, and generates the slug only when
creating the Menu. Imports into existing Menus retain their name and stable slug.
See `menu-source-upload.test.mjs`, `menu-import-name.test.mjs` and the
upload/completion checks; these do not
prove a live AI conversion or authorize a new import/price write.
Verify collection search/grouping and the single creation path with
`menu-format-list.test.mjs` alongside document-upload and publication checks.

Regular Menus use Archive as the normal removal action. Settings list linked
services from the existing offering reader. Archive preserves content and links;
restore returns to draft, never directly to published. The collection hides
archived Menus behind an explicit Archived control. Permanent deletion is guarded
by current Kitchen authority and requires an unpublished, empty regular Menu
without any service reference or document attachment. Daily specials remain
separate. Commands are `menu/server/publication/state.ts` and `menu/server/records/delete.ts`; checks
are `kitchen/menu-metadata.test.mjs` and `kitchen/menu-tool-completion.test.mjs`.

Section editing keeps the item list primary and opens one Add items modal with
catalogue, new-Dish and meal-deal choices. It reuses the parent section context;
secondary item actions stay in a labelled vertical three-dot menu. Rows use
dividers and a labelled removal action in the vertical menu; add-back uses the Dish catalogue.
No catalogue prices or Order records are changed by this organisation. The Menu family map owns the source
entrypoints and composition evidence.

## Menu display order

Menu-owned `server/display-order.ts` owns manual append positioning and atomic
adjacent movement. Creation reads the highest saved rank and updates the parent
in the same transaction; client row counts never assign append positions. Items
and sections expose Move up / Move down in vertical action menus, with boundary
and pending states disabled. Daily section moves retain date/Plus scope. No Dish
or Promotion commercial terms are written. See the Menu family map's Display
ordering section and its current tests; multi-request reorder helpers are retired.

Menu section removal uses Archive section in the vertical action menu, with
Restore section available in the archived-section view. Saved placements and
catalogue Dishes remain intact; public manifests omit archived sections. This
reuses the Menu record’s existing full section read and protected status update.
See the Menu family map for current scope tests and publication-origin checks.

Renaming a Menu changes only its display name. Its creation-time slug remains
stable for public and QR links; duplicate display names do not create a slug
collision. See the Menu family map and trusted metadata/name command tests.

Regular Menu publication uses shared structural readiness across its trusted
validator and live Workspace warnings. Empty Menus and unavailable placements
cannot publish; diagnostics identify section and Dish/deal. An already published
Menu that loses its displayable content warns without auto-unpublishing. Document
and Daily publication retain their existing paths. See the Menu family map’s
Publication readiness section for owners and regression checks.

Repeated Menu item Add returns the existing section-scoped Dish/meal-deal
placement. Archived matches restore in place; concurrent additions serialize
through the existing section transaction. Definitions, prices and other sections
remain independent. The Menu family map links the command and regression checks.

Public `/menus` is the Collection/Delivery portal, collating eligible menus per
venue with matching schedules and a quiet link to other menus. Full venue service
discovery belongs to Place and `/kitchens`, not this food portal.

Menu and service terms are defined in [the service glossary](../../../../../docs/concepts/menu-service-glossary.md). Keep fulfilment, ordering channel and timing distinct; vocabulary alignment does not change stored interaction types.

Kitchen navigation groups Items, Menus, Promotions and Services beneath the
Food & drink overview, separate from Prep & Production (Prep plan, Recipes, Ingredients, Stations, Batches).
Services is the visible setup name at `/workspace/kitchen/food-and-drink/services`; existing
Offering records and commands remain its backing configuration. Named food
experiences such as Picnic are not new service types. Core's shared Workspace
sidebar cycles compact, expanded and expand-all using its existing navigation
projection; active-route resolution and command authority remain unchanged.

## Kitchen Workspace selection

Kitchen Workspace remembers the last selected Kitchen through Core's existing
App/family cookie. An authorised explicit link takes priority, followed by a valid
remembered selection, then the first available Kitchen once access and target
reads have settled. There is no separate Primary Kitchen preference, Home control
or account mutation. Selection grants no access. Verify Core selection tests and
Kitchen's `workspace-readiness.test.mjs`.

Kitchen Team uses Core `WorkspaceTeamEditor`'s default people list and read-state
presentation. Role configuration and invitation controls remain Kitchen-owned;
its title comes from existing Team state without another identity acquisition.
The Workspace–Entity family map owns the three-domain composition boundary.

## Kitchen component organisation

Kitchen component groups express stable responsibilities: `FoodAndDrink` owns
Items, Menus, Promotions and Services management; `PrepAndProduction` owns
Recipes, Ingredients, Stations and PrepItems. Group Index/AI and shared summary
presentation sit at the group root; each food child owns its Overview surface.
Other capabilities, including Finance, Identity and Team, are direct Kitchen
component folders. `Workspace` retains Home, selection, navigation, overview,
AI, research, tools and diagnostics. This organisation does not move Menu or
Ingredient-owned runtime components, domain readers, commands or records.
Nuxt registration in `components-config.ts` derives `KitchenFoodAndDrink*`,
`KitchenPrepAndProduction*` and direct `Kitchen*` names from those paths; only
Workspace mechanics retain `WorkspaceKitchen*`. Routes stay unchanged.
Verify registration and retired-name absence with `kitchen-component-groups.test.mjs`,
then the source-owned capability tests and a consuming App's generated components.

## Services configuration

Services presents seven Misebox-provided options from `offering-options.ts`: Collection,
Delivery, Pre-order, Table service, QR table ordering, Room service and Kiosk.
Operators switch each saved setup on or off; enabled setups expose inline
configuration. Saved records keep their menus, hours and service-specific
customer entrances. There is no generic Add service entrance.

Each provided service has one saved configuration. Menus are selected inside it;
Breakfast and Lunch are menu choices rather than separate service records. The
configure command prevents a second setup of the same type and table entry channel.
Table service and QR table ordering remain separate. Discovery of other food
uses eligible published Menu names and direct Menu links, rather than service
record names or duplicated Breakfast/Lunch configurations. Existing named-entry
fields still read by other projections are outside the current creation surface.

Operator-facing setup uses Service throughout creation, editing and availability.
Offering and interaction/channel remain internal implementation terms, not
alternative operator labels for the service record.

Services menu selection and readiness share `kitchen/utils/service-menus.ts` across
the inline setup, the service editor and trusted command validation. Only public regular
interactive, non-archived menus supply service items; absent audience retains the
public default. Private-link and protected-group menus are not service choices.
Incompatible saved selections remain removable with visible warnings and cannot
satisfy readiness. Removal-only configuration updates permit incremental cleanup
without admitting new incompatible selections. Draft menus can be selected,
but public eligibility requires a selected published eligible menu and serving hours.
Unavailable existing selections remain labelled so operators can remove them.
Kiosk cleanup permits strict removals within one mode even when the union of
both mode selections stays unchanged; transfers or additions remain validated.
The Food & drink summary flags a missing Menu/Service hour intersection from
deterministic schedule data, independently of AI.
Daily specials and document menus keep their own entrances. No catalogue prices
or Order records are changed by these checks.

The Services composition publishes `kitchen/utils/service-overview.ts` through
Core's `useWorkspacePageState` for the header Copy page JSON action. The existing
development-only FireDiagnosticsDebugPanel consumes the same safe projection: service
types, configuration IDs, menus, hours, availability, readiness and read outcomes.
It excludes notification recipients, credentials, payment details and Order data.

Services opens with compact selected-Menu chips and effective hours summaries.
Menus composes Core `FireMultiSelect` for all choices as toggle badges; selected badges are highlighted and
multiple selections are allowed. There is no dropdown or separate edit step.
ServiceHours and Timing own their local editor disclosures; opening or closing
an editor never writes settings. Edits retain automatic saving.
Effective Kitchen hours reuse the acquired Kitchen and Place through
`resolveKitchenOperationHours`; the summary does not add another reader or copy
inherited times into service records. `serviceHoursSummary` groups equal ranges
without implying service on unselected days.

Services configuration is inline. `FoodAndDrink/Services/Index.vue` provides one
`useKitchenServicesContext`, then composes Status, Title and a Service per fixed
option. The shared context acquires the existing service/menu sources once and
publishes the safe page JSON. It retains the last settled configuration only for
presentation through read loading/errors; command availability always uses current
source authority. Account, Kitchen, membership/role changes or settled access loss
dispose the retained presentation and local editors.

Each Service provides its own `useKitchenServiceEditor`, which owns
`useServiceSetup`; Setup consumes that local editor and composes Menus,
ServiceHours, and named Kiosk or PreOrder additions. The focused controls retain
menu selection, hours ranges and interaction policy. There is no repeated
Workspace-state prop chain. Service headings, On/Off and save feedback belong to
the service section; local commands keep existing scoped automatic saving.

Unfinished hours remain local through refresh/error. Incomplete ranges never
write; queued valid hours wait for current write readiness before resuming.
The local range editor does not hydrate over an incomplete range. Timers and
obsolete command completion are scoped/disposed with the service; current
responses retain their saved record identity until the live read catches up.
The service interaction projection is explicitly ordering-only, separate from
Browse. There is no Configure or Save/Discard lifecycle. Verify
`services-workspace.test.mjs`, `kitchen/service-setup.test.mjs`,
`kitchen/service-hours-editor.test.mjs` and inline/navigation/overview checks.

All seven services may be switched on before configuration is complete. Off hides
configuration and retains its values. The existing protected configure command
accepts sparse changes, merges untouched fields from the latest transaction
record, and preserves scheduling/customer/payment policy. Missing menus or hours
do not grant public service eligibility. Table service and QR table ordering use separate records. Each record owns its
menus, hours and On/Off state. Its one selected `table_channels` flag identifies
which service it belongs to and stays selected while the service is Off. The
configure command rejects a record belonging to a different service; there is no
shared-settings path or implicit table-channel fallback. Kiosk has one master switch and always supports both Eat in and Takeaway;
there are no mode activation switches. Each mode owns its `menu_ids`; the service's root `menu_ids` is the
command-maintained union for menu references and discovery. Serving hours remain
shared. Menu policy projections filter each mode by its own selected menus.

The inline service sections expose only On/Off, menus and serving hours
for Collection, Delivery, Table service, QR table ordering and Room service.
Pre-order retains advance notice; Kiosk retains mode-specific menus for both Eat in and Takeaway. Table-count, delivery-area, customer-link and QR/room
link editors are not composed into Services. Existing stored settings, public
entrances and owning commands are unchanged by this presentation boundary.
Daily specials and document menus remain separate.

Service setup starts with the smallest composed working flow: activation, menu
selection and serving hours. Expose further policy only for a demonstrated
operator need after that pipeline works. The Timing control supplies Pre-order advance notice only; it does not expose
food preparation time, scheduling horizons or slot intervals.
Sparse commands preserve stored scheduling policy when these controls are absent.

The basic Services controls are menus and serving hours, with advance notice for
Pre-order. Food preparation time belongs to food/production rather than a
Collection or Delivery setting. Pause, customer messages,
contact requirements and advanced scheduling are not exposed here. Existing
stored policy remains preserved by sparse updates. Kiosk menu selection does not
change normal Dish prices or Orders.

`Setup/Hours.vue` owns the local range draft and composes `Hours/Range.vue` with
Core `FireMultiSelect` day pills and softly rounded native time inputs. Selected days
remain visible without opening a dropdown; each button exposes its full weekday
label and pressed state. It emits the existing structured
weekday/time configuration only when all ranges are complete; hydration never
writes. Multiple ranges preserve split and overnight service. `useServiceSetup`
coalesces and scopes these updates through the protected configure command,
without a free-text formatting/parsing step. Source-owned checks are
`service-hours-editor.test.mjs` and `service-setup.test.mjs`.

Service hours follow the Place → Kitchen → Service → Menu hierarchy. `Setup/ServiceHours.vue`
asks “Same as Kitchen service hours?”; Yes hides the range editor, while No reveals
it. `hours_source` defaults to `kitchen`; selecting `custom` can persist before
ranges exist. Returning to Kitchen hours deletes the custom override instead of
copying parent ranges. `useServiceSetup` owns these automatic saves. The configure
command checks custom ranges against current Kitchen hours using its transactional
Kitchen/Place authority reads. `service-hours.ts` owns inheritance and weekly range
containment, including breaks and overnight ranges. Public Menu readers pass their
already-read Kitchen/Place context to the Offering reader for effective hours; the
Workspace collection retains the stored override and choice. Order execution is
outside this configuration/UI slice.

Kitchen and Service custom-hour writes reject ranges outside their current parent;
Menu writes reject ranges outside effective Kitchen hours. A Menu reused by
several services is intersected with each service separately, so a shorter service
does not alter the Menu's own schedule. Parent narrowing constrains effective
availability immediately and Workspace editors show saved schedule conflicts.
`utils/weekday-time-constraints.ts` owns containment and intersection, including
breaks, overnight and week boundaries. `menu/utils/menu-hours.ts` applies Menu
windows to public index and payload projections. Menu Settings composes the
focused `Detail/Hours.vue` automatic editor; the Service hours editor previews
each selected Menu's effective availability and links to its existing record.
No extra acquisition or new mutation owner is introduced. Verify with
`menu-hours.test.mjs`, `kitchen-operation-hours.test.mjs`,
`menu-workspace-commands.test.mjs` and the Service hours tests.

Kitchen Workspace Ingredients uses `useKitchenWorkspaceIngredients` for its
collection. A single Kitchen–Ingredient link is read by the domain-owned
`kitchen/composables/ingredients/useKitchenIngredientDetail`, with explicit
Kitchen and Ingredient IDs; the page supplies Workspace selection and route ID.

Kitchen shared capability composition uses zero-ID-argument
`useKitchenWorkspaceIdentity()`, `useKitchenWorkspaceTeam()` and
`useKitchenWorkspaceCalendar()`. Explicit setup targets use
`useKitchenIdentity(kitchenId)`, which acquires Kitchen and linked Place together.
Workspace Identity and Home reuse the selected owner’s records through
`useKitchenIdentityProjection`; this projection acquires no reads or commands.
Home does not acquire Identity management or publish Identity page context.
The explicit-ID reader does not choose or reconcile Workspace selection. Core owns shared management/read state and Calendar date
state; Kitchen retains fields, roster authority, commands and event integration.

### Retired manual checks

The Workspace migration checks listed as removed in
`docs/ai/gpt-context.md` are no longer available. References to those filenames
in this document describe historical verification, not current coverage.

Kitchen Home owns its chooser and lightweight summaries in
`useKitchenWorkspaceHome`. Creation availability belongs to `useKitchenCreate`,
using shared creation policy and Kitchen's domain capacity table. Domain
Offerings and Fulfilment require explicit Kitchen IDs. Dish, Recipe, Ingredient
and Supplier detail readers take explicit Kitchen and record IDs; Workspace
pages supply route/selection and own navigation. Menu sources have their own
plural Workspace collection owner; Menu Section receives explicit parent state.
Stations reads no longer create a Pass station automatically: the empty view
provides an explicit Add Pass station command. Table collection naming reflects
its actual Table Tab records.

Kitchen uses one shared `useKitchenWorkspace` instance for its available
records, selection and selected-record read. Collection presentation consumes
`collectionOutcome`; capability presentation consumes selected `outcome`. Common
Home, Identity, Team and Calendar adapters live directly in the Workspace
composable folder. Core owns App/request isolation and subscriber disposal.
