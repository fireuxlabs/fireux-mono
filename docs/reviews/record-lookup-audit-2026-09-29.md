# Record lookup audit and repair queue

Date: 2026-09-29
Baseline: `5b20445c3`; the six-item implementation batch below remains uncommitted.
Owner: Misebox / FireUX Coordinator.
Role: working audit and task board; not architectural authority.

## Scope and completion rules

Audit dynamic record destinations across Core, Extensions, Ecosystems and Apps,
following the route through its controller to the actual acquisition. Include
ID, slug and handle lookup, collection fan-out, scope, ambiguity and read states.
Source review does not establish actual network cost or production readiness.

Classify each occurrence as focused acquisition, legitimate collection workflow,
confirmed drift, unused legacy code, demo, or unresolved. A `.find()` alone is not
a defect. Lists, pickers, queues and embedded records may legitimately use arrays.

States: Queued → Active → Review → Verified. Blocked requires an exact missing
decision or dependency. Verified requires source references and relevant tests,
direct navigation/reload, live updates, scope changes and correct failure states.
Only one implementation writer works in the shared checkout at a time. Repairs
remain uncommitted until Daniel reviews them. Audit agents are read-only.

## Repair queue

| ID | State | Scope / owner | Evidence and problem | Acceptance |
| --- | --- | --- | --- | --- |
| RL-01 | Review | Kitchen Menu record / FireUX | The former `useKitchenWorkspaceMenuRecord` read all Kitchen Menus to resolve a slug; record children recreated collection orchestration. Local repair introduces focused read and shared record context; evidence below. | Exact Kitchen-scoped live slug lookup; ambiguity rejected; no collection acquisition solely for identity; pending/denied/error/missing distinguished; tabs, source uploads and sections preserved. |
| RL-02 | Review | Kitchen Ingredients / FireUX | `useKitchenWorkspaceIngredient.ts` calls `useKitchenWorkspaceIngredients`, then finds ID or ingredient reference. `useKitchenIngredients.ts` reads every Kitchen link and hydrates linked canonical Ingredients. | Read the requested Kitchen link and required canonical Ingredient only; preserve both supported identifiers, missing-root indication, access and live scope changes. |
| RL-03 | Queued | Kitchen Recipes / FireUX | `useKitchenWorkspaceRecipe.ts` calls the Recipes collection controller and finds `recipeId`; consumed by `Recipes/Detail.vue`. | Direct scoped Recipe acquisition on deep link; no collection bootstrap; preserve edit commands and honest unavailable usage state. |
| RL-04 | Queued | Kitchen Dishes and Drinks / FireUX | Both record routes provide the collection `useKitchenDishesContext`; `useKitchenWorkspaceDish.ts` finds `dishId` in that list. | One focused record context shared by record tools; enforce food/drink identity; retain list context on collection pages and necessary picker reads. |
| RL-05 | Queued | Kitchen Supplier record / FireUX | `useKitchenWorkspaceSupplier.ts` selects from collection context. `useKitchenSupplierFetch.ts` reads all Kitchen links and the supplier network for hydration. | Resolve selected Kitchen link and Supplier only; preserve catalogue/supply-options authority and parent/provider wiring. |
| RL-06 | Review | FireUX App module record / FireUX | `/modules/[id]` uses Product collection and per-product price reads before selecting requested module. | Resolve requested module using its supported identifier; fetch only its prices; preserve module/product mapping and error states. |
| RL-07 | Queued | Project detail read-state / FireUX | Requested Project read is bounded, but route failure is presented as not found. | Distinguish failure from missing without broadening Project membership access. |
| RL-08 | Queued | Project test and Team records / FireUX | Detail pages select one test/member from broader readers; Team also has repeated acquisition. | Inspect necessary sibling content; narrow only record-only acquisition, preserve membership and Team enrichment. |
| RL-09 | Queued | Legacy Kitchen Menu scope / FireUX | `useKitchenMenuScope` reads all menus; `useKitchenMenuDetail` calls it, but repository search found no external caller of that detail function. | Confirm registration/consumers; remove unused legacy pair rather than build a replacement. |
| RL-10 | Review | Property Reservation detail / FireUX | `property/composables/reservations/usePropertyReservations.ts` resolves one record through a list capped at 500 by `property/server/operations/reservations/read.ts`. An exact authorized GET already exists. | Consume exact live GET on detail; records beyond first 500 remain reachable; preserve Property authority and list pagination. |
| RL-11 | Review | Supplier detail / FireUX | `supplier/composables/useSupplierDetail.ts:100` retains last-good Supplier/Place across failures and identity changes while combining server and browser reads. | Clear obsolete identity on navigation/deletion/error; one authoritative live projection; verify public eligibility parity. |
| RL-12 | Review | Core User handle / FireUX | `user/composables/useUserByHandle.ts:37` and `server/api/users/[handle].get.ts:35` use limit(1); Profile sibling rejects duplicates using limit(2). Browser/server directory eligibility differs. | Reject ambiguous handles; verify exact App/Ecosystem eligibility and legitimate aliases; test navigation and read states. Do not describe source divergence as a proved security vulnerability. |
| RL-13 | Queued | Supplier public eligibility / FireUX | `supplier/server/identity/read.ts:23` filters directory to active/visible; detail at lines 40–50 does not. Public detail API is unauthenticated and publicly cached. | Confirm whether unlisted detail is intentional; enforce established publication policy consistently, preserve authorized operational reads and live unpublication. Do not silently equate directory visibility with access permission. |
| RL-14 | Queued | Blog detail state / FireUX | `pages/blog/[slug].vue:39` discards reader error and presents absent settled data as 404; detail composable receives fixed slug. | Reactive locator, separate failure/missing, no stale result after navigation; retryable failure for 503. |
| RL-15 | Queued | Dormant Product Solutions / FireUX | `product/components/Solutions.vue:51` loads all Products to select two fixed IDs; no component consumer found. | Confirm registration and consumers; delete if unused, or narrowly acquire intended IDs. No measured runtime impact claimed. |

## Inspected Kitchen distinctions

- Public Kitchen slug resolution already uses exact `where('slug', '==', slug)`
  and `limit(2)` with duplicate rejection (`kitchen/server/identity/route-identity.ts`).
- Public Menu resolution is scoped to one Kitchen, exact slug and `limit(2)`
  (`menu/server/ownership/scoped-target.ts`). Related Place/service reads are
  projection dependencies, not evidence of collection-based identity resolution.
- Menu directory link mapping, catalogue pickers and order-item variant selection
  legitimately operate on already-required lists.
- Menu section editor consumes all sections and Dishes through its workflow.
  Whether every read is needed on direct section entry remains to be verified;
  do not remove picker data by blanket rule.
- Kitchen Team detail selects from an operational Team projection. Verify the
  parent contract before requiring a separate member endpoint.
- Chef/Driver public profiles delegate to Core profile detail, not Kitchen lists.
- No runtime measurements, production mutations, deployment or commits are part
  of this audit.

## Coverage and next execution

Repository-wide source discovery covered 38 authored dynamic page files across
Core/Ecosystems/Apps and 13 dynamic page files across 18 non-Kitchen extension
packages. Kitchen dynamic routes and candidate controllers were separately
screened. Concrete suspect chains were followed to acquisition; this is not a
claim that every handler, live request or access state was executed.
The Menu implementation is not duplicated. The first six authorized repairs are
now in Review; see their implementation evidence below. Remaining queued items
retain the source audit findings until separately repaired.

## Other-family source evidence

- RL-06: `projects/fireux/fireux-app/app/pages/modules/[id].vue:159` through
  `product/composables/useProductCollection.ts:21`.
- RL-07: `packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/[projectId].vue:32`.
  Its requested-ID collection API intersects IDs with membership; the acquisition
  is bounded despite the Collection name.
- RL-08: ecosystem `pages/workspace/project/test/[id].vue:26` → Core
  `project/composables/useProjectTestRecords.ts:9`; Team route
  `pages/workspace/project/team/[memberId].vue:43` → Core
  `project/composables/useProjectTeam.ts:40`.
- Public Company, Place, Job, Portfolio, Blog, Product, Supplier and Marketplace
  identity readers use exact document/getAll paths rather than whole-root scans.
  Supplier has a state/projection defect despite focused identity acquisition.
- Platform App detail reads an exact ID across a finite approved set of databases
  and detects duplicate canonical IDs. Platform directories/sitemaps legitimately
  aggregate records and are excluded from this record-lookup repair.
- Agent/Professional/Chef/Driver profile routes delegate to the bounded Core
  Profile handle resolver. Canonical User has the separate RL-12 discrepancy.
- Local demo forums, pricing tiers, operation catalogues and template routing
  are configuration/demo arrays, not database collection defects.

## Priority and handoff

The first batch was executed in order RL-01, RL-11 (obsolete identity),
RL-10 (record unreachable beyond list cap), RL-12 (ambiguity/scope parity),
RL-02 and RL-06 (fan-out repairs). All are now in Review. Order remaining tasks
by the Bären release dependency; no claim that each is a release blocker.
Each handoff names one task ID, source owner, preserved behavior and acceptance.
The coordinator records verification evidence here before changing a task to
Verified. Commit/push/deployment are separate from local verification.

## Follow-up limits

- Product detail loads all prices under the selected Product. This is related
  content, not whole-product identity lookup; a price-set bound/pagination needs
  its own supported use-case evidence before changing it.
- `docs/concepts/server-api.md:241` still references the removed
  `scripts/guards/server-ownership.mjs`, contrary to its retirement statement and
  global context. Track this small documentation correction with the relevant
  source-owner pass; the audit does not reinstate a removed guard.
- Audit verification: source inventory, traced callers and targeted searches.
  No browser, database cost, production exposure or deployed behavior proof was
  performed. The Menu implementation has its own separate test results.

Temporary task state belongs here, not in `docs/ai/*-context.md`. Stable rules
earned by completed repairs should update the existing family/context owner.

## RL-01 implementation evidence

State: Review. Local patch remains uncommitted.

- Added Menu-owned `packages/extensions/fireux-kitchens/src/runtime/menu/composables/useKitchenMenuRead.ts`:
  exact Kitchen path + slug filter, live Core binding, limit(2), duplicate failure,
  reactive account/App membership scope. No whole-Menu collection acquisition.
- Added `kitchen/composables/workspace/menus/useKitchenMenuRecordContext.ts`:
  one provided workflow per Menu/section entry; direct existing Workspace selection,
  Kitchen access/read/presentation seams; separate existing App-role edit gate.
  Removed `useKitchenWorkspaceMenuRecord.ts` and `useKitchenWorkspaceMenu.ts`.
- Updated direct record consumers under `kitchen/components/FoodAndDrink/Menus/`:
  Record, WorkspaceHeader, IdentityBar, Navigation, Facts, Services, Publishing,
  Edit/Details, Delete, Publish, Schedule, Source, Process/Cost, Process/Index,
  Sections/Dishes, Sections/Read, Sections/Section. Also updated
  `useKitchenWorkspaceMenuSection.ts` and `useKitchenWorkspaceMenuUploadPayload.ts`.
  All paths above are within `packages/extensions/fireux-kitchens/src/runtime`.
- Source errors remain independent; no-provider uploads retain collection context.
  Source-only `/menus/uploads/[uploadId]` still composes Creation/Detail directly.
  The section item/Dish workflow and public directory are unchanged.
- Stable boundary updated in `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md` and
  `docs/concepts/family-menu.md`.
- 61/61 focused tests pass: menu-record-controller, menu-record-view,
  menu-record-navigation, menu-workspace-commands, menu-publication.
  Includes actual Vue nested provider/consumer sharing, live edit/delete/reappear,
  slug ambiguity, account/membership/Kitchen changes, pending/denied/error/missing,
  separate read-only role, source failure and no-provider upload entry.
- Misebox App `vue-tsc --noEmit -p projects/misebox/misebox-app/tsconfig.json`
  reports 75 errors, none in the added reader/context. Existing source-processing
  consumers still report argument-count errors (Creation/Url:106,
  Process/Confirm:131, Process/Cost:202, Process/Index:366); navigation also retains
  its implicit-any route parameter. Log: `/private/tmp/menu-alignment-app-check.log`.
- All 17 changed Vue components compile through Vue SFC compiler; diff whitespace
  check passes. No Nuxt registration change; consumers import the context directly.
- Desktop and 390px mobile local fixture used actual Record/Header/Identity/
  Navigation/Source and independent Creation/Detail components with stubbed UI
  controls and services. Verified tab changes, Menu/Kitchen/account reset, states,
  source-only error and upload detail without Menu context. Screenshots:
  `/private/tmp/confirmation-first-ui/menu-record/desktop.png`, `mobile.png`,
  `mobile-upload.png` in the same directory. This is not connected Firebase,
  authenticated deep-link/reload, actual provider upload or publication-browser proof.
- `useKitchenMenuScope` is called only by `useKitchenMenuDetail`; targeted source
  search found no external consumer of the latter. Neither changed (RL-09 remains).
- Automatic review rejected sending a progress message to the Coordinator; evidence
  is recorded here as requested. No retry, commit, push, deployment or live mutation.

## RL-11 implementation evidence

State: Review. Supplier detail now consumes only its existing live server
projection, removing raw Supplier/Place listeners and the last-good cache.
Identity is bound to the requested App/ID; pending, error and missing hide
Supplier, Company and Place together. The public route now uses the existing
Detail/State component when no current record is available. Server eligibility
is unchanged, including direct unlisted detail addressability (RL-13 remains).

Files: `fireux-suppliers/src/runtime/supplier/composables/useSupplierDetail.ts`,
`src/runtime/pages/suppliers/[slug].vue`, `src/test/supplier-detail.test.mjs`
(all beneath `packages/extensions/fireux-suppliers`) and `docs/concepts/suppliers.md`.
The map's retired guard instructions were replaced with current checks.
3/3 focused tests pass: navigation/App scope, live updates, deletion/403/503 and
recovery, and unchanged server-result eligibility. Bringli App typecheck reports
60 errors; none names the changed Supplier reader/route. Full log:
`/private/tmp/supplier-bringli-check.log`. Connected direct navigation/reload and
live Firebase events are not verified; no production data was accessed.

## RL-10 implementation evidence

State: Review. Added exact live `usePropertyReservation.ts` beside the existing
Reservation collection reader in `packages/extensions/fireux-reservations/src/runtime/property/composables/workspace/operations/Reservations`.
`property/components/Workspace/Reservations/Detail.vue` now consumes it, displays
missing separately from failures/denial, and guards a late mutation result from
being assigned to a different selected record. Existing GET authorization,
collection list limit, paths and mutation command are unchanged.

3/3 `fireux-reservations/src/test/reservation-detail.test.mjs` tests pass:
exact record beyond list cap, Property/account/record changes and live updates,
404/403/503/access loss, and existing server exact-document/actor boundary.
Package `vue-tsc --noEmit -p packages/extensions/fireux-reservations/tsconfig.json`
passes. Stable boundary recorded in BuenoHost context. The broader Property
Workspace still supplies its existing selection/authority projection; this patch
removes the Reservation collection dependency only. Authenticated browser deep
link/reload and live Firebase execution remain unverified. No live operations.

## RL-12 implementation evidence

State: Review. Both canonical browser and server User handle resolution now use
limit(2) and reject ambiguity. Public Core and Misebox User detail pages consume
new `runtime/user/composables/useUserDirectoryDetail.ts`, which uses the existing
live `/api/users/[handle]` eligibility projection. Tenant membership and global
scope semantics are unchanged in `user/server/directory/scope.ts`. The admin
membership edit route retains canonical `useUserByHandle` lookup, including its
ability to inspect subjects without App membership. Existing @/case handle
normalization is retained; Profile uid aliases remain separate and unchanged.

Files: Core `user/composables/useUserByHandle.ts`, `useUserDirectoryDetail.ts`,
`server/api/users/[handle].get.ts`, `pages/users/[handle]/index.vue`, plus Misebox
`app/pages/users/[handle]/index.vue`; Core tests `user-directory-detail.test.mjs`
and `user-read-lifecycle.test.mjs`; `docs/concepts/collection-manager.md`.
6/6 focused tests pass: browser ambiguity, public API scope/normalization,
navigation/App switch, 404/403/503, live update and server duplicate/global/tenant
membership checks. Misebox App typecheck still reports 75 errors; none names
these readers, User routes or endpoint. Log `/private/tmp/user-directory-app-check.log`.
No connected browser/reload or deployed Firestore proof; no new public authority.

## RL-02 implementation evidence

State: Review. `fireux-kitchens/src/runtime/kitchen/composables/workspace/ingredients/useKitchenWorkspaceIngredient.ts`
now binds a single bounded live OR query for the requested link document id or
`ingredient_id`, limit(2), and hydrates one root through existing
`useIngredientDetail`. Ambiguous links fail; missing roots remain explicit.
Kitchen Workspace selection/access and deletion commands remain existing owners;
no link collection or all-root hydration is started by the detail reader.
The collection browser is unchanged. Stable boundary added to Misebox context.

11/11 tests pass across `kitchen-ingredient-detail`, `kitchen-ingredient-read-state`
and `kitchen-ingredient-crud`: both identifiers, one canonical target, live edits,
missing root vs failure, ambiguity, account/Kitchen change and revoked access.
Misebox App typecheck retains 75 errors, none in the changed Ingredient reader
(`/private/tmp/ingredient-detail-app-check.log`). No connected Firestore query,
index availability, authenticated deep-link/reload or deletion was exercised.

## RL-06 implementation evidence

State: Review. Added Product-owned `useProductRecord.ts` and
`product-read-constraints.ts`; `useProductCollection.ts` consumes the same
unchanged scope policy. FireUX `app/pages/modules/[id].vue` now uses one bounded
ID-or-slug query restricted to `product_type = module`, rejects ambiguous matches,
and subscribes only to that Product's prices. Price/record loading and errors
are distinct from missing. Module presentation, roadmap mapping and checkout
body/endpoint are preserved. Stable boundary is in collection-manager map.

5/5 focused Product record/price-creation tests pass: ID/slug, live price change,
one price path, non-module rejection, public/admin/App scope, ambiguity,
Product/price failure and deletion. FireUX App typecheck reports 2 errors:
Core `useLiveAsyncData.ts:29` RuntimeApp/subscriptionCapacity cast and
Blogs `useBlogCollection.ts:34` Query type mismatch; neither is in this patch.
Log: `/private/tmp/module-record-app-check.log`. No connected database/index,
Stripe action, or authenticated direct browser navigation/reload was exercised.

## Current batch review boundary

RL-01, RL-11, RL-10, RL-12, RL-02 and RL-06 are in Review, not Verified.
The requested sequential implementation batch is complete locally; remaining
queued tasks and RL-13's policy decision are untouched. All changes remain
uncommitted. Browser proof is the bounded Menu fixture described above;
other repairs have source-owned tests and the stated typecheck limits.

Final batch check: 89/89 focused tests pass in
`/private/tmp/record-lookup-batch-tests.log`; all 22 changed Vue components
compile through the Vue SFC compiler; `git diff --check` passes. Existing App
check failures remain separately reported above. No task is marked Verified.

## Ordering ownership first pass

| ID | State | Dependency | Scope / outcome |
| --- | --- | --- | --- |
| OW-01 | Review | None | Bounded fit comparison below: Ordering, Property Reservations, Menu withdrawal. Source fits responsibility map without new package layers. |
| OW-02 | Review | OW-01 | Migrate duplicated payment/print eligibility to existing KitchenOrder lifecycle owner; server transition, dispatcher and ticket UI share it. |
| OW-03 | Queued | OW-02 | Connected confirmation-first payment-state browser coverage remains incomplete; no live orders may be altered for this proof. |

The lookup repairs remain preserved. RL-03, RL-04, RL-05, RL-07, RL-08,
RL-09, RL-13, RL-14 and RL-15 remain Queued. RL-13 still needs evidence of
intended publication policy. No concurrent writer or additional repair started.

### Bounded fit map

Paths below are relative to each package's `src/runtime`.

| Implementation | Real entrypoint → operation → owner | Fits / conflicts / evidence |
| --- | --- | --- |
| Misebox Ordering (`fireux-kitchens`) | Menu Pickup/Delivery/PreOrder/Kiosk adapters → `menu/composables/order/useMenuOrderLifecycle.ts` → `server/api/menus/[menuId]/orders.post.ts` → `menu/server/ordering/{order-command,order-items,order-fulfilment,idempotency}.ts` → Kitchen-scoped Order. Workspace `useKitchenOrderTransition` → transition endpoint → `kitchen/server/operations/orders/transition.ts`. Payment-choice and verified Stripe endpoints advance the same record. | Fits: surfaces own transient input; server re-resolves catalogue, service policy and authority; lifecycle stays KitchenOrder-owned. Conflict repaired in OW-02: UI checked only lifecycle status; dispatcher allowed malformed deferred payment states which server transitions reject. Some transaction/orchestration logic remains directly in API adapters; not moved merely to match nouns. |
| Property Reservations (`fireux-reservations`) | `property/components/Workspace/Reservations/{Create,Detail}.vue` → `useReservation{Create,Update}` → Property-scoped POST/PATCH adapters → `property/server/operations/reservations/command.ts`, `access.ts`, `records.ts`. Detail query uses exact authorized live GET. | Fits without a staged workflow: reservation/date validation and atomic occupied-night locking belong to Property Reservation commands; component form state is presentation. Existing 3/3 detail tests cover exact reads/scope/errors, not exhaustive command concurrency or create replay. Create uses a new generated id; universal idempotent CRUD is not established. |
| Menu withdrawal (`fireux-kitchens`) | Menu publication controls → `menu/composables/publication/useMenuPublication.ts` → `server/api/workspace/kitchen/menus/{unpublish,archive}.post.ts` → `menu/server/publication/withdraw.ts`. | Fits simple command: domain checks membership-bound Kitchen access and archived-state invariant; one transaction updates Menu status and directory projection. Existing publication tests cover unauthorized requests, revoked membership, atomic rollback/retry and repeatable archive. No workflow object is needed. |

This is a responsibility vocabulary, not a vertical hierarchy, compulsory
folders, registry or engine. App → Ecosystem → Extension → Core remains
unchanged. Workspace is the operating surface; Index composes an entrance;
Tools expose contextual actions. Domain invariants do not move to concrete Apps.
The existing capability map's ownership wording is read within those domain
boundaries, not as permission for a surface to absorb another Entity.

Supported source adapters share the submission command; QR encodes an existing
route and is not another writer. This pass does not prove every embed deployment.
Table/dine-in/room-service/Staff POS diagnostic projections are not promoted to
supported complete journeys. Staff POS's missing customer payment-choice handoff
remains as documented in Misebox context. No new payment or refund owner is invented.

### OW-02 migration and verification

`kitchen/models/order-lifecycle.model.ts` now owns
`isKitchenOrderPaymentSatisfied` and `canPrintKitchenOrderTicket`. The trusted
transition preserves its original exact check. Ticket presentation and dispatcher
consume it: confirmation-first print requires accepted/ready/completed and a
selected payment method, with paid for required payment or not_required for
deferred payment. Historical orders keep their existing print behavior.
No paths moved; explicit imports require no Nuxt registration changes. URLs,
access, storage identities, historical records, settlement and preparation
semantics are unchanged. No generic abstraction was added.

- 136/136 commerce tests pass (`/private/tmp/ordering-commerce-tests.log`).
  Added matrices cover server transition rejection and UI/dispatcher eligibility
  for missing method, every existing unsettled payment state, deferred/required
  payment, and historical orders. Existing command tests verify service/input
  revalidation, replay without duplicate Order/sequence, rejection of changed
  replay input, customer scope, verified settlement and non-regressive callbacks.
- Commerce typecheck passes (`/private/tmp/ordering-commerce-typecheck.log`).
- Ticket Presentation Vue SFC compiles. Misebox App typecheck retains 75 errors,
  with none in changed lifecycle, transition, receipt or Ticket Presentation
  source (`/private/tmp/ordering-app-typecheck.log`).
- Reservation comparison: 3/3 existing detail tests pass
  (`/private/tmp/ordering-reservation-fit-tests.log`). This is not a Reservation
  mutation or concurrency test claim.
- Connected read-only browser check on localhost:3001: Bären Orders finishes
  loading, Queue/Pass show existing Print controls, and Incoming opens with two
  pending decisions. No Accept, Prepare, Print, payment or mutation action used.
  Connected malformed-payment fixtures were not created; payment-state coverage
  is local executable evidence, not complete live workflow verification.
- Updated the existing Misebox context and ordering maps to point to the shared
  rule and distinguish confirmation-first behavior from historical intake.

Stable handoff: OW-01/OW-02 are Review, not Verified. All changes remain
uncommitted. Writer stopped after focused checks for the coordinator's requested
shared Git save; no further task has started.

## First-pass continuation from b3f81af15

| ID | State | Dependency | Outcome |
| --- | --- | --- | --- |
| OW-04 | Review | Saved OW-02 | Prevent obsolete customer/operator lifecycle commands after asynchronous credentials or payment-choice status refresh; scope includes selected service and tracked Order. |

Confirmed clean saved baseline `b3f81af15` before editing. No architecture re-audit
or further lookup repair. The saved shared payment/printing rule is retained.

Concrete gap: customer submit already checked captured scope before dispatch,
but choosePayment, checkout and customer response waited for credentials inside
the request options without another check. A navigated-away account/Menu/service
could therefore still send the old request. Payment choice could also continue
checkout against a newly tracked Order after an awaited status refresh. Operator
transitions rechecked App/Kitchen but not the account whose token had resolved.
These are stale-intent gaps, not evidence that server authorization was bypassed.

`menu/composables/order/useMenuOrderLifecycle.ts` now captures destination and
Order before awaiting credentials, stops obsolete requests before dispatch, and
rechecks Order/scope before checkout continuation. Service changes reset transient
state alongside Menu/account changes. `kitchen/composables/workspace/Orders/useKitchenOrderTransition.ts`
checks captured account before its existing App/Kitchen/access checks and POST.
No server policy, URL, storage or historical-order semantics changed.

Isolated verification: expanded existing lifecycle tests exercise delayed
credentials, account/Menu/service/Order changes, checkout dispatch and stale
refresh continuation. Actual Pickup, Delivery, PreOrder and Kiosk adapters
(eat-in and takeaway) execute against a test-double shared lifecycle; each
forwards one submit with its expected type/channel/service. This proves adapter
delegation, not connected end-to-end service availability. New
`kitchen/order-transition-scope.test.mjs` exercises actual operator adapter for
accept/preparation/ready/return/complete, exact server destination and account,
signout, App, Kitchen and access changes. Registered in existing test:commerce.

142/142 commerce tests pass (`/private/tmp/ordering-first-pass-tests.log`),
including saved payment/printing matrices, server confirmation-first/payment
settlement tests, request replay and authoritative validation tests. Misebox App
check retains 75 errors, none in either changed composable
(`/private/tmp/ordering-first-pass-types.log`). `git diff --check` passes.

Trace retained: supported customer adapters → useMenuOrderLifecycle → canonical
Menu order POST → domain selection/price/service/idempotency writers; Workspace
adapter → transition POST → Order transition/payment gate; customer payment
choice → existing scoped choice command; verified Stripe settlement → same Order;
explicit preparation → accepted; ticket UI and dispatcher → shared Order print
eligibility. Deferred pickup is not marked paid. Diagnostic Table/Room Service/
Staff POS and deployed embed/Kiosk sessions remain unproved.

Safe browser check for this continuation: customer Menus → Bären → published
Bären pickup/Collection link loads the Food ordering surface with CHF prices,
service identity and item controls. No basket submission or payment action.
Operator All orders loads successfully; the existing selected Kitchen is now
La Tapberne and shows no waiting orders. Selection was not changed to manufacture
coverage. The preceding saved OW-02 Bären ticket observations remain separate.

Outstanding real-user proof: in an explicitly isolated test Kitchen/order,
submit pickup → confirm manually → choose pay-at-pickup → verify unpaid and
not automatically preparing/printing → start preparation → print → ready →
complete; then verify account/service navigation during a delayed credential
request sends no obsolete command. Online settlement needs an isolated provider
test session. None of this authorizes creating a live test order or charging a
payment. OW-03 remains Queued; OW-04 is Review with executable fixture evidence.
New changes remain uncommitted for review; no Rules, deployment, production
record, payment, or historical-order mutation was performed.

## OW-05 — simple Kitchen Order action boundary

State: Review. Depends on saved OW-02 and preserves uncommitted OW-04.
The existing Workspace already exposes acceptOrder, startPreparation,
rejectOrder, markOrderReady, returnOrderToQueue, completeOrder and trashOrder;
no forwarding action family or generic registry was added.

Moved execution from `server/api/workspace/kitchen/orders/transition.post.ts`
to `kitchen/server/operations/orders/actions.ts` as executeKitchenOrderAction.
The existing HTTP route now only reads the body and delegates. Validation,
operator authority, Order rule application, atomic Sale/financial-fact creation,
Order update and post-commit acceptance notification remain together with the
Kitchen Order owner. The execution body was compared against saved source and
matches exactly; only transport parsing/import paths/export changed.
The pure transition rule helper remains named for its actual state-machine job.
No mandatory Transition/Workflow layer or one-file-per-action scaffold added.

Changed checks: completion identity now exercises the moved domain function;
acceptance notification/retry test traverses the real thin route and domain
function; additional tests check exact route delegation and invalid/denied actions
before transaction entry. Existing settlement, preparation, printing, historical
flow, idempotency and Sale tests remain in the commerce suite.
144/144 tests pass (`/private/tmp/ordering-simple-tests.log`); commerce typecheck
passes (`/private/tmp/ordering-simple-types.log`); git diff --check passes.
No UI/route registration move occurred; explicit domain import retains native
API registration. Existing Misebox App typecheck limit remains 75 errors from
OW-04; no new App-wide typecheck claim. No live POST or browser mutation used to
verify this server move. Isolated real-user workflow proof remains OW-03.

Source changes: new Order actions.ts, thin transition.post.ts, completion identity
and confirmation-first payment tests. Existing Misebox context and fulfilment
map updated. All new and previous changes remain uncommitted; no commit, push,
deployment, Rules, payment or production record changes.
