# Misebox GPT Context

Updated: 2026-09-18
Ref: 1a4f9a474
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

- `misebox-app` is the Main App. `/` presents the Kitchen directory using the same
  `useKitchenCollection` reader and `KitchenCollection`
  component as `/kitchens`. The dedicated directories remain at `/kitchens` and `/menus`, without featured Kitchens.
  `/product` retains Kitchen-team product literature. The saved operational
  composition lives at `/workspace/kitchen`. The App hostname middleware routes
  `workspace.misebox.app/` and `workspace.localhost/` to that entry; Workspace
  host responses are noindex. Public and Workspace domains are separate entry
  points; hostname middleware does not redirect visitors between them. Local
  development also serves `/workspace/**` on `localhost` without a hostname
  redirect. Authentication remains origin-scoped.
- A guest arriving at `/workspace/kitchen` is already in the Kitchen Workspace, even before
  saving Kitchen information. Getting started describes its content state;
  it does not mean the Workspace is absent. The Kitchen/Place creation and
  onboarding commands retain their distinct persistence and authority roles.
- The Main App owns `/`, navbar/SEO framing and short Kitchen entry copy in
  `app/pages/workspace/kitchen/index.vue`. The Kitchen-owned Workspace Index composes the shared
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
  focused current-day work belongs on `/workspace/kitchen` once onboarding prerequisites prove
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
  identity and switcher to the Core sidebar through package registration.
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
hours, adjacent shifts and the next start. Kitchen public service summaries expose
only enabled offering names, explicit serving hours and combined ordering pause
state; they never borrow venue opening hours or expose notification recipients.
Kitchen detail, Menu cards and Menu browsing reuse `ServiceTimes` for
“Serving now”, next starts and unknown/paused states. These are schedule indicators,
not checkout acceptance guarantees. Missing enabled schedules remain unknown.
Menu readers, cards, read outcomes and pagination remain shared.
Individual Menu URLs remain unchanged. `MenuBrowse` consumes the existing
Menu logo projection through `MenuIdentity`. The public payload carries the
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

Current group prefixes and destinations (relative to `/workspace/kitchen`):

| Sidebar group      | Route prefix      | Pages                                                            |
| ------------------ | ----------------- | ---------------------------------------------------------------- |
| Orders & Service   | `/orders`         | index, ordering, queue, pass, tables                             |
| Prep & Production  | `/prep`           | index, stations, batches                                         |
| Menus & Recipes    | `/menus`, `/food` | Menus at `/menus`; dishes, recipes and ingredients under `/food` |
| Stock & Purchasing | `/stock`          | inventory, purchasing, receiving, suppliers, waste               |
| Food Safety        | `/food-safety`    | index, records, actions, procedures                              |
| Team               | `/team`           | index; Responsibilities remains a section anchor on that page    |
| Reports            | `/reports`        | finance, performance, costs, waste-report                        |
| Identity           | `/identity`       | index, operating-hours, appearance                               |
| Settings           | `/settings`       | index (Integrations), kiosks, stations, access                   |
| Developer          | `/developer`      | test; dev, training and preview remain hidden                    |

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
removes only that Kitchen association through `kitchen/server/ingredients/commands.ts`.
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
checks existing references in its transaction; later reference writers do not
currently enforce association existence, so this is not a universal referential
integrity guarantee. `kitchen-crud-boundaries.test.mjs` verifies membership-bound
authority and the Recipe update allowlist. Recipe updates accept only name,
description, translated names/descriptions and validated preparation; identity,
Kitchen ownership and unknown patch fields are rejected before the write primitive.
Its optional architecture disclosure is dynamically imported only in development
and contains source annotations, not operational payloads.
Other groups and Workspaces have not adopted group indexes.
Menu records, imports and research live under `/menus`, an explicit exception to
the sidebar group prefix. Public Menu URLs and HTTP command
endpoints are unchanged. `/settings/kiosks` composes device management and links to
`/settings/stations`. Calendar remains a contextual doorway; record details, creation,
research and parked routes are not primary sidebar entries. Research routes follow
the capability they describe. There are no retired-route aliases or fallback readers.

Ordering is Kitchen-owned and appears only under Orders & Service. Settings must
not repeat the retired per-Menu ordering configuration. Its Integrations and Access
availability notices do not imply completed tools. Queue/pass, prep views, food-safety
views and Access are explicit child pages composed from their existing owners.

Other maintained Workspaces currently have ordinary Workspace sections rooted at
`/workspace/<family>`, rather than Kitchen's nested operator groups; no artificial
`workspace/workspace` segment is introduced. Apply the same group-to-route contract
when those Workspaces gain actual nested groups, respecting explicit capability
route contracts such as Kitchen Menus.

## Kitchen and Place

Kitchen Workspace groups Identity, Operating hours and Appearance under the collapsible
Identity sidebar group. Each has its own page: `/workspace/kitchen/identity`
for Place identity/contact editing and the Kitchen directory visibility toggle,
`/workspace/kitchen/identity/operating-hours` for venue hours and separate Kitchen operating hours, and
`/workspace/kitchen/identity/appearance` for Kitchen palette editing. These are explicit child pages, without query-view switching or the retired theme route. Kitchen Identity
excludes hours from the shared Place editor; standalone Place editing retains them.
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
Identity pages expose one client-only, development-only bottom `DevDebugPanel`
with Copy JSON. The owning reader/composition supplies bounded source projections
and derived state; `kitchen/utils/identity-debug.ts` excludes credentials, private
operational fields and signed media URLs. Operating hours reuses its one Menu
reader for both presentation and diagnostics, showing saved venue, Kitchen and
service schedules separately from effective hours. Appearance includes its local
draft and preview state. Research pages inspect their existing authored payload.
Updates preserve the exact day membership of unrelated windows and use the existing
Place hours command. An empty schedule remains unset under the current Place model.
Identity composes the shared Place public detail presentation, with its management
controls explicitly disabled. Profile, Brand, Photos, Contact and Visit open focused
side panels while the public presentation stays behind them. `PlaceEdit` composes
those same named editors together on protected public edit pages. Operator-facing
copy describes the venue or Kitchen, without exposing the underlying Place relationship.
Place ownership and explicit Kitchen mutation authority remain unchanged; Supplier
relationship flags are not part of this workflow. Profile owns name, short name,
tagline and about; Brand owns profile image, logo, wordmark and backdrop; Photos owns
cover and gallery; Contact owns contact/social fields; Visit owns address, timezone
and advanced map fields. Kitchen suppresses the separate Place default-currency
control and supplies its own inline Currency field through the settings slot.
Brand uploads use the existing trusted `image`, `logo` and `wordmark` storage paths
and independently update their matching fields. Directory publication is a
single labelled switch shared with the public Kitchen edit surface, without a
separate status card or repeated visibility copy.
Visibility uses the existing Kitchen publication commands and does not enable ordering
or publish Menus. Place mutations retain explicit Kitchen operator authority.

`PlaceEditGoogleReview` provides a transient, read-only comparison of saved name,
phone, website, timezone and regular venue hours against Google Maps. Kitchen
Identity and the full Place editor compose the same comparison.
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

- Canonical Kitchen domain identity is exactly `id`, `identity_source`, `slug`,
  `status`, and `visibility`; audit stamps and proved Kitchen operation
  configuration remain separate root concerns. `identity_source` is `user` for
  an explicitly created shell and `place` when onboarding selects a Place; it
  is independent of Place classification.
- A name-only Kitchen shell may use a generated id while being manifested, but
  its name is persisted on the same-id Place rather than copied onto Kitchen.
- Same-id Place owns venue name, tagline/presentation, address/geo, media,
  classification, price level, timezone, and business hours. Kitchen owns its
  operating currency, seeded once from Place during physical creation.
- Kitchen Team owns the roster, role labels and invitations. Its shared person
  editor manages name and linked account. Linked names
  come from User accounts. Kitchen Identity and the public Place edit route compose
  the same Place-owned inline controls under `place/components/Edit.vue`.
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
- Kitchen owns the shared numbered-table count at `tables.count`. Services
  exposes its form above the six service choices through `Workspace/Tables/Write`;
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
Kitchen owns named services, currency and the shared palette; Menu readers
derive those inputs from the parent Kitchen.
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
consumes `useMenuServiceComputed` directly, without importing mutation adapters.
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
`directory/sync.ts` rereads current Menu state transactionally for metadata edits,
rename and draft imports, preventing an older sync from restoring stale status.
Those metadata/import workflows still have separate command and sync commits;
do not describe their complete workflows as atomic. Existing public route ids,
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
service filters use the projected supported contexts, not a promise of current
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

Kitchen owns `currency`; Menu creation, imports and customer payloads read it
from the Kitchen. Physical Kitchen creation may seed it once from the selected
Place; thereafter Place changes do not change Kitchen currency. Unset currency
blocks tools that require prices until an operator chooses it.

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
`kitchen_id`. Ordering is owned by Kitchen services, not stored on Menus.

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
  `kitchens/{kitchenId}/integrations/sproochli`; retained root/App copies remain
  preimages until their separate deletion gate.
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
Kitchen-owned adoption command from Landing or Dashboard. It checks the proof,
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
its Kitchen-owned access record at `kitchen_access/{appId}/users/{uid}`.
The record must match the current AppUser creation timestamp; a previous
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
  not truncated on downgrade. The development subscription badge uses the
  existing development-only `set-self-subscription` command and changes the
  actual AppUser subscription; it is not a separate local preview.
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

## Product literature and Demo

- Derive copy from current capability source, not a parallel marketing vocabulary.
- App Tools/Operations/Discovery components are literature and doorways;
  execution remains with the owning capability.
- Public Demo/Product Demo is read-only presentation over package-owned
  deterministic fixtures. It never becomes Live/Test authority or writes data.
- Media, brand, SEO, translation, finance, jobs, blogs, and marketplace work read
  their named concept maps and owner source rather than expanding this context.

## Verification

The Main App owns release tooling at `projects/misebox/misebox-app/release`.
`build:release`, `prepare:firebase-output`, `deploy:preflight`, `deploy` and
`deploy:hosting` no longer depend on removed root scripts. Preflight requires a
production Rules source and passing allow/deny tests; upload additionally reads
the existing named-database Rules release and requires an exact source match.
These commands never deploy Rules, Storage policy or tenant Apps. The retained
development-open template is not a production fallback. See that directory's
README for commands and local-versus-live verification boundaries.

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

Kitchen and Project Team consume the shared member record and AI intent directly.
Their collection selection, Create surface and two-column editor are Core-owned; domain
Index components compose those controls with domain details and invitations.
Do not restore domain aliases, default backfills, or forwarding UI copies.

Kitchen Test is a disposable string pipeline. `useKitchenTest` owns its live
reader and direct calls to the existing trusted Test commands; Project uses
`useProjectTest`. The named Kitchen and Project Test Index components compose the shared
`Workspace/Capability.vue` layout: collection and collection tools on the left,
focused record and individual tools on the right. Test creation and record detail editing
reuse `Workspace/Test/Form.vue` and the same command callbacks. The Team Editor
uses that same layout with its existing person and role controls. Workspace
context is available compactly above and openly below Test. Test publishes the
bounded workspace/collection/selected/derived context from its UI; its data
controllers do not own a second presentation model. Core `useTest` owns shared selection and commands. Kitchen Test AI consumes that
same published bounded context and prepares create, read, update or delete through
its Kitchen route and the shared `fireux-ai/runtime/server/utils/test-intent`
interpreter. Project uses that same interpreter and Core's Test AI presentation. Read selects an existing string; writes require review
and use the same Test controller commands as manual controls. A changed context
invalidates the prepared action. Development uses the existing Codex transport;
production retains the configured provider. No Misebox agent endpoint or new
provider infrastructure is involved. Test
uses `/test/[id]` for configuration and has no discovery or client capacity framework. Landing, Team and Test keep the
local collection toolbar → Hero → visible AI → collection/focus order described
in the Workspace family map; verify it against current components.

Kitchen Menus uses a collection header, direct record rows and contextual AI
below the collection. `useKitchenMenusContext` remains its live domain source.
The canonical Menu record owns Details, Items & prices (Calendar for daily
Menus), Publishing and Source as local perspectives; section and upload records
retain separate destinations. It does not use a collection-left/focus-right panel.
Its collection chooses Menu records inside the active Kitchen. Creation and
reading belong with the collection; editing, pricing and publication actions
belong with the selected Menu. The Menus entry does not append the cross-food
navigation, discovery or guiding-literature surfaces. Their underlying sources
remain available for other consumers.

Menu record entry `/workspace/kitchen/menus/[menuSlug]` mounts the App workspace
header and `Workspace/Menus/IdentityBar.vue`, showing the exact routed Menu’s
name and publication status. The record entry composes the existing Details editor
for name, description and display order plus Facts for stored publication status,
Kitchen currency and readable audit dates. The Menu composition uses a header
with status and a public-view link, a details editor and a compact metadata
sidebar in one connected surface; the body stacks on narrow screens. Technical
record details are collapsed. The editor reuses the shared inline editable fields. A successful rename updates
name and slug atomically, replaces the current route, and shows a confirmation toast.
The stable document ID and child records do not move; old slug aliases are not retained. Publication uses its existing
route and validation. The temporary Direct/Derived JSON component is retired;
no duplicate publication booleans are stored or displayed.
Details, Items & prices, Publishing and Source form the Menu record navigation.
Items/prices, publishing and source remain separate Menu routes. Ordering
configuration is a Kitchen capability; the Menu's Linked services section links
to it. That section reads explicit stable-ID membership from Kitchen ordering, including
disabled services. It distinguishes configuration state from checkout readiness.
Published structured Menus offer customer-site links for enabled, unpaused collection,
delivery and pre-order services. Document Menus remain browse-only; kiosk services
link to device management and unfinished contexts have no customer ordering link. The former content Overview and profile-card header are retired.

Kitchen and Project Team publish workspace id, member collection, focused person
and derived availability as one bounded context. Team AI projects its request
from that same context; Info and Copy JSON consume the published version.
The Landing/Test/Team similarities and accepted differences are recorded in
`docs/concepts/family-workspace-entity.md#landing-test-team-comparison`.

Kitchen Landing publishes its domain-owned `kitchenWorkspaceIntro` from the same
controller facts as its visible controls. The App entry consumes that published
object for Hero and the shared information dialog. The dialog explains scope,
access, actual allowance, retained access, action availability/reasons and the
bounded Landing AI. Plain language is primary; copying structured page data
is optional. Kitchen and Project prove this bounded presentation contract in
`docs/concepts/family-workspace-entity.md#landing-information-dialogs-kitchen-and-project`.

Kitchen Landing AI uses its own `kitchen/server/index/landing-intent.ts` and the
existing lower FireUX AI transport, following the Test/Team intent pattern rather
than adding another upward ecosystem dependency. It uses only visible Kitchen
names/ids, selected id, allowance and action facts; no Menu/Order records or parent
chat/repository history. Local development opts into Codex without provider fallback;
production keeps its configured provider. The same request construction and result
validation apply before that split. It opens normal controls; human confirmation
and existing trusted commands still own writes. A completed inference is not proof
that its requested UI action succeeded.

KitchenAI can hand a Landing question to Menus through the Kitchen-owned
in-memory `useKitchenAIHandoff`. The receiver consumes it once for the same
signed-in user and Kitchen within two minutes; it carries no conversation history.
`Workspace/Menus/Ai.vue` uses the Menus controller's published state and derived
availability, interprets through `kitchen/server/menus/intent.ts`, and opens the
same Create/Read controls or selected Menu review routes as manual actions.
Account/context changes invalidate in-flight responses, even if selection later
returns to its previous value. No intent endpoint performs a record mutation.
Other capability AI routes have not adopted this handoff.

Kitchen and Project retain the top toolbar selector and visible AI. Settled empty
accounts see Getting Started and an Add/Create path; populated accounts see the
collection and focused record. Pending/error or missing related records are never
treated as new accounts. Useful domain discovery cards follow both presentations.
The shared state helper and presentation contract are mapped in the Workspace family
map; Project AI remains unconnected.

Capability Index files are readable compositions. Kitchen Landing delegates
Collection and Single presentation to its named Home children; its Index
coordinates one Add modal for the collection, empty state and AI action callback;
shared Test and Team use their named Collection and Single children. Shared
workspace framing owns placement only; children own local control state and use
Nuxt UI directly. This is the adoption basis for shared and Kitchen domain
capabilities when touched, not evidence that all current capabilities conform.

Kitchen Team's route binds `useKitchenTeam` and page framing. Its domain Team
Index owns role endpoint/suggestions, assignment wiring and invitations, using
Core Team children. Project is the comparison sibling, and both domain
controllers consume `useTeam`; see the Team construction contract in
`docs/concepts/family-workspace-entity.md`. Do not move domain role orchestration
back into the route or add domain branches to shared Team components.

Home, Menus, Team and Test collection rows use Core `Workspace/SelectionRow.vue`
with Nuxt UI neutral soft/ghost buttons, avatar/status icon and record name.
Their Single summaries use Core `Workspace/SingleCard.vue`: a Nuxt UI `UCard`,
XL avatar/icon, name and one chevron. Kitchen identity uses its existing
workspace route; Menu/Team/Test configure the exact record on id routes.
Team AI preparation retains its dialog with the same shared settings editor. The shared `Workspace/Capability.vue`
owns the equal-column/stacked layout. See the Collection/Single presentation
baseline in `docs/concepts/family-workspace-entity.md`.

Kitchen Menus retains its selected Menu per App, signed-in User and Kitchen in
shared local state; a bounded cookie restores the last selection after reload.
Only a settled live collection reconciles a removed or archived choice. This
preference grants no access and does not modify Menu records.

Kitchen Menu workspace preview and publishing links consume the Menu route
grammar: tenant Apps use their root Menu route, while global Apps use the
Kitchen-directory route. A published Menu does not imply ordering is enabled;
customer ordering doorways derive their services from `Kitchen.services`.

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

## Kitchen services

`kitchen/models/service.model.ts` owns named Kitchen services. Each has a stable
ID, operator-chosen name, enabled state, eligible `menu_ids`, an explicit serving
schedule and a list of interactions. A service is an offering such as Breakfast;
browse, pre-order, collection or delivery are interactions that offering may allow.
Multiple services can enable the same interaction without sharing identity or hours.
`kitchen/models/ordering.model.ts` owns the ordering interaction policies: notice,
contact, pause, notifications and fulfilment instructions/deposit.

Place owns venue opening information. Kitchen owns its operating schedule,
which may follow Place hours. A named service owns when its food can be received;
its hours do not inherit or intersect with Place, Kitchen or Menu hours at runtime.
Pre-order requests can arrive outside future serving hours. Menu owns catalogue content and publication. Daily Menus can date their
content selections; serving hours and ordering authority remain Service-owned.
Ordinary published Menu browsing remains available independently of services.
An enabled service can also provide a named browse doorway. Ordering requires an
enabled service and interaction, published Menu membership and configured hours;
paused interactions and missing service identities fail closed on the server.

The Operating hours page composes the venue editor, Kitchen operating schedule
and named service schedules. `Workspace/Services` configures each offering at
`/workspace/kitchen/orders/services/<serviceId>`. Its name, master switch, Menus
and serving hours are separate from the selected interaction's settings.
New services start disabled with browse configured and no selected Menus or hours.
Selecting an interaction in the editor performs no write and enables nothing.
Kitchen schedule writes retain the independent `ordering/hours` command and
`orders.operation_hours` storage. Removing that schedule restores venue inheritance
for Kitchen operations only.

`kitchen/server/services/commands.ts` owns create, update and interaction updates;
its transaction checks Kitchen write authority and selected Menu ownership.
`kitchen/utils/kitchen-services.ts` reads only the current stored contract.
`menu/utils/menu-ordering.ts` derives each Menu's eligible ordering interactions.
`kitchen/server/ordering/whatsapp.ts` owns notification delivery and its lease;
`whatsapp-test.ts` authorizes tests against the exact named service's stored recipient.
Public projections omit private notification configuration. Every source Menu in a
mixed basket must be published and belong to the same enabled, unpaused service.

Customer doorways carry the stable service ID alongside the interaction context.
Orders, requests, receipts and customer recovery use `kitchen_service_id` and
`kitchen_service_name`; the existing `service_id` remains the operational numbering
period. Historical orders without a named service retain that absence. Basket,
idempotency, async scope and recovery checks distinguish named services even when
their interaction types match. Generic browse never selects the first service.

Stored service policy excludes delivery zones and payment methods.
`menu/models/menu-ordering.model.ts` owns the resolved response that combines
service policy with Kitchen fulfilment; consumers import each model directly.
`menu/server/ordering/order-type.ts` owns the static mode definitions used by
request validation, scheduling, fulfilment, payment and order-record assembly.
Mode definitions and their types stay together; configurable service policy stays
Kitchen-owned. `src/test/menu-order-policy.test.mjs` exercises the mode consumers.
Menu directory cards and filters do not infer one opening schedule for the
catalogue. Service-specific hours belong to the chosen ordering context.

Menu public routing composes `ownership/app-scope`, `scoped-target` and
`root-target`; `target.ts` only selects the route owner. Payload construction
separates document/manifest assembly, shared presentation and the public service
profile. Draft import planning is pure in `draft/plan.ts`; `draft/write.ts` retains
authority and transaction execution, with `replace-content.ts` applying child
record changes inside that authorized transaction. Ordering response policy, draft state,
requests, receipts and preview contracts have separate Menu model files with direct
consumer imports. Checkout composes contact fields and `useMenuCheckout`; its
component-owned CSS stays beside the dialog.

Public Menu routes compose `Browse` or `Order`. Product demonstrations use the
explicit `menu/components/Preview` and `menu/composables/preview` presentation
family; they do not own a second order writer, session store or live controller.
The retired `Detail` root and `kitchen/composables/order/funnel` are removed.
Document viewers live under `Browse/Document`. Kitchen detail lists Menus without
reading abandoned basket sessions; current baskets are local to the Order flow,
while submitted-order recovery uses `useMenuOrderTrackingSession`.

`useMenuOrderLifecycle` coordinates restoration with one mounted/auth/scope
watcher. Async submission, status and recovery results are accepted only for
their current scope; recovery retries are cancelled on reset/unmount. Behaviour
is covered by `src/test/menu-order-lifecycle.test.mjs`. Menu payloads carry
Kitchen imagery, not kiosk skin configuration. Kiosk preview artwork remains
an explicit presentation input, separate from stored Menu data.

Workspace `Services` starts with Collection, Delivery, Pre-order, Table service,
QR Tables and Kiosk choices over existing named `Kitchen.services[]` records.
Table service and QR Tables share a `dine_in` interaction and its menus/hours;
its explicit `table_channels.staff_pos` and `table_channels.table_qr` switches
are independent. Existing interactions without this field retain both established
channels; new configurations enable only the selected channel. The configuration
command merges the selected switch against current stored state. Menu projections
and order submission respect the channel switches, with staff authorization still
required for staff orders. This does not complete the separate Staff POS surface.
Website ordering/testing and the Delivery & payment doorway belong in Integrations,
not the Services card grid. Unconfigured choices are off. Opening a
switch edits a local draft; the trusted `services/configure` command validates
and commits menus, explicit hours and interaction settings in one transaction.
Existing identities and unrelated interactions are preserved. Shared menu/hour
changes are identified in the editor, and activating other saved interactions
through an off offering requires explicit acknowledgement. Advanced named-offering
editors remain available by their existing routes. The Services page has no
advanced-offerings disclosure; shared table count is an always-visible form
above its service cards. Interaction settings
compose timing, customer-details,
availability and notification controls. The service master switch and interaction
switches remain separate from temporary interaction pause. Pre-order notice is edited in hours,
while other services retain minutes. The Payment summary reads Kitchen fulfilment
and links to its existing editor; optional WhatsApp controls appear last.
`Fulfilment` uses the existing
`kitchens/{id}/fulfilment/policy` live reader and trusted command for delivery zones
and payment methods. Its delivery editor lives under Kitchen composables and
its pure zone helpers under Kitchen utilities. `Workspace/Integrations` at
`/workspace/kitchen/settings/integrations` owns Website ordering: button preview,
copyable code and the direct customer link. The former Channels and Settings
index entrances redirect there. Website code targets the Kitchen's stable
`/kitchens/:slug/order` entry, or `/order` in a tenant App. This chooser consumes
the live published Menu directory and its safe service-option projection, excludes
paused and unsupported interactions, and carries the exact selected service id
to the existing per-Menu checkout. It does not combine several Menus into one
basket. Ordinary service/menu edits do not require a replacement snippet.
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
`service-configuration.test.mjs` and `kitchen-ordering-choices.test.mjs` cover the
configuration and selection boundary. Kiosk device management remains in Settings.
Kiosk and per-Menu checkout URLs use current Menu slugs while device and service
references retain stable IDs. Kiosk activation explicitly selects the
named service and Menu; session authorization rechecks that binding and current
service eligibility. Old devices without a service reference require reactivation. Website buttons use the configured
App customer site origin, keeping localhost previews local. Ordering and integration
screens preserve pending, failed and empty Menu read states. POS remains an unfinished diagnostic
surface; it does not gain a separate backend in this cutover.

Source-only demo fixtures author a Counter service with multiple interactions per
Kitchen. They never write Firestore or put policy back onto Menu records.
The current cutover is `migrations/named-services.py`, with its bounded runner
`named_services_runner.py`. Planning requires one exact Kitchen ID. It captures
full preimages and materializes the old effective service hours before removing
`ordering`. Existing old modes become separately named services without inventing
or merging offerings. Missing/conflicting values block apply. No old-shape runtime
readers remain. Apply requires a completed managed export, source/plan hashes,
transactional preimage and linked-Place checks, and exact postimage verification.
Menus, order history and audit provenance are preserved. Replanning a converted
Kitchen is a no-op; absent old configuration does not fabricate a service.

Run `src/test/kitchen-services.test.mjs`, `kitchen-ordering-whatsapp.test.mjs`,
`menu-service-selection.test.mjs`, migration unit tests and affected public Menu,
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

Kitchen Ingredients presents those live identities as a searchable category
catalogue with grid/list views and an image-completion filter. Its card component
handles missing or failed images without modifying identity. The add drawer and
dedicated add route reuse the Kitchen ingredient selection form; the catalogue
does not create a second ingredient library or supplier offer store.
Catalogue cards open a read-only ingredient panel, preserving the current search
and filters. Previous/next follows the visible category order. The panel and
dedicated detail route reuse `Workspace/Ingredients/Preview.vue`; global identity
editing remains with Ingredient curation.

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

`migrations/ingredient-catalogue.py` and its reviewed JSON specify the exact
Misebox category cutover and Bären food-input seed. The runner preserves existing
fields/IDs, creates missing records and Kitchen links, requires a managed export
and source-bound private preimages, and checks update-time/create preconditions
before one atomic commit. It never removes old metadata or fabricates Supplier
products, prices, availability, recipes or stock. Seed evidence distinguishes
menu mentions from working assumptions. Verify with `ingredient-identity.test.mjs`
and `migrations/test_ingredient_catalogue.py`, plus the representative App check.

## Workspace component placement

Kitchen navigation follows the accepted convention: capability entrances and
record destinations where required have URLs; Surface capabilities need no record
layer. Perspectives within a record use local view state. Groups
organise navigation and may have overview entrances without owning capability
paths. Dialogs serve bounded create, quick-edit, confirm and delete actions.
Other existing capability routes remain outside this bounded adoption.

All Menu collection rows open `/workspace/kitchen/menus/<slug>`. The
`Menus/Record` composition owns Details, Items & prices (Calendar for daily),
Publishing and Source as local views, reusing the existing forms and commands.
Regular Menus default to Details; daily Menus default to Calendar. View state
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
`useDishUpdate.ts` validates the specification and uses the existing scoped update
command. `Workspace/Dishes/Spec.vue` reads linked records live and edits the
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

`kitchen/models/recipe-preparation.ts` normalizes old recipes to an empty prep
list and validates both input lists. Workspace Recipes Form and Preparation
compose the existing Kitchen Prep Item create command and live collection reader;
notes are secondary to quantities and the cooking method. New prep definitions
can be created while editing a recipe and persist independently if that recipe
edit is cancelled. Daily prep scheduling and batch execution remain separate,
unconnected surfaces. Verify this boundary with `src/test/recipe-preparation.test.mjs`
in `fireux-kitchens` and the recipe editor/read surfaces.

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

This slice supports Workspace planning only. `publication/validation.ts`
rejects daily Menu publication until public date selection and ordering-date
validation are implemented. Do not interpret draft status as an implemented
private-audience policy. Ordinary public Menu publication is unchanged.
Verify dates, Plus/access gates, copy identity, occupied-date refusal and the
publication boundary with `src/test/daily-menu.test.mjs` and
`src/test/menu-publication.test.mjs`.

## Bounded capability UX proofs

Collection / Focus and Surface describe capability interaction; they are not
architectural levels or stored fields. Workspace → capability → destination(s),
with contextual tools, is the product grammar. A Surface need not introduce a
record destination. Navigation groups remain composition; existing grouped routes
are not the capability model. Mixed or unproved capabilities remain unclassified.

Menus is the Collection / Focus proof. Identity is the contrasting Surface proof:
`Workspace/Identity/Index.vue` composes the selected Kitchen breadcrumb, Identity
heading and public-page destination above its existing publication controls, Place
preview and section editors. It retains the existing state and authority branches.
These two local compositions do not yet prove a shared renderer or Core contract.
See `docs/concepts/family-workspace-capability-tool.md`.
