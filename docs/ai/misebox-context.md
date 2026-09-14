# Misebox GPT Context

Updated: 2026-09-12
Ref: bd23521de
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

## Apps and Workspace

- `misebox-app` is the Main App. `/` deliberately opens the Kitchen Workspace;
  `/product` is the separate product landing surface.
- A guest arriving at `/` is already in the Kitchen Workspace, even before
  saving Kitchen information. Getting started describes its content state;
  it does not mean the Workspace is absent. The Kitchen/Place creation and
  onboarding commands retain their distinct persistence and authority roles.
- The Main App owns `/`, navbar/SEO framing and short Kitchen entry copy in
  `app/pages/index.vue`. The Kitchen-owned Workspace Index composes the shared
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
  focused current-day work belongs on `/` once onboarding prerequisites prove
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
- `fireux-kitchens` owns `WorkspaceKitchenAI`, `WorkspaceKitchen`, target
  loading, selection, creation, authority, and operational capability
  components. Each route supplies its own Kitchen Hero copy directly to the
  shared `WorkspaceHero` primitive.
- Kitchen-enabled tenant Apps receive the authenticated thin
  `/workspace/kitchen` doorway. Their `/` route and brand remain App-owned.
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

## Kitchen and Place

- Canonical Kitchen domain identity is exactly `id`, `identity_source`, `slug`,
  `status`, and `visibility`; audit stamps and proved Kitchen operation
  configuration remain separate root concerns. `identity_source` is `user` for
  an explicitly created shell and `place` when onboarding selects a Place; it
  is independent of Place classification.
- A name-only Kitchen shell may use a generated id while being manifested, but
  its name is persisted on the same-id Place rather than copied onto Kitchen.
- Same-id Place owns venue name, tagline/presentation, address/geo, media,
  classification, price level, currency/timezone, and business hours.
- Kitchen Team owns the roster, role labels and invitations. Its shared person
  editor manages name and linked account. Linked names
  come from User accounts. Kitchen Identity composes the Place-owned editor under
  `place/components/Edit/Identity.vue`; its trusted boundary checks current App
  membership, the Kitchen-owned access grant and the same-id Kitchen/Place.
  Team labels do not grant or revoke workspace access.
- The Main App's User detail composition may append the Kitchen-owned
  `KitchenUserMemberships` relationship surface for the viewed User. Its
  trusted projection is limited to the User themself or a current-App
  administrator/developer, resolves canonical Kitchen and same-id Place
  records, and reports matching Team access without moving Kitchen meaning into
  Core User or mutating inconsistent records.
- Menus and Orders remain their own records beneath their proved owner. Every
  newly created Kitchen atomically receives protected draft `food` and `drinks`
  system Menus, with `food` selected as its initial `menus.primary_menu_id`.
  Their parent-scoped ids may repeat across Kitchens; public root Menu
  projections remain separate and use Kitchen-qualified ids when these defaults
  are published.
- Operations is a Workspace grouping, never a generic stored field.
- Tables remain Front-of-House unless explicit ownership is proved.
- App-support and legacy Kitchen-root operational maps are migration preimages,
  not authority.

Read current Kitchen and Place models plus
`docs/concepts/family-workspace-entity.md`,
`docs/concepts/place-kitchen-media.md`, `docs/concepts/menu-ordering.md`, and
the current Kitchen source and relevant source-owned tests.

## Kitchen and Menu read contracts

Stored contracts remain `kitchen.model.ts`, `menu.model.ts`, and
`kitchen-menu.model.ts` beneath their domain owners. KitchenMenu carries real
Kitchen-owned ordering and presentation configuration; it is not a locator.
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

## Public Menu discovery

KitchenMenu publication reuses the root doorway for the same Kitchen id and Menu
id in the owning database, even when another App performs the edit. The original
`source.app_id` is retained; the current editor App must not create a second
doorway. The named publication/sync operation archives redundant projections
without deleting their records. See `menu/server/draft/root-entry.ts` and
`src/test/menu-root-publication.test.mjs` in Kitchens.

Public Menu directory/detail, customer Order status/history, Team projections
and the other mutable Misebox server readers consume Core's live read transport.
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
The server resolves optional Kitchen enrichment and exposes existing system
Food/Drinks classification as `content_kind`, independently of editable names.
Unclassified/custom content remains in Everything; do not guess cuisine or
content type from ids. Search uses published names, descriptions and venue names;
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

Menu presentation uses only `theme.palette`: Menu override, Kitchen palette, or
neutral defaults. Place identity supplies names and imagery, not fallback colours.
`menu/server/payload/theme.ts` resolves the palette; `useMenuThemeSurface` renders
it for live and demo consumers. The same surface scopes Nuxt UI semantic tokens
for controls, text, backgrounds and borders; it never changes the host AppConfig.
Menu-specific layout CSS consumes the same resolved values. Kitchen owns the
default palette, Menu owns an optional override, and App owns its shell theme.
Public payloads expose no PageStyle aliases.
Kitchen's palette editor reads `theme.palette` and writes the same four-colour
contract through the trusted theme command. The obsolete typography editor and
its unsupported style-save queue are removed. App typography remains App-owned;
Menu typography customisation has no current stored contract.

### Theme and capability entitlement decisions

Accepted product policy:

- Keep today's theme inputs to background, text, accent and text-on-accent
  (`canvas`, `text`, `accent`, `accent_contrast`). Add options only for demonstrated
  client needs. Logos, photography and content remain separate from theme data.
- App owns its interface theme; Kitchen owns the restaurant default; Menu may
  own an explicit override. Shared rendering uses Nuxt UI tokens locally, without
  changing the host App's navigation theme.
- Free users can use the default presentation. Editing Kitchen/Menu theme values
  requires the paid tier referred to as Premium in product discussion, or above.
  Resolve this against the existing subscription model and public tier names;
  do not introduce a second tier vocabulary or infer entitlement from App role.
- Downgrading does nothing to stored work or appearance. There is no preserve,
  reset, migration or cleanup action. Current subscription determines which
  actions may be performed next; further theme changes require the paid tier.
- Apply the same principle across capabilities: each domain defines its Free and
  paid actions, enforced through shared entitlement mechanics in UI and trusted
  commands. Public rendering does not depend on the viewer's subscription.

These are accepted requirements, not a claim that all gates are implemented.
Verify theme editing against Kitchen `server/identity/theme.ts`, Menu theme
commands and their editors before declaring subscription enforcement complete.
The current palette pipeline is separate from a future preset-picker UI.

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
focused record and individual tools on the right. Compact and open Test forms
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
has no detail route, discovery or client capacity framework. Landing, Team and Test keep the
local collection toolbar → Hero → visible AI → collection/focus order described
in the Workspace family map; verify it against current components.

Kitchen Menus places visible AI directly beneath the toolbar selector, then
uses the shared collection-left / focus-right Workspace capability layout
through `useKitchenMenusContext` and its named Menus components. The focused
Menu has compact domain actions rather than oversized action cards or generic
CRUD bars.
Its selector chooses Menu records inside the active Kitchen. Creation and
reading belong with the collection; editing, pricing and publication actions
belong with the selected Menu. The Menus entry does not append the cross-food
navigation, discovery or guiding-literature surfaces. Their underlying sources
remain available for other consumers.

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
collection and individual/edit presentation to its named Index children; its Index
coordinates one Add modal for the collection, empty state and AI action callback;
shared Test and Team use their named Collection and Individual children. Shared
workspace framing owns placement only; children own local control state and use
Nuxt UI directly. This is the adoption basis for shared and Kitchen domain
capabilities when touched, not evidence that all current capabilities conform.

Kitchen Team's route binds `useKitchenTeam` and page framing. Its domain Team
Index owns role endpoint/suggestions, assignment wiring and invitations, using
Core Team children. Project is the comparison sibling, and both domain
controllers consume `useTeam`; see the Team construction contract in
`docs/concepts/family-workspace-entity.md`. Do not move domain role orchestration
back into the route or add domain branches to shared Team components.

Selector capability rows in Menus, Team and Test use Core `Workspace/SelectionRow.vue`
for selected, hover, spacing and keyboard-focus styling. Focused editors use
Nuxt UI `UCard`; each domain owns the contents and commands. The shared
`Workspace/Capability.vue` owns the list/focus layout.
