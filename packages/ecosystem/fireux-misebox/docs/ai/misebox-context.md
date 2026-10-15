# Misebox GPT Context

Updated: 2026-10-13
Ref: 411ea9ffe
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
  `{ data, id, outcome, crud }`. `useKitchenWorkspaceIndex` owns the collection,
  its read outcome, and selection. Neither data composable owns page JSON; the domain Index UI owns its
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
`app/app.config.ts`. `/kitchens` and Kitchen groups on `/menus` share
`KitchenCollectionList`; records without a Kitchen remain separately displayed.
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
cards keep their food-first `/kitchens/<slug>/menus` destination.

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

Orders composes `Workspace/Offerings/Controls.vue` over the existing
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
canonical item/option/price resolver. Pricing is snapshotted separately from
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
this configuration boundary. Current opening-time and slot evaluation remain deferred. Immutable historical Sales own their
pricing snapshot through `kitchen/models/sale.model.ts` and
`kitchen/server/finance/sale-pricing.ts`, independently of an Order model.
The small Order uses UBL vocabulary but is not a conformant UBL exchange document.
The current source and focused tests establish this boundary; browser and full
customer journey evidence must be rebuilt with the corresponding behaviours.

Current group prefixes and destinations (relative to `/workspace/kitchen`):

| Sidebar group      | Route prefix      | Pages                                                              |
| ------------------ | ----------------- | ------------------------------------------------------------------ |
| Orders             | `/orders`         | index, board (local views and filters), offerings, fulfilment      |
| Prep & Production  | `/prep`           | index, plan, stations, batches                                     |
| Menus & Recipes    | `/menus`, `/food` | Menus at `/menus`; dishes, recipes and ingredients under `/food`   |
| Stock & Purchasing | `/stock`          | index, inventory, purchasing, receiving, suppliers, waste          |
| Food Safety        | `/food-safety`    | index, checks, records, actions, procedures                        |
| Team               | `/team`           | index, people; Responsibilities remains a section anchor in people |
| Reports            | `/reports`        | index, finance, performance, costs, waste-report                   |
| Identity           | `/identity`       | index, profile, operating-hours, appearance                        |
| Settings           | `/settings`       | index summary, kiosks, integrations, access                        |
| Developer          | `/developer`      | index, test; dev, training and preview remain hidden               |

Overview remains a standalone entry. Kitchen's Menus & Recipes group has a useful
index at `/workspace/kitchen/menus-recipes`. Its route declares `nav.groupIndex`:
the Menus & Recipes group label navigates to that index and expands its children,
with a separate chevron for collapsing. There is no Overview child link. `Workspace/Overview/MenusRecipes.vue` composes the capability entrances from
the same route navigation metadata as the sidebar; Drinks remains a contextual
link resolved from its hidden route metadata. Existing capability destinations,
including `/workspace/kitchen/menus`, are unchanged. This is Kitchen-owned
navigation composition, not a Food domain or a shared Core group framework.
The index is a lightweight tool directory. It lists available, handler-backed tools
from the existing Kitchen capability tool directory and routes operators to the
owning capability for context and authority checks. It starts no summary readers,
shows no operational counts or readiness, and writes no selection or records.
Four panels retain their domain identity icons. Each tool group begins with a
magnifying-glass Browse link; Food & drinks has separate Browse Food and Browse
Drinks groups. These five Browse entrances reuse existing collection destinations. Create links
open supported creation flows; Recipe Create opens the existing collection form
with a consumed `create=1` query intent. Update and Delete need a selected record
and are not collection shortcuts on this index. Menu Delete is not advertised:
its dormant component has no supported connected lifecycle/dependency policy.
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
Kitchen Identity uses its group label to open the index at
`/workspace/kitchen/identity` and expand Venue profile, Operating hours and
Appearance. There is no separate Overview child. The chevron independently
expands or collapses the group without navigating. The same index-link contract
applies to Orders, Prep & Production, Menus & Recipes, Food Safety and Team.
Settings also has a real index summary with links derived from its route-owned
children: Kiosks, Integrations and Access. Its label opens that index and expands
the group. Index destinations are not repeated as children; groups without a
working index remain expand-only. All current Kitchen sidebar groups now have a
working index, including Stock & Purchasing, Reports and Developer. Orders,
Prep & Production, Food Safety and Team use a small domain-owned GroupIndex
presentation consuming the same route metadata as the sidebar; their existing
working screens remain children at `/orders/board`, `/prep/plan`,
`/food-safety/checks` and `/team/people`. Indexes do not initialize those working
controllers or invent configuration stores. Existing small controls remain with
their owning capability; larger setup stays in child pages. The separate Settings Access component retains
its explicit unconnected-controls notice and existing authority boundary.
Menu records, imports and research live under `/menus`, an explicit exception to
the sidebar group prefix. Public Menu URLs and HTTP command
endpoints are unchanged. `/settings/kiosks` composes device management and links to
`/stations`. Calendar remains a contextual doorway; record details, creation,
research and parked routes are not primary sidebar entries. Research routes follow
the capability they describe. There are no retired-route aliases or fallback readers.

Orders retains its configuration entrances and a draft-only board. The former lifecycle views and operational command surfaces have been deleted.

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

Kitchen Workspace has one Identity index at `/workspace/kitchen/identity`,
which composes Kitchen listing controls and links sourced from the children's
route metadata. Identity is the clickable sidebar group index, with Venue profile,
Operating hours and Appearance underneath. The index may offer a few direct
controls; substantial configuration belongs in purposeful child pages.
`/workspace/kitchen/identity/profile` owns the five focused venue edit sections;
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
The Operating hours page also composes `Workspace/OperatingHours/Menus.vue`,
using the live Menu collection's published subset. Each named Menu panel lists
only services explicitly containing its stable ID, with Enabled/Paused/Off state,
effective hours and their source. Shared service membership is labelled, and
weekly times remain visible directly even for Off or Paused services. The state
badge describes service availability independently of its configured schedule.
Shared service
settings links edit the existing service owner. Custom service schedules are not
intersected with venue or Kitchen hours. Empty service membership and Menu read
failures remain distinct; no Menu-hours field or publication-derived service
membership is introduced. Pre-order schedules describe dining times, not request
intake; diagnostic customer funnels remain labelled unfinished.
The Operating hours composition places venue and Kitchen panels side by side
when space permits and published Menu panels in an independent-height grid.
It uses the shared weekly presentation's compact spacing without changing day
membership or hiding schedules. Routine timezone controls and labels are omitted
here; the saved venue timezone remains in use, with missing/conflicting schedule
timezones reported explicitly. Manual Place setup retains its timezone editor.
This presentation does not establish Google verification or change timezone data.
Identity pages expose one client-only, development-only bottom `DiagnosticsDebugPanel`
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
  Core User or mutating inconsistent records.
- Menus and Orders remain their own records beneath their proved owner. Every
  newly created Kitchen atomically receives ordinary draft `food` and `drinks`
  Menus. There is no primary/specials Menu configuration on Kitchen.
  Their parent-scoped ids may repeat across Kitchens; public root Menu
  projections remain separate and use Kitchen-qualified ids when these defaults
  are published.
- Operations is a Workspace grouping, never a generic stored field.
- Menus proves Collection / Focus: its collection header and direct record links
  lead to the canonical Menu destination, whose perspectives use local state.
  Creation stays with the collection; editing and publication stay with the record.
  Contextual AI follows the collection in `Workspace/Menus/Index.vue`.
- Kitchen owns the shared numbered-table count at `tables.count`. Offerings
  exposes its form above the six interaction choices through `Workspace/Tables/Write`;
  the trusted Kitchen update command validates 0–500. Seating, tabs and billing
  remain separate Front-of-House responsibilities.
- App-support and legacy Kitchen-root operational maps are migration preimages,
  not authority.

Read current Kitchen and Place models plus
`docs/concepts/family-workspace-entity.md`,
`docs/concepts/place-kitchen-media.md`, `docs/concepts/menu-ordering.md`, and
the current Kitchen source and relevant source-owned tests.

## Kitchen and Menu read contracts

Stored contracts remain `kitchen.model.ts`, `menu.model.ts`, and
`kitchen-menu.model.ts` beneath their domain owners. KitchenMenu owns catalogue metadata, publication and an optional attached document.
Kitchen owns named Offerings and its palette; Menu readers derive those inputs
from Kitchen and currency from the linked same-id Place.
`menu/models/menu-directory.response.ts` owns the public Menu directory entries,
Kitchen presentation and cursor. `kitchen/models/kitchen-detail.response.ts`
owns the public detail response. Associated Workspace choices use the live
`useKitchenWorkspaceKitchens` collection; individual routes use `useKitchenRead`
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

KitchenMenu publication reuses the root doorway for the same Kitchen id and Menu
id in the owning database, even when another App performs the edit. The original
`source.app_id` is retained; the current editor App must not create a second
doorway. The named publication/sync operation archives redundant projections
without deleting their records. See `menu/server/directory/root-entry.ts` and
`src/test/menu-root-publication.test.mjs` in Kitchens.

Menu metadata editing and renaming use `useMenuUpdate`; publish, unpublish and
archive actions use `menu/composables/publication/useMenuPublication`. Kitchen
Workspace composes these directly and retains its existing UI access checks.
Server content validation is owned by `menu/server/publication/validation.ts`;
the browser submits commands without a second Firestore validation pass.
`publication/publish.ts` publishes, while `publication/withdraw.ts` unpublishes
or archives. Each checks access and reads the current Menu inside the guarded
transaction that commits its status, root doorway and duplicate archival together.
Content validation also reads within that transaction. Failed commits change
neither record; transaction retries reread authority and content. Repeating the
same status command reuses the doorway and original status-change audit stamp.
Metadata updates reject `status`; archive uses its trusted endpoint.

`directory/root-entry.ts` maintains projections within its caller's transaction.
Metadata/rename in `menu/server/records/update.ts` writes the scoped Menu and root
projection in the same transaction through that helper. `directory/sync.ts`
rereads current Menu state for its remaining callers, including draft imports;
that separate import/sync workflow must not be described as atomic. Existing public route ids,
source App attribution and duplicate archival policy remain unchanged.
`src/test/menu-publication.test.mjs`, `menu-root-publication.test.mjs`,
`menu-publication-client.test.mjs` and `menu-workspace-commands.test.mjs` cover the
commands, rollback, replay and client boundaries with injected database operations.

Public Menu directory/detail, customer Order status/history, Team projections
and the other mutable Misebox server readers consume Core's live read transport.
The Main App's production `public.fireux.liveReadEndpoint` points directly to
its existing Cloud Function because Firebase Hosting buffers streaming rewrites.
Its `server/middleware/live-read-cors.ts` permits only the configured Misebox
website origins on that transport route; projection bearer/capability authority
is unchanged and cross-origin cookies are not sent. Local development keeps the
same-origin endpoint. Verify production with a first streamed frame and a hydrated
browser page, not just a successful JSON request or server-rendered HTML.
The same API returns initial JSON for SSR and an event stream for live clients;
its domain projection and authorization are rerun when their Firestore
query/document dependencies change. This includes related KitchenMenus,
Kitchens, Places and identity records. Unpublishing a Menu or its source removes
its doorway from an open directory; every loaded page retains live membership.
There is no separate Menu-only transport or periodic Order polling. Local
basket/editor drafts remain separate from live stored records. Verify the
Menu directory/projection tests with Core's live read lifecycle tests.

The public `/menus` route is a customer discovery surface, separate from Kitchen
Workspace management. It presents one Menu collection, grouping only records
with the same explicit App/Kitchen source relationship. Document menus remain
first-class results without requiring a Kitchen. Origin kinds are not customer
categories; never infer venue relationships from matching names.

`menu/models/menu-directory.response.ts` owns the bounded public contract.
The server resolves optional Kitchen enrichment. Menus have no food/drink
classification or special deletion status. Food and Drinks are ordinary default
Menu names; content classification belongs to items. Do not infer it from Menu
names or ids. Search uses published names, descriptions and venue names;
interaction filters use the projected supported contexts, not a promise of current
opening or checkout availability. Filters apply to loaded pages, with an explicit
load-more notice. A source-linked public doorway is omitted if its referenced
KitchenMenu is missing or not published.

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
KitchenMenu management contract and existing public Menu URLs.

Kitchen-owned Menu presentation uses the Kitchen's `theme.palette`, with the
application default when no palette has been configured. Menus store no palette
or kiosk skin. Standalone Menu documents retain their own presentation authority.
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
  and exposed by `useKitchenWorkspace`: Free and Premium allow one associated
  Kitchen; Business has no subscription count limit. Kitchen’s separate
  50-id access ceiling remains enforced by its domain access helper. Both new Kitchen creation and
  adding an existing Kitchen use this policy in trusted onboarding transactions.
  Existing associations remain readable/manageable over allowance; reopening one
  does not count again. UI creation uses the actual AppUser subscription and
  hides unavailable Create controls. Preview tiers do not grant capacity.
  Kitchen entry, selector, and sidebar use `useKitchenWorkspaceIndex` to show
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

Kitchen Team owns its bounded dialog-intent endpoint under
`fireux-kitchens/src/runtime/kitchen/server/team/intent.ts`. It prepares the
existing Team dialogs without performing membership mutations. This consumer
opts into Codex with a lower model in development through the existing FireUX
AI transport; production retains the configured provider. Other Kitchen AI
consumers retain their existing integration boundaries.
Kitchen Team presents basic person CRUD, workspace role labels and a separate
copy-invitation action. Core’s shared role catalogue includes fixed Dev and
Operator labels alongside workspace-defined roles. Assigning these labels does
not change workspace access. Core `models/workspace-team-member.model.ts` defines the exact
three-field stored profile: name, user_id and role_ids. Legacy access,
job-title and dossier fields are retired. AI prepares basic person controls and
directs role assignment to the selected-person panel.
`useKitchenTeam` is the page command entrypoint for create, update,
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
  The public order board is a simplified preview: it skips customer confirmation
  and payment and changes sample tickets only in memory. Its table presentation
  reads optional configuration from the canonical Kitchen root; a Kitchen with
  no tables must not block the Menu or order preview. Ingredient presentation
  still uses the supported public canonical reader, so this is not an offline
  catalogue. The App-owned product-demo-foundations.test.mjs protects the table
  boundary; source-owned service tests and controlled journeys prove real orders.
  The dedicated default-kiosk skin preview reads a supported public Menu and
  Place rather than the fictional catalogue. Its typed counter-preview configs
  feed the Showcase memory-only order slot; they are neither stored Offerings
  nor write authority. `useDefaultKioskSkinPreview.ts` and its App-owned test
  protect that adapter; browser checks verify the shared kiosk consumer.
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
operator Offering reads while keeping Offering mutations and raw Sellable terms
server-owned. Its six-App authority must pass the required
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

Menu records use `/workspace/kitchen/menus/[menuSlug]` with local Items & prices
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

## Menu operator entitlements

Free permits two default Menus, Food and Drinks. Plus operators may rename
Menus and have the existing unlimited Menu allowance. Professional and Business
both map to Plus features; Business additionally permits multiple Kitchens.
Name editing requires the acting User's Plus entitlement and Kitchen write
access, not a Kitchen subscription or another Team member's entitlement.
Downgrade preserves all existing Menus and saved names; future creation and
renaming follow the actor's current entitlement. Basic Kitchen colours remain
Free. The name editor and trusted rename command enforce this gate; creation
restricts Free names to Food and Drinks. Kitchen-owned Menus store an explicit
unique sibling slug. New records use generated document IDs; workspace and public
links use the slug while mutations and ordering references use the stable ID.
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
ID, operator-chosen name, enabled state, eligible `menu_ids`, an explicit serving
schedule and a list of interactions. Breakfast is an Offering;
browse, pre-order, collection or delivery are interactions that offering may allow.
Multiple offerings can enable the same interaction without sharing identity or hours.
`kitchen/models/ordering.model.ts` owns the ordering interaction policies: notice,
contact, pause, notifications and fulfilment instructions/deposit.

Place owns venue opening information. Kitchen owns its operating schedule,
which may follow Place hours. A named offering owns when its food can be received;
its hours do not inherit or intersect with Place, Kitchen or Menu hours at runtime.
Pre-order requests can arrive outside future serving hours. Menu owns catalogue content and publication. Daily Menus can date their
content selections; serving hours and ordering authority remain Offering-owned.
Ordinary published Menu browsing remains available independently of offerings.
An enabled offering can also provide a named browse doorway. Ordering requires an
enabled offering and interaction, published Menu membership and configured hours;
paused interactions and missing offering identities fail closed on the server.

The Operating hours page composes the venue editor, Kitchen operating schedule
and named offering schedules. `Workspace/Offerings` configures each offering at
`/workspace/kitchen/offerings/<offeringId>`. Its name, master switch, Menus
and serving hours are separate from the selected interaction's settings.
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

Workspace `Offerings` exposes saved offerings, including disabled drafts, and a
New offering action using the existing trusted create command. Creation starts
off and opens the named offering editor; it does not repurpose an existing
offering or enable ordering. The option cards expose Collection, Delivery,
Pre-order, Table service, QR Tables and Kiosk over existing named
`kitchens/{kitchenId}/offerings/{offeringId}` records.
Table service and QR Tables share a `dine_in` interaction and its menus/hours;
its explicit `table_channels.staff_pos` and `table_channels.table_qr` switches
are independent. Existing interactions without this field retain both established
channels; new configurations enable only the selected channel. The configuration
command merges the selected switch against current stored state. Menu projections
and order submission respect the channel switches, with staff authorization still
required for staff orders. This does not complete the separate Staff POS surface.
Website ordering/testing and the Delivery & payment doorway belong in Integrations,
not the Offerings card grid. Allowed-website reads use the exact settled
account/App/membership/access/Kitchen lifetime and suppress obsolete read
continuations. Its editor keeps a same-owner dirty draft through live updates
and clears on owner changes; save forwards local intent before credentials
finish. Unconfigured choices are off. Opening a
switch edits a local draft; the trusted `offerings/configure` command validates
and commits menus, explicit hours and interaction settings in one transaction.
Existing identities and unrelated interactions are preserved. Shared menu/hour
changes are identified in the editor, and activating other saved interactions
through an off offering requires explicit acknowledgement. Advanced named-offering
editors remain available by their existing routes. The Offerings page has no
advanced-offerings disclosure; shared table count is an always-visible form
above its offering cards. Interaction settings
compose timing, customer-details,
availability and notification controls. The offering master switch and interaction
switches remain separate from temporary interaction pause. Pre-order notice is edited in hours,
while other offerings retain minutes. The Payment summary reads Kitchen fulfilment
and links to its existing editor; optional WhatsApp controls appear last.
`Fulfilment` uses the existing
`kitchens/{id}/fulfilment/policy` live reader and trusted command for delivery zones
and payment methods. Its delivery editor lives under Kitchen composables and
its pure zone helpers under Kitchen utilities. `Workspace/Integrations` at
`/workspace/kitchen/settings/integrations` owns Website ordering: button preview,
copyable code and the direct customer link. The former Channels and Settings
index entrances redirect there. Website code targets the Kitchen's stable
`/kitchens/:slug/order` entry, or `/order` in a tenant App. This chooser consumes
the live published Menu directory and its safe offering-option projection, excludes
paused and unsupported interactions, and carries the exact selected offering id
to the existing per-Menu checkout. It does not combine several Menus into one
basket. Ordinary offering/menu edits do not require a replacement snippet.
Kitchen-owned `components/Ordering/Setup.vue` is the shared website-ordering
workflow in the App setup entrance and Workspace Integrations. It consumes live
Kitchen/Menu/Offering records through the existing identity and offering readers.
An explicit Kitchen id uses current membership-bound access without initializing
Workspace selection. Payment summaries consume that same explicit Kitchen through
`useKitchenFulfilment`; the existing Workspace reader remains the default for
Workspace-only consumers. Payment-edit actions in standalone setup use its
explicit authorized handoff rather than another saved Workspace selection.
The same `Offerings/Setup.vue` form and configure command
edit saved collection, delivery and pre-order configuration; cancellation keeps
unsaved drafts local. Credential waits snapshot input and reject obsolete
account, Kitchen, App, membership, access and disposal epochs. The controller
owner scope excludes child Menu/Offering refresh and busy state. Actual forms
forward their draft/cancellation predicate to the command before dispatch;
committed results remain truthful after a surface changes. The setup editor
retains its selected Offering target independently of masked live records, so a
deleted Offering cannot become a new configuration. Same-owner live refresh
preserves local drafts, and owner changes close them. Creation keeps a direct
editor recovery action if saving succeeds but navigation fails.

`offeringSetupSummary` remains bounded configuration guidance; offering enabled
state is shown separately, and operational proof remains Unverified because no
persisted proof source is consumed. No new progress flags or copied setup records
exist. Payment, installation and Incoming use their existing Workspace editors:
only an explicit authorized handoff selects the Kitchen and navigates. Menu and
offering configuration alone never produces an all-set delivery claim. Failed or
pending reads are not empty results. Verify the shared entrances, local selection,
scoped save and cancellation in `src/test/kitchen/ordering-setup.test.mjs`.

The public selector is `?offering=<id>`; Menu payloads and directories use `offerings`, `offering_options`, `selectedOfferingId` and `offering_hours`. Protected Offering commands accept `offeringId` and return `offering`; WhatsApp tests return `kitchen_offering_id`. Kiosk and customer Order/receipt/recovery references use the same `kitchen_offering_id`/`kitchen_offering_name` fields. Existing stored Orders, kiosk records and browser recovery made with retired reference names require an audited conversion or explicit reset before reuse. Source renaming alone does not perform that conversion, and no runtime alias infers an Offering from an order-numbering period.

Customer-facing services use `/services` for the catalogue, `/services/ordering`
for the ordering introduction, and `/services/ordering/setup` for setup. These
App-owned destinations compose existing capabilities; they are not a service-layer
registry. Ongoing management remains in Workspace. `/mvp` redirects to setup.

Main Misebox `/services/ordering/setup` reuses the public `landing` layout and its account controls.
It is an App-owned find/create entrance without the Workspace
shell. Signed-in users first see their live membership-bound Kitchens through
`useKitchenWorkspaceKitchens`; local choice does not change Workspace selection.
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
management completion initializes missing Food/Drinks draft defaults and Pass
for new or existing roots; existing records, including archived/customized
ones, are preserved. Guest creation/adoption and explicit shell provisioning
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
dedicated detail route reuse `Workspace/Ingredients/Preview.vue`; global identity
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

All Menu collection rows open `/workspace/kitchen/menus/<slug>`. The
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
navbar's right slot. `Workspace/CollectionHeader.vue` supplies their common
Kitchen breadcrumb, title and action layout without owning reads or permissions.
Menu AI composition lives in the Menu capability rather than its route adapter.
CollectionToolbar supplies the shared search/count row and optional controls and
filters. Menus and Recipes use CollectionRow with domain-owned summaries; their
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

Kitchen Workspace composes direct capability directories under
`kitchen/components/Workspace`. `Home` owns entry controls and Kitchen creation;
`Navigation/Food.vue` owns the Dishes/Recipes navigation. Shared Kitchen AI and
research helpers live in `AI` and `Research`, with the consumed domain tool
launcher at `Tools.vue`. No Operations, Capabilities, Crud or Sundries container
owns Kitchen capability presentation. Menu, ordering and command ownership are
unchanged. App-specific entry presentation lives under
`misebox-app/app/components/Workspace/Kitchen/Home` with distinct generated names.
Food and drink catalogue routes share `Workspace/Dishes/Read.vue` and its
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
validated intent; the server remains authoritative. `Workspace/Dishes/Spec.vue` reads linked records live and edits the
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
invalid document references are rejected before normalization. Workspace Recipes
Form and Preparation
compose the existing Kitchen Prep Item create command and live collection reader;
notes are secondary to quantities and the cooking method. New prep definitions
can be created while editing a recipe and persist independently if that recipe
edit is cancelled. Daily prep scheduling and batch execution remain separate,
unconnected surfaces.

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

## Shared sellable adoption

Kitchen owns `kitchens/{kitchenId}/sellables/{sellableId}` and the trusted
`bind.ts` and `update-terms.ts` owners under `kitchen/server/sellables`.
Both detach authored input before actor waits and retain that intent across
transaction retries. `kitchen/utils/sellable.ts` owns pure base-terms validation
for the record reader and terms writer. `KitchenSellable` groups one Dish's
flat stable variants and base commercial terms; it is independent of Menu
placement and entry surface. Optional `form.volume`, `form.container` and
`form.source` describe the received thing. Volume is not order quantity and
is never inferred from legacy quantity/unit or labels. An ordinary item gets
one implicit default variant without a customer picker. Structured forms do
not establish stock, resource availability or fulfilment eligibility.

Menu Items explicitly opt in through Use shared prices. Adoption validates
current App membership, membership-bound Kitchen authority and exact placement,
Dish and currency, then creates or explicitly reuses a same-Dish sellable and
binds `sellable_id` transactionally. Repeating the bind does not create another
record. Existing commercial fields remain frozen preimages; ordinary updates
and import replacement cannot restore their authority after binding. Unbound
items retain the legacy terms editor during this transition.

Bound items use the authorized live shared-terms reader and revision-checked
writer. The client read and action scope require the exact current Kitchen and
settled App membership/access, including changes away and back before credentials
finish. Read outcomes distinguish unavailable owners, loading, missing records and
failure. Existing dirty fields and add-on drafts survive same-owner refreshes;
revision changes do not remount them. Local editing intent still blocks obsolete
preparation, and blank or invalid authored prices cannot become zero. A valid
committed response remains truthful while obsolete surfaces suppress feedback.
`test/sellable-client-internals.test.mjs` covers credentials, disposal, overlapping
requests, malformed responses and live revisions arriving before save responses.
Public Menu projection resolves canonical terms; missing or invalid
bindings fail rather than falling back. The former order resolver, KitchenOrder and customer receipt consumers were
removed in the Ordering reset. The draft foundation does not yet consume
Sellable pricing or fulfilment eligibility. Historical Sales remain independent.
Contextual price overrides, variant lifecycle editing, public eligibility
filtering and stock/capacity resolution are not part of this base-terms slice.

Verify the transition with `src/test/sellables.test.mjs`,
`kitchen/sellable-command-internals.test.mjs`, `sellable-terms-ui.test.mjs` and `menu-workspace-commands.test.mjs` in
`fireux-kitchens`, plus the existing publication checks. `tools/misebox-migrations/sellables-plan.mjs` only produces an
offline exact-placement review map with preimage/version evidence; it has no
apply operation and never merges by name or price. Source adoption support
does not establish any live cutover or deployed behavior.

Current Ordering authority and draft verification are described in the Ordering
foundation section above. The former lifecycle, acceptance and receipt command
checks are retired with their source; they are not current execution evidence.

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
with the existing root doorway. The scoped Publishing control reuses Calendar's
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
`Workspace/Identity/Index.vue` composes the Kitchen listing and explicit child-page
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

| Responsibility                    | Owning source                                                                                                                   | Focused evidence and preserved limits                                                                                                                                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dish/Drink create, update, delete | `runtime/kitchen/server/dishes/{create,update,delete}.ts`                                                                       | `test/kitchen/dish-commands.test.mjs`, `test/kitchen/dish-ui-scope.test.mjs`, `test/kitchen/dish-image-scope.test.mjs`. Delete is document-only. Media and Dish → Menu placement are separate effects with explicit partial-success recovery; dispatched media cannot be rolled back by client invalidation.                                    |
| Recipe create, update, delete     | `runtime/kitchen/server/recipes/{create,update,delete}.ts`                                                                      | `test/kitchen/recipe-commands.test.mjs`, `test/recipe-command-internals.test.mjs`, `test/kitchen/recipe-scope.test.mjs`. Direct route adapters consume each action; Delete is document-only. Edited-language deltas merge with stored translations; blank clears only that language. Forms use `translate: false`; pure seeding/results remain. |
| Prep creation                     | `runtime/kitchen/server/prep-items/create.ts`                                                                                   | `test/kitchen/prep-create.test.mjs`, `test/kitchen/prep-scope.test.mjs`. Create-only; separate from Recipe Save. Its reference remains an unsaved Recipe edit until Save. Unused Prep Update/Delete adapters have been retired; no write capability is claimed.                                                                                 |
| Waste observation                 | `runtime/kitchen/server/waste/record.ts`                                                                                        | `test/kitchen/waste-command.test.mjs`, `test/kitchen/waste-scope.test.mjs`. Identity, time and audit are server-owned; this does not claim immutable storage under development-open Rules.                                                                                                                                                      |
| Menu sections/items               | `runtime/menu/server/sections/commands.ts`, `runtime/menu/server/items/write.ts`                                                | `test/kitchen/menu-content-commands.test.mjs`, `test/kitchen/menu-content-scope.test.mjs`. Draft edits preserve shared Sellable restrictions and do not publish. Archive/reorder facades have no observed direct UI invocation; no extra endpoints or atomic batch claim.                                                                       |
| Menu metadata/removal             | `runtime/menu/server/records/update.ts`, `runtime/menu/server/records/delete.ts`, `runtime/menu/server/directory/root-entry.ts` | `test/kitchen/menu-metadata.test.mjs`, `test/kitchen/menu-metadata-scope.test.mjs`. Metadata and root projection commit together; naming alone needs acting-user Plus. Status remains publication-command owned.                                                                                                                                |

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

Menu creation, URL import, shared-price adoption and option editing capture
their account/App/membership, destination and local editing lifetime. Completed
writes stay truthful, while obsolete navigation, draft resets and feedback are
discarded. Upload credentials are cleared immediately on scope change and an
older token cannot replace the current token. Scope/disposal checks live in
`menu-create-scope.test.mjs` and `kitchen/menu-tool-completion.test.mjs`; they do
not establish a signed-in browser or provider transaction.

Menu Delete is a named compound command: archive matching source projections
and delete the scoped Menu in one transaction, with no section/item/upload
cascade. It is not the lower single-document Delete primitive. Stable IDs,
source attribution and duplicate projection handling remain with the root helper.
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

Misebox's pricing wrapper derives its Menu allowance and supported actions from current commands: Free supports the default Food and Drinks menus, Plus permits custom regular Menus and the existing domain tools. Team roster/invitation support does not claim fine-grained permissions; preparation execution, tables, costing and outgoing finance must not appear in pricing without connected source. Existing Jobs and Engagement claims have their own owners and require separate verification. No local copy or controlled test establishes an accepted commercial price, live provider readiness or shipping authorization.

The current Kitchen Orders surfaces are the index, `/orders/board` and
`/orders/channels` under `/workspace/kitchen`. The board includes persisted empty
and populated open orders alongside submitted states, with one scoped editor.
Channels groups interaction settings and menu serving schedules without a separate
saved-offerings inventory. Payment settings are a Kitchen Identity child at
`/workspace/kitchen/identity/payments`; Delivery configuration is consumed inside
Channels. Existing Offering/Fulfilment storage and trusted command authority stay
with Kitchen; Menu names and Order channel vocabulary are unchanged.

Payments presentation is composed directly by `Workspace/Identity/Payments/Index.vue`;
Delivery settings by `Workspace/Orders/Delivery/Index.vue`. Both reuse the existing
Kitchen Fulfilment reader and protected commands, without a section-switching wrapper.
The Orders configuration separates channel entrances from service/fulfilment choices.
Library stage previews share `Library/Orders/Preview.vue`; success presentation is
`Library/Orders/Success.vue`, with local example state and shared validation retained.

## Kitchen Workspace component sections

Kitchen’s inner capability entries now name Collection, Detail, Create, Add and
Edit responsibilities where consumed. Ingredient Add remains a Kitchen
association workflow; Menu source-upload records remain separate from Menu
creation. The current physical map is in `docs/concepts/components.md` and
the source-owned reader/scope tests. Existing context providers, Kitchen
selection, serving checks, commands and authority remain the same owners.
