# FireUX GPT Context

Updated: 2026-08-23
Ref: 7f18d4e91
Role: living context
Scope: repo-wide

This is the single context entrypoint for external GPTs working with
`fireuxlabs/fireux-mono`.

## Context architecture

The root `AGENTS.md` is a short router. This file owns durable repo-wide GPT
context. Scoped files under `docs/ai/*-context.md` own durable scope-specific
context for recurring products, ecosystems, package families, or dedicated
chats.

Current scoped context entrypoints:

- Apps That Slap: `docs/ai/apps-that-slap-context.md`
- BuenoHost: `docs/ai/buenohost-context.md`
- Identity and product literature: `docs/ai/identity-literature-context.md`
- Misebox: `docs/ai/misebox-context.md`
- Landing templates: `docs/ai/templates-context.md`
- Werkbox: `docs/ai/werkbox-context.md`
- Firestore mutations: `docs/ai/firestore-mutations-context.md`

Cross-family composition follows the one-way, domain-owned layers in
`docs/concepts/lasagne.md`. Treat that map as the extraction test for entity
composables, provided workflow contexts, and structural shells; do not infer a
universal `useX` umbrella or a universal entity component API from visual
similarity.

Use `docs/concepts/*.md` for topic maps and `scripts/guards/*` for executable
shape rules. Do not copy implementation details into AI context when current
source or a guard is the better reference.

Family work starts at `docs/concepts/spine.md`. Its registry routes every
currently documented family and cross-cutting spine to the smallest relevant
map, owns the controlled named-sibling growth lifecycle, and summarizes the
alignment queue. Growth phase and difference state are separate: every family
difference must still be classified as accepted, migration, drift, or
to-confirm; see `docs/concepts/documentation.md`.

Product literature starts at `docs/concepts/product-language.md`. Derive copy
bottom-up from current source atoms and child surfaces. Each parent summarises
its children; ecosystem and landing copy summarise the proven product tree
without inventing a parallel marketing vocabulary.

Package runtime filesystem ownership starts at
`docs/concepts/runtime-filesystem.md`. The root technical spine is reserved for
cross-entity shared code and Nuxt entrypoints. Entity-owned implementation
lives under the finite scoped spine
`src/runtime/<entity>/{components,composables,models,server,utils,demo,tools}`;
`demo` and `tools` remain optional and empty symmetry is forbidden. Workspace
is the authorized product surface and canonical `/workspace/**` route family,
not an entity owner. Existing Workspace-named symbols and `/api/workspace/**`
remain internal implementation and transport vocabulary during migration.
Shared Workspace primitives remain in the root spine, while an entity's Workspace
adapters live under that entity. The declared App, Ecosystem, User, Project, Place, Job,
Marketplace Store, Product, Kitchen, Menu, Ingredient, Supplier, Portfolio,
and Property families use that scoped runtime now. Their completed legacy
paths are rejected by `scripts/guards/runtime-ownership.mjs`, and scoped Nuxt
discovery is checked by `scripts/guards/runtime-registration.mjs`. Confirmed
parent-owned records and operations live beneath their parent Entity scope;
to-confirm concepts remain on their owning package spine until their model
decision is explicit. Do not invent an Entity root merely to make the tree look
symmetrical.

## Refresh instructions

Before each task:

1. Use the current default branch of `fireuxlabs/fireux-mono`, not a cached or
   previously uploaded snapshot.
2. Read the root `AGENTS.md` and this file completely.
3. If a relevant scoped `docs/ai/*-context.md` exists, read it before editing.
4. Start with `docs/concepts/fireux-mono.md`, then read the smallest relevant
   concept map for the task.
5. Inspect the current source, nearest working sibling, and relevant
   `scripts/guards/*` files before making claims or proposing changes.

## New-work entry test

Before treating a task as a new system, ask whether the work can be expressed
inside an existing FireUX family using current Core, Nuxt UI, domain
capabilities, and named components.

For every new product surface, ecosystem capability, or proposed shared
abstraction, establish before editing:

- the existing family;
- the nearest working sibling;
- the Core, Nuxt UI, and domain capabilities that will be reused;
- the smallest genuinely new domain-owned delta; and
- explicit non-goals.

Begin with an ordinary FireUX page, named capability, or domain component.
Do not create a system, engine, registry, framework, or shared abstraction from
one consumer.

When the work is a genuinely new family, use the controlled sibling lifecycle
in `docs/concepts/spine.md`:

- complete one independently useful named baseline at the seam being tested;
- create a second real member in its own names and ownership boundary; it may
  begin as a bounded structural copy of the baseline;
- reuse established Core, Nuxt UI, domain, safety, and lifecycle fundamentals
  from the first save while keeping member entrypoints such as
  `useXCollection` independently editable;
- materially differentiate the proving sibling, then compare authority,
  inputs, outcomes, lifecycle, structure, and behaviour; and
- extract and guard only the contract that remains shared after that
  differentiation.

An early family protocol is valid when its identity, readiness, safety,
authority, or outcome requirements follow independently from current product
and domain truth. Record that evidence and let every sibling adopt the protocol
from its first save. Do not use copied member structure as the evidence.

Initial equivalence is a construction technique, not evidence. A nominal
placeholder, renamed alias, branded fixture, or second consumer of the same
member is not a proving sibling. If the existing family cannot express the
requirement, report the exact missing seam before broad edits.

## Task identity

- A task title and its explicit handoff define its working scope. Treat an
  unqualified product question in that task as referring to that scope before
  asking the user to disambiguate. For example, a Misebox task answers a
  question about pricing as Misebox pricing unless the user names another
  product or the surrounding context makes the reference genuinely ambiguous.
- At task creation, state the scope, current checkout, and any relevant scoped
  context in the handoff. Reconfirm only when the task's scope changes.
- Repository saves require the complete guard suite and Git hooks to pass from
  a current upstream base. `pnpm gitsave` provides no bypass for those rules
  and refuses a save when another task changes the shared worktree during
  verification. Every task that edits the repository runs `pnpm guard` before
  handoff; focused guards are iteration feedback, not a completion substitute.
- Permanent product source under `packages/`, `projects/`, and `tools/` must
  remain at or below 400 lines per authored code, style, or Rules file. Split
  responsibilities into named owned seams; there is no allowlist or scope
  switch. Operational `scripts/` are outside this product-source boundary and
  remain governed by script safety, usage, and lifecycle guards.

## Parallel AI work and integration ownership

- Cross-machine task ownership uses the repository skill at
  `.agents/skills/fireux-handoff/SKILL.md`. Git carries the verified code
  checkpoint; its continuation capsule carries only task reasoning that
  current source, history, guards, and living context cannot reconstruct.
- Every concurrent repository worker uses its own local clone or Git worktree
  and its own branch. Never let two workers edit the same branch concurrently.
- Designate one task as the integration lead before parallel implementation
  begins. The integration lead owns the target branch, acceptance criteria,
  architectural consistency, integration decisions, and final verification.
- Specialist tasks own bounded candidate changes. Their handoff must state
  assumptions, decisions, changed files, verification results, and unresolved
  risks.
- The integration lead inspects the complete diffs and relevant commit history
  before integrating. A conflict-free Git merge is not evidence that two
  changes are logically compatible.
- Do not merge parallel branches mechanically. Select the strongest coherent
  foundation, then merge, cherry-pick, or manually incorporate only compatible
  work from the other branches.
- Review the combined result for duplicated logic, inconsistent abstractions,
  security regressions, and unrelated changes. Run focused checks while
  integrating and the repository's complete handoff verification afterward.
- Only the integration lead may present the combined result as ready. Product
  or architectural decisions with meaningful trade-offs remain subject to
  user approval.

## Authority

- Current code, executable guards, and tests are implementation truth.
- `docs/ai/*-context.md` files are living GPT entrypoints, not implementation
  substitutes.
- `docs/concepts/*.md` files are navigation and working-context maps, not canon.
- Deleted docs, old chat-context files, old README content, cached repository
  snapshots, and remembered implementations are not authority.
- If current repository files cannot be read, say that the context could not be
  refreshed instead of presenting stale knowledge as current.

## Dev server ownership

- Treat a healthy app server from the current checkout as persistent workspace
  infrastructure. Verify and reuse it through `pnpm dev:<app>`; do not create a
  duplicate or restart, kill, or take ownership of it at task boundaries.
- `pnpm dev:<app>` is the fast incremental-development path: it rebuilds the
  required FireUX Core config helpers, starts or reuses the app, and waits only
  for readiness. Use `pnpm dev:<app> -- --checked` when a fresh start must also
  run `nuxi prepare` and the app's route smoke suite; preparation and smoke are
  verification work, not a prerequisite for every local edit.
- Shared App configuration watches each enabled FireUX package module entrypoint
  and its current `src/config/module` sources. Registration edits therefore
  restart Nuxt and regenerate Nitro imports instead of leaving a running App
  bound to moved or deleted handlers.
- Prefer user-owned IDE or toolbar servers. Start one from an agent task only
  when none exists and live verification needs it. Replace it with the explicit
  `pnpm kill:<app>` command only when the user asks or a concrete runtime change
  requires a restart; never replace a listener from another checkout. Explicit
  `--host` requests normal terminal ownership: the dev wrapper replaces any
  same-checkout listener and starts a fresh network-visible server rather than
  silently reusing it.
- Developer identity is Firebase-project-specific. The shared dev launcher
  removes inherited `DEVELOPER_ID`, `DEVELOPER_UID`, and
  `NUXT_PUBLIC_DEVELOPER_ID` values before Nuxt loads the selected App's local
  `.env`; never copy one ecosystem's Auth UID into another ecosystem.

## Shared page navigation

- FireUX Core owns the default Nuxt page-transition config and its matching CSS
  integration. Navigation remains real Nuxt routing with clean URLs; the
  transition changes presentation only.
- Core also discovers the conventional App-owned
  `app/assets/styles/main.css`; projects own the stylesheet contents without
  repeating its Nuxt registration.
- Keep layout transitions disabled by default so persistent layout chrome stays
  mounted when the route keeps the same layout.
- Apps inherit the Core transition unchanged. A genuine route exception belongs
  in page meta; a repeated App-wide need must be promoted to its owning shared
  seam. Do not attach transition props to app-shell `NuxtPage` instances or
  copy the shared generated-selector CSS into projects.
- Start at `packages/core/fireux-core/src/config/app/nuxt-baseline.ts` and
  `scripts/guards/css-system.mjs` when this contract changes.
- Direct Workspace pages require authentication by default. A browse-only route
  may opt into `workspaceAccess: 'public-entry'` with `requiresAuth: false` only
  when it also requires no selected entity. That public entry may mount only
  reads or commands whose trusted boundary explicitly authorizes the current
  Firebase identity, including an anonymous identity where the domain permits
  it; the route itself grants no authority. The Workspace page guard enforces
  the route metadata exception, and the page owns the corresponding anonymous
  composition boundary.

## Entity detail pages

- Build detail pages as explicit entity-owned layers. User owns its reader,
  page facts, permissions, and profile presentation; App owns the equivalent
  App family. Do not introduce a cross-entity detail engine merely to remove
  repeated pending, missing, failure, status, or SEO lines.
- Align sibling pages by contract and anatomy: one canonical Entity plus named
  related records, derived facts, route facts, truthful HTTP status, semantic
  theme tokens, and named entity presentation. Small readable duplication is
  preferable to runtime registries, generic page metadata, component-path
  configuration, or environment branches in Core.
- A project may own a detail page when its authority or product composition is
  genuinely different. FireUX owns its platform-directory App detail; ordinary
  ecosystem Apps inherit the Core App detail. Keep the two aligned as siblings
  without pretending that their readers and page responsibilities are equal.
- Do not prefix normal Entity types, endpoints, components, composables, or
  routes with `Public`. A root Entity document is the readable canonical
  Entity. Material that cannot be returned with it belongs physically under
  Auth, App access, Team, Finance, or an operational owner. Standard protocol
  terms such as HTTP `Cache-Control: public` retain their defined meaning.
- Start at `docs/concepts/family-entity-detail.md` and the nearest entity page,
  reader and presentation before changing this family.

## Entity capability families

- An entity family owns the complete boundary for one entity: canonical model
  and identity, authorized reads, lifecycle commands, validation and policy,
  derived facts, named Directory/presentation views, events, and the
  page, Workspace, or Tool adapters that consume those capabilities. It is not
  one umbrella composable and it is not CRUD symmetry for its own sake.
- Use responsibility names consistently: `useXDetail` for one routable
  object, `useXFetch` for an authorized canonical or operational read,
  `useXCollection` for a list, `useXCreate/Update/Delete` for commands, and
  `useXInterface` for presentation mapping. A family exposes only the seams
  it genuinely supports.
- `useXDetail` owns `ready`, `pending`, `error`, `refresh`, `statusCode`,
  `missing`, `failed`, and `outcome`, while returning the entity under its real
  name. Align this vocabulary across entities without introducing a generic
  cross-entity detail engine.
- Reserve an unqualified `useX()` aggregate for a real active read/view
  context, such as the authenticated User. Keep commands explicitly imported;
  do not spread fetch, collection, mutations, computed state, interface
  mapping, and SEO into an umbrella merely to make a nominal entity entrypoint.
- Firestore mutations have Client, Server, and MCP/Skill lanes. Those are
  transports into the same entity-owned commands and typed targets; scripts,
  CLI, agents, and Tools do not receive raw collection or database authority.
- Ordinary root and child `useXUpdate` commands accept one typed input object
  with named identity fields and `changes`. Stable setup dependencies belong to
  `useXUpdate(options?)`; transport and authorization remain lane-specific.
  Bound records and genuine transitions, media, membership, or relationship
  capabilities keep their narrower domain contracts rather than pretending to
  be generic patches. `scripts/guards/entity-update-contract.mjs` guards the
  proving ordinary entity family.
- Start at `docs/concepts/composables.md`, `docs/concepts/firestore-entity.md`,
  and the entity's current model, endpoint, composables, and guards.
- Core User, App, Ecosystem, and Project are the proving Core ownership family.
  Their canonical models and entity capabilities now live under the
  corresponding `runtime/<entity>/{models,components,composables,server}`
  roles. Generic App-shell, Workspace, Auth, Firestore, navigation, colour-mode,
  and UI mechanics remain in the root shared/system spine. Profile composition
  remains directly entity-owned rather than hidden beneath `Cards`.

## Public route identity

- Each public entity family declares one exact route key. When that key is the
  Firestore document ID, resolve it with a direct document read; do not query a
  second field or fall back between `slug` and `id` in route construction.
- Kitchen root IDs are stable operational identity. Place-backed onboarding
  uses the linked Place ID; a name-only Kitchen shell uses a generated Kitchen
  ID and may acquire Place identity later. Its authored `slug` is the reviewed public route key and is
  resolved only by the Kitchen-owned bounded server resolver, which rejects
  duplicates. Internal Kitchen, Menu, Order, and Workspace relationships keep
  using the stable root ID; they never substitute the route slug.
- Presentation may fall back between display labels, but display fallback must
  never select storage or route identity.
- `scripts/check-slug-canon.mjs`, registered by `pnpm guard`, enforces this
  contract without migration-word or report-only exemptions.

## Shared Card family

- `Cards/Cell`, `Cards/Pill`, and `Cards/Preview` are dumb, reusable
  prop/view-model-driven presentation. They may format, navigate to a supplied
  target, or emit presentation actions, but never fetch, subscribe, or own
  storage authority.
- Managers, indexes, read/detail controllers, and routes acquire data;
  `useXInterface` and named projectors create bounded view models; Profile,
  Detail, Order Ticket, Catalogue, and other specialist compositions remain
  separate families.
- Entity debug is part of the completed surface check. Index debug passes the
  canonical entity array directly as `objects`; detail debug passes its one
  canonical entity as a one-item `objects` array. Relationships and page state
  belong under `derived`, and `include-route` adds route metadata exactly once.
- Existing guarded `Cards/Profile` paths are migration debt, not precedent for
  new Cards. See `docs/concepts/card-family.md` and
  `scripts/guards/components.mjs`.

## Collection naming and scope

- An unqualified entity collection is the canonical/default collection. Use
  `XCollection`, `useXCollection()`, and `XCollectionManager` for that default
  family.
- A root Entity document is wholly readable as that Entity. Do not place a
  protected `entity.private {}` object inside it: Firestore document reads are
  whole-document reads and Rules cannot redact nested fields. Move protected
  material to its honest separately authorized owner instead.
- A bounded collection must name its scope, for example Kitchen Menus,
  Supplier Items, App Users, or Portfolio Properties. Scoped collections do
  not masquerade as the default collection to reuse its manager.
- API versus direct Firestore is an authority/transport decision, not a
  collection-family name. A default collection may use a server reader when
  joins, cross-database access, SSR status, or server-only validation make
  raw client reads unsafe.
- Do not add `Public` to ordinary collection family names, Entity types,
  endpoints, DTOs, components, or composables. Use product terms such as
  `published` only for an actual lifecycle/eligibility state.

## Entity canon

- A canonical entity model answers only what one persisted singular document
  is: plural Firestore collection, singular exported type, and explicit stored
  fields. Keep storage/path declarations, Entity classification, defaults,
  command inputs, projections, directory fields, runtime configuration, and
  derived values out of that model. Independently stored membership, Team,
  and support documents retain their own singular models. Server enrichment
  composes canonical types at the read boundary; it does not alter either
  stored model or require a new product noun. App, Ecosystem, Project, User,
  Place, and Kitchen are the guarded proving family for this rule.
- Canonical entity models and their entity-owned support records belong under
  `runtime/<entity>/models`. App, Ecosystem, User, and Project follow the same
  filesystem ownership rule as extension entities. `User` is the person and
  `AppUser` is App membership; that meaning does not justify keeping their
  contracts in a generic Core entity bucket.
- Root `runtime/models` contains only contracts genuinely shared across
  entities, such as stamps, scope fragments, entity declarations, bounded
  projection vocabulary, and shared style vocabulary. Entity-owned contracts
  and typed catalogues belong in that Entity's `models`; normalization and
  formatting belong in its `utils`; UI controller state belongs in its
  `composables`.
- App, Ecosystem, User, and Project models now live in their entity scopes;
  their owned support records moved with them. Root `models/operations`
  retains only genuinely shared coordination records. Do not reintroduce a
  generic `supporting`, `system`, or `operations` bucket to avoid naming an
  entity. Modules remain source-controlled package and App configuration, not
  stored entities.
- Source organization does not hide stored-data debt. Membership documents
  determine App access, User-owned profile documents determine profile state,
  and root-owned Team records determine Workspace access. Retire
  `users/{uid}/private/targets` and App-nested Workspace access arrays during
  the owner-first Firestore migration. `App.derived.user_count` and App
  build/database metadata remain migration candidates. Use
  `docs/concepts/core-models.md` as the ownership and migration map.
- Private AI memory about a User is ecosystem-scoped operational support at
  `users/{uid}/private/context`, using the Core `UserContext` contract. Core
  defines its protected storage and authenticated access seam; each active
  ecosystem identity database owns its own context string. Do not place this
  memory on the publicly projected User root, copy it into AppUser membership,
  or promote ecosystem knowledge into a cross-ecosystem Core fact.
- FireUX AI runtime execution has an explicit cost boundary. `disabled` makes
  no response available, `simulator` performs deterministic fixture work,
  `codex` passes the exact provider request envelope to an isolated local Codex
  process, and `app` is the only mode permitted to use a server-side provider
  key. Legacy `dev` configuration is interpreted as `simulator`; merely
  enabling AI must never authorize provider spending. The Codex lane is
  development-only, strips provider credentials, uses an empty ephemeral
  read-only workspace, and must not acquire repository or task context. Start
  at `packages/extensions/fireux-ai/src/runtime` and
  `docs/concepts/ai-document-processing.md` when this boundary changes.
- `fireux-ai` owns the provider-neutral Workspace/operation-agent definition
  contract: Core, User, and ecosystem nodes; parent identity; entity target and
  selection policy; Workspace and operation scope; typed context providers with
  explicit owners; capabilities; tool ids; and shared-inference versus
  independent-on-demand execution. `CoreAI` and `UserAI` are the minimal root
  definitions. Ecosystem packages own their named ecosystem coordinator and
  compose domain-owned Workspace agents; domain packages own operation agents.
  FireUX AI also owns the reusable shared inference instruction. Executing
  agent runtimes compose it with any concise domain instruction owned by the
  domain agent catalogue, then supply live registered tools, authorized
  records, and permissions rather than encoding question-specific responses.
  The guarded Workspace families are Project, Kitchen, Supplier, Portfolio,
  Property, and the structural Blank harness. A catalogue entry is scope and
  metadata, not an automatic model call or permission to read context.
  An executing agent may return one bounded `FireuxAgentTip` to its declared
  parent when a request exposes a reusable missing capability. The product
  strips the tip marker from the user answer and records the structured tip on
  the existing private usage event; tips never create tools or agents.
  Domain packages own their named agent catalogues and never gain tools merely
  by being catalogued. Cross-domain families such as Identity share
  capabilities while retaining named domain agents, authority, and context
  owners.
  Start at `fireux-ai/runtime/agents/operation-agent`, then the owning Entity's
  `runtime/<entity>/models/operation-agents` catalogue.
- Shared framework-neutral primitives are pure definitions under Core
  `runtime/tools/<scope>`; low-level utilities remain in their technical
  implementation roles. Operational tools are domain-owned pure definitions
  under `runtime/<entity>/tools/<scope>`. One fully qualified id owns the tool's
  model-facing context, input schema, confirmation and risk policy, human and
  agent surface policy, and result contract. Human toolbar adapters,
  operation-agent tool ids, live model tool declarations, and server executor
  registries project from that definition; none owns a second description or
  local id. Prompt suggestions are not tool-authored examples: an operation
  agent infers them from the complete registered capability set, current
  authorized records, and permissions, with session caching and a deterministic
  no-token simulator lane. Authoritative domain commands remain below this
  layer, and both REST and agent executors call those commands so AI never
  becomes a parallel mutation authority. Kitchen Team is the guarded proving
  family. Its current source lives at
  `fireux-kitchens/runtime/kitchen/tools/team`; the active Team-tool experiment
  keeps that local subsystem `to-confirm` without changing its Kitchen/Team
  ownership. Core iframe Tool
  Providers are a separate transport family and must not be merged into this
  operational command registry.
- A canonical Live model owns each root or parent-scoped entity contract.
  Demo and Test roots use that same model contract; fixture wrappers and public
  DTOs never become alternate entity authority.
- Runtime seed objects are named `*Defaults`, not `*Model`. Entity files keep
  root, Team, operation, and protected-support storage declarations separate,
  and entity-facing
  `useXDetail`/`useXInterface` composables sit above Firestore adapters. The
  executable detail is maintained in `docs/concepts/firestore-entity.md` and
  the relevant authority guards.
- Canonical User identity has one root, `users/{uid}`. The Firebase Auth UID is
  the stable document id and the public handle is an editable field on that
  User. Do not create parallel `handles`, `user-handles`, or
  `user-handle-state` roots, compatibility reads, or duplicate writers.
- AppUser contains only App membership and governance. User profiles,
  Workspace Team, operations, and protected support live beneath their owning
  User or Workspace Entity; they do not copy root identity into App.
- A root Entity reader returns that canonical Entity. Transport may add paging
  metadata, named related records, or an honestly named presentation view, but
  it does not rename, filter, or replace the Entity as a privacy mechanism.
  Protected material belongs under its actual owner. Classify one owning
  family at a time through `scripts/_lib/entity-matrix.mjs`,
  `scripts/guards/entity-matrix.mjs`, and `docs/concepts/entities.md`; do not
  infer Entity status from folders, collections, routes, or UI symmetry.

## Shared UI baseline and design packs

- Nuxt UI is the universal App baseline. Core `main.scss` may own shared
  anatomy, rhythm, accessibility, and semantic browser contracts, but it does
  not impose an ecosystem aesthetic.
- Kitchen discovery cards are owned by `KitchenCardsCell`; Place cards remain
  Place-owned. They may reuse proven lower-level Core and Nuxt UI primitives,
  but visual similarity does not create a generic public-entity card or header
  API. Their detail headers remain separately named and domain-owned as
  `KitchenHeader` and `PlaceHeader`.
- Core `LandingProductIndex` owns the Main App product-landing region
  vocabulary and default order: `hero-preview`, the `onboarding` entry slot,
  `surfaces`, `workspace`, `specifics`, `ecosystems`, `apps`, `tools`,
  `solutions`, then `operations`. An App may pass `regionOrder` as an ordered
  subset of those named regions so unavailable product layers disappear
  without copying the shared renderer or inventing a project-local region. The
  optional
  `hero-preview` seam accepts an App-owned, reviewed product presentation.
  FireUX fills it with the live App and Ecosystem Card orbit. Static Main App
  hero photography uses Core `LandingProductHeroImage`, which owns one sharp,
  clipped frame without atmospheric blur or edge fades; Apps own only the
  reviewed image, alternative text, and focal position. Static ecosystem hero
  photography shows people doing that product's real work. FireUX's live orbit
  and Misebox Kitchen's product-surface composition are the two explicit
  non-people hero exceptions.
  Core keeps each hero image sharp outside a responsive desktop-only blur band
  running the image's full height when the oversized heading overlaps it. The
  measured overlap controls a long horizontal fade; the shared Hero recomputes
  it as copy, fonts, and viewport geometry change. The copy is untreated, and
  stacked layouts resolve to no blur. A bounded desktop fallback keeps the fade
  attached to the image edge when motion briefly removes the measured overlap,
  and the mask reaches transparency before its filter region ends.
  Reviewed static product hero sources are standardised at 1600 x 1000 pixels
  (16:10), 8-bit opaque RGB PNG, no larger than 2.5 MB. The landing guard owns
  the executable file contract; Apps retain subject, alternative text, and
  focal-position ownership.
  The onboarding slot owns exactly one truthful public entry decision, not
  account onboarding. `LandingProductEntryPaths` is the shared ordered
  `start` and `join` choice plus an optional subordinate Tool doorway,
  including its icons, card anatomy, mobile-first layout, compact hero-strip
  variant, and reveal behavior. Main ecosystem Apps use the onboarding slot
  for Core `LandingProductPricingStrip`: Free, Pro, Managed, and Your App are
  the common public entry choices immediately after the Hero.
  `scripts/guards/product-landing.mjs` discovers every project adapter that
  consumes `LandingProductIndex` and requires exactly one approved entry
  component in that slot. `LandingProductProofSection` owns the repeated proof-and-copy
  composition and its explicit copy-emphasis variant for sections where the
  explanation must carry more visual weight,
  `LandingProductCatalogue` owns the shared catalogue grid, and
  `LandingWorkspacePreviewFrame` owns the responsive target rail, operation
  navigation, selected heading, and persistent full-Workspace doorway shared by
  the FireUX Project and Misebox Kitchen proofs. Each project retains its
  Workspace capability catalogue, target Card, Demo adapter, selection, and typed body
  children; unsupported or private operations remain truthful neutral states.
  These surfaces use flat semantic Nuxt UI treatments without decorative
  gradients or flares. Product Apps retain truthful data, copy, routes, and
  proof and may omit any unavailable slot; FireUX places its Ecosystems section
  before Apps and does not fabricate a Tools catalogue. FireUX alone owns the
  platform Ecosystems landing section. An ecosystem Main App shows its Apps
  section only when more than one active child App remains after excluding the
  Main App itself; its heading is only `<App name>'s Apps`. Main App heroes use
  `Get started` and `Go to workspace` as their primary action pair while each
  project retains its own destination routes. Core `useLandingMotion`
  coordinates the shared semantic hero parts and each App-owned preview through
  one responsive GSAP timeline; Apps retain the preview and do not import GSAP.
  FireUX, Misebox, Werkbox, BuenoHost, Bringli, and Granite use the shared Main
  App immersive section dwell while retaining project-owned proof, product
  language, routes, and later sections. Slap retains the shared Main App
  anatomy but is an accepted interaction delta: its brand-commerce landing
  opts out of the shared section dwell rather than copying or overriding Core
  sticky CSS.
  Core owns the exact Main App Hero font family and display weight. Every Main
  App consumes those Core tokens; typography must not depend on which Tailwind
  utilities an App happens to compile. Product-specific typography requires an
  explicit owned delta.
  Section One is the two-part Hero only: product title/actions on the left and
  App-owned visual proof on the right. Subscription pricing follows the Hero
  and does not enter its pinned grid. Product surfaces follow pricing. A
  one-surface App presents that surface directly without a selector or visible
  `Surfaces` label; a multi-surface App may provide a selector. Workspace
  Operations remain navigation within a Workspace and do not become separate
  product surfaces. App-owned deeper feature sections follow the surface
  presentation.
  Core `usePricing` owns the common commercial meanings and
  CHF amounts: Free is a functional Workspace, Pro is CHF 20/month self-managed,
  Managed is CHF 50/month with bounded FireUX assistance, and Your App is CHF
  600 setup followed by Pro or Managed. FireUX alone adds Your Ecosystem at CHF
  1,200 setup plus CHF 50/month maintenance and a 50% customer-App revenue
  share. Each Main App owns one `useXPricing` wrapper with its Workspace
  capabilities, limits, name, and contact; pricing literature never enters
  `defineFireuxConfig` or public runtime config. Tenant Apps do not acquire the
  ecosystem-owner literature. Main Apps place Core
  `LandingOperationRail` above Section One and supply only their own working
  Workspace capabilities. Every Workspace Entity has Index, Overview, Identity,
  Team, and shared Notifications; permissions underpin them rather than
  becoming a navigation page. Entity operation catalogues contain only the
  Operations listed in `docs/concepts/workspace.md`. Public product directories never masquerade as
  Operations. That rail sticks
  beneath the header, then exits upward as the shared pricing strip approaches
  the same edge. Pricing exposes no visible heading and compacts without
  residual detail rows to plan names and prices while later content continues
  beneath it.
  Immersive desktop landings use the
  same scoped Core motion context for a pinned copy-to-proof handoff, optional
  App-owned semantic entity participants, and section-owned reveal markers.
  Each major product region holds briefly at the viewport edge
  before releasing, so adjacent sections remain distinct without trapping
  phone or reduced-motion scrolling. Slotted components retain their own internal reveal markers;
  compact and reduced-motion modes do not inherit that choreography.
  Every
  `LandingCardOrbit` declares
  exactly one `demo` or `live` data source. Its owning adapter supplies the
  complete slotted Card envelope from that source; local orbit ids, labels, and
  coordinates remain presentation metadata, but static entity fixtures,
  cross-source joins, and fallback records do not enter the orbit.
  Core owns one visibility-gated desktop intro with a stable per-mount launch
  vector. It completes two closed turns through one long deceleration, returns
  exactly to the shared main pitch, and hands off without stopping to slow
  autoplay in the same direction. Desktop pointer hover pauses the pack and
  elevates only the selected card in place; it never snaps the shared yaw or
  pitch. Touch tap and root keyboard behavior remain intact. Orbital elements
  remain fully opaque and crisp at every depth; scale and stacking communicate
  distance without blurring card content.
  Mobile and reduced-motion presentations skip that intro. Mobile retains the
  gentle shared autoplay and touch orbit while the document is visible, so
  scrolling past the orbit never freezes its yaw; reduced motion remains
  static.
  FireUX mounts the reusable orbit in its Main App hero as a live public App
  and Ecosystem presentation. Misebox retains its mobile-first
  guest-Menu-to-Kitchen-Workspace handoff
  stage as a dormant project-owned presentation backed by its existing Product
  Demo projection; it is not mounted in the current copy-only hero.
- A main App may explicitly select the typed Core `sci-fire` design pack
  through `app.designPack`. The config helper conditionally bundles its
  stylesheet and Nuxt UI variants; tenant and white-label Apps do not inherit
  it from `role` or `ecosystem`.
- Sci-Fire may add restrained atmosphere, app-primary edges, and interaction
  depth while preserving Nuxt UI typography, spacing, radius, colour mode, and
  status semantics. Its ambient accent derives from `--ui-primary`;
  `--ui-info` remains reserved for genuinely informational state. Projects
  keep brand primary colours and content, and must not copy the pack's
  selectors or CSS.
- Core `EffectsAmbient` owns the viewport layer, isolation, content stacking,
  and print suppression for the Main Apps' project-owned landing artwork.
  FireUX Stars and Misebox Steam stay with their App and provide a
  reduced-motion state. Stars uses Core's deterministic SSR-safe field helper;
  Steam retains Misebox's client-initialized puff treatment behind the shared
  page layer.
- Start at `config/app/design-packs.ts`,
  `runtime/assets/styles/design-packs/sci-fire.css`, and
  `scripts/guards/css-system.mjs` when this contract changes.

## Shared PWA manifest authority

- FireUX Core exclusively owns the runtime `manifest.webmanifest`; project Apps
  do not add static manifests or emit their own manifest links.
- The shared App shell versions its manifest URL with Nuxt's per-build
  `runtimeConfig.app.buildId`. The Core manifest keeps stable identity with
  `id: '/'` and applies the same build version to configured 192px and 512px
  icon URLs while preserving their existing paths and query strings.
- When no build id is available, Core leaves manifest and icon URLs unchanged.
  Start at `App/Shell.vue`, `manifest.webmanifest.get.ts`, and the project guard
  when this contract changes.

## Workspace target and onboarding authority

- FireUX Core owns the single `/auth` route and its sign-in, registration, and
  authenticated redirect behavior for every App. Core User onboarding owns
  account provisioning.
  Entry links may declare `mode=sign-up` and a same-origin `redirect`; the
  destination owns any domain onboarding after authentication. Project Apps
  supply identity and branding through shared assets; they do not add local
  `/auth`, `/login`, or `/register` pages or auth presentation in App config.
- `/auth` establishes Firebase identity only. Routine auth-state changes never
  provision or repair a User, UserAccount, AppUser, or avatar. The protected
  `/users/create` doorway owns explicit current legal acceptance and User
  provisioning, preserves its original same-origin destination, and creates
  the current AppUser only when that App permits self-service joining.
  Re-entering that explicit journey may idempotently repair required fields on
  an existing User or current AppUser without changing its handle, role,
  entitlement, onboarding completion, or legal evidence.
- A newly created App membership publishes one deterministic
  `app.user.joined` event under that App. The event is the durable signup log
  and atomically creates an owner-only in-app notification for each existing
  App admin; routine returning sign-ins do not create events or notifications.
  Both the event and notification projection are App-database facts; User
  identity remains in the identity database, but notification clients must not
  cross that boundary to find an App-owned projection.
- Cross-Project signup replication is retired. App membership events remain in
  their owning Project database; the control plane does not mirror them into a
  directory, monitor, or user index.
- AppUser persists orthogonal App authority, subscription, and lifecycle:
  `role` is `user | admin | dev`, `subscription` is `free | premium`, and
  `onboarding_status` remains `pending | completed | skipped`. A stored Dev
  role has developer authority and the explicitly intended App-admin
  capabilities, but it never changes or implies subscription. Profile
  documents, not User/AppUser
  arrays, are profile authority. AppUser never duplicates Workspace Entity
  ownership or access; each root Entity's `team/{uid}` records are that
  authority.
- Free is the effective product subscription when AppUser is absent. This does
  not create a User, AppUser, role, or membership; `hasMembership` remains
  false, and only a canonical stored Premium subscription enables Premium.
- User list and detail readers return canonical User identities. On a tenant
  runtime, candidate visibility comes only from exact valid
  `apps/{appId}/users/{uid}` memberships before the root User join; a guessed
  global handle never establishes tenant visibility. Global runtimes retain
  the ecosystem-wide User catalogue.
- A family core owns the authoritative target items, outcome, and selection
  validity. Index and overview adapters consume that state; they do not create
  a second membership or target-outcome authority.
- Authenticated dashboard surfaces consume the canonical current App plus the
  caller's separately owned membership through a server reader. They do not
  browser-read App-user authority merely to render overview state.
- The signed-in User's owner-only `private/account` state follows the same
  boundary through `/api/internal/user/account`; onboarding and dashboard
  availability must not depend on browser Firestore Rules permitting that
  private read.
- User onboarding copies the supplied avatar or ecosystem default through the
  authenticated `/api/internal/user/avatar` server Storage boundary before it
  writes the canonical User. Browser Storage Rules are not the provisioning
  path, and a local `/img/...` placeholder is never the persisted avatar.
- Live Workspace families derive bounded targets from canonical roots,
  family-declared management relationships where present, exact AppUser
  membership, and root-owned Team records. Missing roots, invalid declared
  relationships, invalid Team state, or missing caller membership fail closed.
- Production onboarding for those families uses a fixed-runtime domain
  endpoint. It is authenticated by default; an explicit family command may
  accept a Firebase anonymous identity for a bounded shell creation flow. One
  trusted transaction creates or attaches the canonical root and creates the
  caller's root-owned Team authority. Operators may
  mutate; members have target/read membership only; current App admins are the
  explicit override for Entities managed by that App.
- Workspace-capable roots whose canonical model declares a host relationship
  use the shared cumulative management contract:
  `{ mode: 'root' }`, `{ mode: 'workspace' }`, or
  `{ mode: 'app', app_id }`. `workspace` resolves through the ecosystem package's
  conventional `<ecosystem>-app`, while only `app` stores an App id. The
  relationship selects the host surface; it never creates App-nested Entity
  storage. Core must not enumerate extension Workspace families or own a
  generic domain-root factory; each domain owns validation and its trusted
  root/Team transaction.
- Kitchen is the accepted domain delta: it stores no management field. A
  Place-backed Kitchen uses the same-ID Place, while a name-only shell can
  begin from its minimal root and root-owned Team before Place enrichment.
  Current Firebase identity, App policy where required, and Kitchen Team provide
  the creation and target evidence. Blank remains the small harness, and Project
  remains a read-only control-plane family. Those are domain deltas, not
  alternate target or onboarding spines.

## Demo World boundaries

- Package and project owners may provide deterministic read-only Demo World
  modules under their guarded Demo roots.
- Workspaces load their owner's fixtures lazily through `useWorkspaceDemoData`. A
  project Product Demo surface may instead compose its project and
  package-owned worlds through one named
  `app/composables/product-demo/use*ProductDemo.ts` adapter. Each independently
  loaded surface declares a unique `productDemoSurface` and the literal
  `productDemoDataSource = 'demo'`; duplicate surface adapters are forbidden.
- Every Workspace family that accepts the shared Demo source must carry its own
  lazy owner-local adapter and preserve the Live-relative target, selection,
  and selected-parent operation shape.
- Demo scenarios name their owning App and Workspace adapters filter by that App
  before projection. Fixtures use each family's current model declaration:
  Workspace families provide root-owned Team authority, required linked roots
  such as Place remain separate model-shaped records, and families do not
  invent support records for symmetry.
- Test is not a generic fallback collection. When a family has no atomic
  canonical simulation producer, its Test source fails closed instead of
  reading or writing a default-database `test-*` alias.
- Public Product Demo pages use the reserved project `/demo` route family and
  consume that adapter. Direct fixture imports elsewhere remain forbidden.
- Demo World never becomes live public-content authority or a test, simulation,
  Firestore, Storage SDK/API, server, admin, or mutation seam. A fixture may
  hold a fixed public HTTPS URL for immutable presentation media under an
  app-specific guarded `demo/` Storage prefix; that inert field value grants no
  runtime Storage authority. Storage is authoritative for Demo-owned image
  binaries, so repositories retain only guarded object metadata rather than a
  second Demo binary mirror. Canonical Live media never moves into Demo merely
  because a Demo consumer displays it; it remains in the owning family's Live
  publication or storage path.
- Cross-domain fictional contracts belong to the explicit-import-only
  `fireux-demo` extension. Core remains product-neutral; domain packages keep
  their own scenario records, while one Demo contract may be shared without an
  ecosystem-to-extension dependency cycle. See `docs/concepts/demo-data.md`.

## Semantic catalogue boundaries

- `/operations` is the factual index of operations exposed inside the app's
  workspaces. Every declared operation must point to a working `/workspace/*`
  operation route; Overview, Identity, Team, Sundries, dashboards, public
  indexes, and tools are not Operations.
- `/operations` is app-wide and groups entries by their owning Workspace. Prefer
  stable anchors such as `/operations#kitchen`; do not duplicate the index at
  domain routes such as `/kitchen/operations`.
- Each declared operation also receives a factual detail surface at
  `/operations/<slug>` when its owning record declares an app-wide unique
  public slug. It derives its language and working Workspace CTA from that same
  record; it is not a second capability source or an SEO Solution.
- `/solutions` is the authored customer and search-intent projection of proven
  capabilities. A Solution is not evidence that an operation exists.
- Tools are executable utilities and should not be used as a synonym for
  Operations or Solutions.
- `/modules` is the public projection of source-controlled reusable capability
  packages under `packages/extensions/fireux-*`. Modules are their own family:
  apps compose them, and a module may support entities, Operations, tools,
  Solutions, or several surfaces together. Do not present Modules as stored
  entity records or use Firestore Product rows as package authority.
- Blog is the sole universal default App extension. Every App declares its
  direct `fireux-blogs` dependency even though Core adds the module by default.
  Products are future/explicit: only an App with a current Product capability
  declares and loads `fireux-products`.
- Runtime package TypeScript imports are extensionless for both browser and
  server consumers. Every Core, Ecosystem, and Extension manifest maps that
  authored subpath to `src/runtime/*.ts`; `.vue`, `.css`, and `.scss` keep their
  real suffix. Do not repair resolution by adding `.ts` to individual imports.
- App runtime configuration derives from the authored `FireuxAppConfig` and is
  normalized once by the event-aware `useFireUXConfig`; browser and trusted
  server consumers do not reparse raw Workspace config, and Core does not cache a
  partially compared App shape globally. Core `resolveWorkspaceCanCreate` owns
  the shared explicit override and non-tenant fallback.
- App initialization is protected by authenticated server UID authorization
  and existing-admin checks. Do not recreate a cosmetic client developer PIN
  or present one as a security boundary.
- App initialization creates or verifies the canonical named-database App and
  first Admin membership. App media sync and App-admin presentation edits
  update that same canonical App through trusted Server writers; they do not
  maintain a second App projection.
- App presentation is source configuration, not canonical `App` document data.
  Initialization never persists or backfills a theme on `apps/{appId}`.
  Renderers resolve the configured palette and typography without turning Nuxt
  presentation into Firestore entity truth. The same setup action validates,
  uploads, and records the five canonical App Storage masters. Root entities
  never receive App presentation.
- App typography configuration is limited to `display_family` and
  `body_family`. Domain identity editors do not write App presentation into an
  entity document. Template treatments remain readers.
- App initialization requires a fully valid environment, live Firebase
  Storage reachability, and App-owned media check. Dev mode is not authority to
  bypass required configuration, infrastructure, or asset validation.

## Financial fact ownership

- `packages/extensions/fireux-finance` owns product-neutral minor-unit money
  and deterministic immutable FinancialFact primitives. It imports no
  producing domain.
- FinancialFacts are App-scoped support records, not entities, reports,
  general-ledger entries, or Workspace Operations. Raw facts remain server-only;
  P&L and other reporting are bounded derived projections.
- Domain packages retain their named operations and records. A trusted domain
  lifecycle may atomically emit a normalized fact; the dependency points from
  that domain to Finance, never back from Finance to the domain.
- Do not treat a mutable catalogue price, estimate, rent field, or control-plane
  identity as a financial fact. Add producers only when a dated authoritative
  operation exists.

## Shared marketplace authority

- Bringli owns canonical Supplier identity, Catalogue and Supplier Items through
  `fireux-suppliers`. Misebox Kitchens and marketplace Apps consume canonical
  Supplier records through the Bringli server boundary; they do not read
  Bringli Firestore directly or create another Supplier authority.
- `fireux-marketplace` owns App-local Supplier publication Listings, customer
  baskets, and private offline marketplace Order Records. Buyer and seller are
  product surfaces, not AppUser roles. The unshipped Store/Offer prototype is
  migration debt and is not a compatibility contract.
- Supplier operators manage Supplier truth in Bringli; marketplace App Admins
  moderate Listings. Marketplace readers compose the named Supplier, Listing,
  and Item records they require, while all writes and Order reads use trusted
  fixed-runtime endpoints.
- Marketplace prices reuse Finance minor-unit money, but catalogue prices and
  offline order requests do not emit FinancialFacts. MarketplaceOrder and
  KitchenOrder are separate fulfilment families.

## Firebase Auth App domains

- Every ecosystem declares one shared Firebase SSR deployment contract at
  `ecosystemConfig.ssr`. `region` is required; `serviceAccount` is optional and
  names the non-secret execution identity inherited by every App in that
  ecosystem. Apps do not repeat or override either value in
  `defineFireuxConfig`; private credential material remains outside Git.
- Every ecosystem owns a deployable `firestore.template.rules` manifest and
  ecosystem-local `rules/` directory for its Apps and tenants. Core owns only
  reusable Rules fragments, composition, lexical contracts, and verification.
  An ecosystem without released browser policy retains an explicit local
  default-deny fragment; it never omits its Rules authority or uses an open
  placeholder.
- Workspace target IDs are derived from canonical root relationships where
  declared and Team authority,
  not Nuxt configuration or User/App arrays. AppUser contains only App
  membership and capability state; it never mirrors Entity target IDs.
  Route keys and relationship targets are stored data, not build-time App
  configuration. Changing one follows its owning family migration and never
  requires hard-coding the value into Nuxt config.

- New Apps have no provisional unguarded state. Before the first save they
  must satisfy the project App shape, complete public asset family, shared
  auth/PWA, and App registry contracts enforced by `scripts/guards/projects.mjs`.
  Do not treat copying an existing project directory as an App creation
  workflow or defer registration and canonical assets until later cleanup.

- Every deployed App's custom hostname and generated Firebase Hosting
  `*.web.app` hostname must be declared through the shared Firebase deploy
  runner's `--auth-domains` option. The runner additively syncs those hostnames
  before deployment and never replaces existing authorized domains. Hostnames
  never include protocol, path, or port.
- The canonical ecosystem/App creation workflow accepts a public/custom
  hostname through `--auth-domain`, derives the Firebase Hosting
  `<site-id>.web.app` hostname from the scaffold slug (or explicit
  `--firebase-site`), and presents both in one Firebase Authentication
  authorization decision. Interactive creation asks the developer;
  non-interactive creation must pass `--sync-auth-domain` or
  `--no-sync-auth-domain`. A yes decision sends the deduplicated hostname set
  through the same shared additive sync path and never writes a replacement
  domain list.
- Core owns account provisioning and recovery for every App. A Firebase Auth
  identity that predates its canonical User/account evidence must be able to
  finish setup through the shared authenticated surface after explicit current
  Terms acceptance and Privacy acknowledgement; Apps must not implement local
  recovery branches or leave the user in a retry loop that cannot attach that
  consent.

## Firebase Hosting release proof

- The shared Firebase deploy preflight reads the configured Hosting site ids
  from `firebase.json` and fails before build or release when any exact site is
  absent from the target project. Deploy must never silently target a sibling
  app's Hosting site.
- The shared deploy runner verifies the configured public URL after Firebase
  reports success and fails when it receives Firebase's default `Site Not
Found` page. An app may pass `--verify-text` for one public source-defined
  marker when a successful HTTP response alone is insufficient release proof.

## Shared Job authority

- `fireux-jobs` owns one Job root shape and trusted author/read boundary for
  every ecosystem. The current Agent/User is explicit owner authority;
  creator stamps remain audit-only.
- Canonical Company and Place ids are required relationships. App configuration
  may select an explicit product-neutral category allowlist or the shared
  all-category scope plus presentation copy, but may not select a workplace
  entity, materializer, or alternate stored shape. Invalid runtime role or
  tenant identity always makes the Job Directory read ineligible.
- Exact detail returns the canonical Job plus its named Company and Place
  records. The paginated Directory alone uses `JobDirectoryEntry` for joined
  card facts and JSON-safe schedule values; it is a view, not another Job.
- Optional compensation uses the Finance minor-unit money primitive plus a pay
  unit. It is a mutable offer term, not a FinancialFact producer.
- `fireux-jobs` also owns the private Application and Engagement lifecycle.
  Both are exposed only through trusted server commands with exact candidate
  and employer partitions; browsers do not read their root collections.
- A tenant App owns applications for Jobs it sourced. A broader ecosystem Job
  catalogue derives the return doorway from that source App's canonical active
  `apps/{appId}` identity and HTTPS `social_links.website`; changing a hostname
  never requires an App rebuild. Job Directory entries do not duplicate source
  App identity or invent a second application path.
- Direct hiring means the named employer employs and pays the worker. The
  platform records the offer, both parties' actions, the agreed Job revision,
  and versioned acknowledgement of that relationship; it is not the employer,
  payroll provider, personnel lessor, or recipient of a hiring percentage.
- Permanent and fixed-term hiring is unrestricted on every plan. Temporary
  hiring uses one atomic employer capacity record: Free permits one active
  temporary Engagement and Premium permits multiple; completion or
  cancellation releases capacity. Publishing and applications remain
  unrestricted.
- An accepted Engagement is evidence for a later Team or rota adapter. It never
  grants Team membership, workspace access, App governance, or operator authority
  by itself.
- Ecosystem composition used by Professional Experience remains outside Job
  creation and cannot change this shared contract.

## Shared Blog authority

- `fireux-blogs` owns one canonical root BlogPost truth and a bounded
  server-side public projection. Public browser routes do not read raw Blog
  roots.
- Every BlogPost names its source App. The selected named Firestore database is
  ecosystem authority, so BlogPost does not duplicate ecosystem or generic
  owner scope. Every App in that database sees its complete public Blog
  catalogue; source App remains provenance, not public Blog visibility.
- `publication_scope` is available to optional feed-promotion adapters; it
  does not narrow the ecosystem-wide public `/blog` catalogue.
- The reader supplies the BlogPost document id. The canonical byline snapshot
  contains only public presentation fields and never stores author email.
- Blog media is shared durable HTTPS media. Project `/img/app` assets are
  presentation/source material, not canonical Blog media URLs.
- A BlogPost may carry one sparse Sproochli attachment with its default
  language and field-complete translations. The Blog-owned public projection
  accepts only a runtime-configured language, exposes only approved
  translations, and falls back to canonical default-language fields. Apps own
  their supported language order and persisted selection; feeds consume the
  same localized Blog DTO rather than copying translated story truth.
- Lightweight marketplace feeds remain their own event family. They may
  reference a BlogPost by canonical slug but do not copy Blog truth or turn
  every feed event into a BlogPost.
- See `docs/concepts/blog.md` for the current Blog literature and ownership
  map.

## Brand asset authority

- Every App consumes the same `/img/app/*` runtime asset paths. Asset source
  authority and projection are repository/build concerns and are not declared
  in `defineFireuxConfig` or exposed through runtime configuration.
- FireUX Core owns the default FireUX platform asset family under
  `packages/core/fireux-core/src/runtime/public/img/core/brand`.
- The `fireux-fireux` ecosystem and FireUX parent App retain their required
  public paths as deterministic projections. Check SVG masters, raster
  derivatives, dimensions, and projections with
  `scripts/render-fireux-brand-assets.mjs`; only its explicit `--write` mode
  renders and updates them, and `scripts/guards/fireux-brand-assets.mjs`
  rejects drift.
- `wordmark-light` means a wordmark for a light surface; `wordmark-dark` means
  one for a dark surface.
- The required App wordmark runtime is the PNG family. SVG wordmarks are
  optional and valid only when an outlined or reviewed vector master preserves
  the approved geometry exactly. Never reconstruct an approved raster
  wordmark with `<text>` or substitute typography merely to provide SVG.
- Explicit projection scripts may keep a Core or ecosystem source family
  byte-identical with named App targets. A genuinely branded child App keeps
  its complete family locally. Do not borrow another App's identity or weaken
  the required runtime-family guard. See `docs/concepts/brand-assets.md`.

## Translation and reviewed-copy authority

- `fireux-translation` owns low-level language catalogues and transient client
  request helpers; it owns no provider credentials or reviewed-copy workflow.
- `fireux-sproochli` owns provider authority, multilingual documents, and the
  reviewed authored-copy contract. Trusted generation stays server-side, and
  important public copy resolves only from approved content.
- Runtime cache ownership follows the consuming host. Sproochli package code
  executes inside that host's server runtime and stores unreviewed cache and
  translation-memory records in the host Firebase project, named database
  `sproochli`. The standalone Sproochli App remains a bounded generation
  provider; it does not select or write another host's Firebase project.
  Production host-to-provider calls use fixed-audience Google OIDC and an exact
  service-account/host allowlist. Cache storage authority is the Firebase
  project plus named database; the originating App id remains required
  provenance, not a boundary between Apps sharing that host database.
- Reviewed copy packs preserve one display-ready source intent and exact
  per-language variants with their own profile, status, and provenance.
  Missing or unapproved requested variants fail closed rather than falling
  through to a different language.
- Reusable domain participation is a sparse attachment on that entity's
  canonical root. Scoped support records cannot override it; public projections
  expose only bounded language state. For Structured Menus,
  `?sproochli=<code>` is the sole selection input and the Menu endpoint returns
  one final projection with `default`, `translated`, or `unavailable` state.
  Default returns canonical content and reads complete-cache readiness locally
  without contacting the provider. A selected language first resolves a
  complete host-local cache; only missing fields call the provider, after
  which the host persists translation memory and one complete Menu cache.
  Partial output never renders. The server may expose the bounded languages
  backed by complete matching caches so the picker can split Cached from On
  demand; `null` means readiness could not be checked, never zero. Translation
  memory and cache records remain server-owned,
  explicitly unreviewed, and never become browser state, approved copy, or
  canonical public content.
- Reusable domain packages own their shared interface source copy once.
  Sproochli translates that chrome through the same provider request and
  translation memory; do not copy universal wording into every entity.
- Apps own target-language profiles, glossaries, and approved phrase packs.
  `gsw` authoring names its locale/region/style instead of collapsing into
  standard German; Swiss Standard German uses `de` as its selector code and
  `de-CH` as locale metadata. See `docs/concepts/translation.md`.

## Firebase MCP targeting

Firebase MCP is configured once in the user's Codex environment, not repeated
inside each FireUX app.

Before any remote Firebase operation:

1. Identify the concrete app directory under `projects/*/*` and use its
   `firebase.json` as the application deployment surface.
2. Resolve the owning ecosystem package under `packages/ecosystem/*` and read
   its `.firebaserc` for the Firebase project ID. Project apps must not own a
   competing `.firebaserc`.
3. Confirm the intended Firebase project and named database explicitly. Never
   infer the database from the app name or Firebase project alone.
4. Point the Firebase MCP environment at that app/project/database before using
   remote tools, and report the resolved target.
5. Default to read-only inspection. Deployments, data writes, migrations,
   deletes, rules changes, and other remote mutations require explicit user
   authorization and the relevant backup or verification gate.

Do not add per-app MCP configuration files merely to expose Firebase to Codex.

## Personal account browser access

- A personal account remains user-owned even when its session is used for
  FireUX or Misebox work. The user signs in, completes password recovery and
  multi-factor challenges, and manages recovery or security settings. Agents
  use only the already authenticated browser session the user names.
- Never ask for, read, type, copy, store, log, commit, or document passwords,
  recovery codes, authentication cookies, session tokens, or password-manager
  contents. Repository documentation may describe the operating workflow but
  never personal access material.
- Default to read-only inspection. Before an agent publishes a post, sends a
  consequential message, changes account or Page settings, grants access, or
  acts as the user, show the exact proposed action and obtain the user's review
  at the action boundary. Routine reactions or navigation do not broaden that
  authority.
- Keep personal and business identities distinct. Confirm the active account,
  Page, recipient, and audience from visible browser state before preparing an
  external action; never infer them from a prior task or another browser.
- Facebook is one current consumer of this rule, not a special credential
  system or repository-owned integration. Apply the same boundary to any
  personal social, email, marketplace, or partner account used through a
  browser session.

## Firebase project directory

- Every Firebase project's `(default)` database owns that Firebase project's
  bounded local `project/{projectId}` ProjectMeta projection and
  `ecosystem/{ecosystemId}` EcosystemMeta projection. Project and Ecosystem
  collections are singular because this directory describes the one local
  Firebase project and its owning ecosystem.
- The directory lists only Projects, Ecosystems, and Apps hosted by that
  Firebase project. A global Workspace aggregates project directories through a
  trusted server boundary; one project never stores another project's copy.
- Directory records contain non-secret routing, status, presentation,
  and asset-reference fields only. Canonical memberships, Users, domain
  entities, content, credentials, and operational state remain in the owning
  named database.
- Each App exists once as canonical `apps/{appId}` in its owning named database.
  App indexes fetch those records through a Server endpoint and return `App[]`.
  Ecosystem scope reads one named database; platform scope aggregates the named
  databases declared by current platform targets. Do not create `AppMeta`,
  `AppDirectoryEntry`, or another stored/read projection for App discovery.
- `AppUser` is the canonical membership at `apps/{appId}/users/{uid}`. Its
  document must not repeat either path identity as stored `app_id` or `id`, and
  ordinary runtime mutations must not double as legacy-shape repair adapters.
  Retired membership fields are migration failures handled by the guarded
  offline migration, not alternate shapes accepted by product code.
- Every production `standalone` App selects a dedicated named database in each
  Firebase project that hosts its local outputs. Global and tenant Apps use
  their ecosystem's named database. A development harness must be classified
  explicitly and never weakens the standalone database rule.
- Canonical Project identity is `fireux/projects/{projectId}` and its document
  id is supplied by the path, not repeated in stored data. Public Project index
  and detail endpoints return `Project`, not a parallel directory entry. Each
  host's bounded `(default)/project/{projectId}` ProjectMeta is synchronized only
  through the guarded provisioning migration/MCP lane; an ordinary runtime
  mutation that updates only canonical Project is forbidden.

## Privacy-first measurement

- FireUX and Misebox Apps do not use analytics or advertising cookies,
  local-storage tracking identifiers, device fingerprints, third-party
  behavioural trackers, or cross-site/cross-App measurement identities.
- Authentication/security state, language selection, and anonymous-order
  recovery are strictly necessary feature storage. Measurement code must never
  read them or join them into behavioural profiles.
- No analytics collection is active until Core owns one server-side,
  aggregate-only family with bounded events, bot filtering, tenant isolation,
  private App-admin projection, and verified expiry at no more than 13 months.
- Interlaken Essen is the first intended proof, not an app-local exception.
  Start at `docs/concepts/privacy-measurement.md`,
  `runtime/pages/legal/privacy.vue`, `runtime/pages/legal/storage.vue`,
  `src/config/privacy/browser-storage.json`, and
  `scripts/guards/privacy-measurement.mjs`.
- Browser storage begins only after an explicit feature request. Core disables
  automatic service-worker registration. After the user requests
  authentication, Firebase Auth persists the sign-in across reloads and browser
  restarts until explicit sign-out or browser-data removal. Anonymous-order
  recovery expires within 24 hours, and public Google Maps surfaces require an
  explicit load action. `/legal/privacy` owns personal-data policy while
  `/legal/storage` owns the exact storage inventory.
- Core `/legal` is the shared legal-document index and visible unresolved-review
  surface for every FireUX-powered App. It may point to concrete risks already
  proved by current source and official guidance, but it is not legal advice,
  certification, or a substitute for an executable product gate. Apps do not
  fork that warning merely to change their brand or ecosystem.
- Guest chat contact data and message bodies use the trusted `/api/chat`
  boundary. Direct Conversation Firestore access stays closed; the browser
  retains an unguessable, time-bounded recovery capability and the App
  database stores only its hash. See `docs/concepts/privacy-measurement.md`.

## Firestore Rules source ownership

- FireUX Core owns reusable main-database Rules fragments and deterministic
  composition under `packages/core/fireux-core/src/config/firebase/rules`.
- An opted-in ecosystem owns the complete template manifest and its explicit
  project/database/domain deltas under `src/config/firebase`.
- The tracked `scripts/firebase/<ecosystem>/firestore.rules` file is the locked
  complete release artifact. Check it with `pnpm firebase:rules:render`; update
  it only through the renderer's explicit `--write` mode.
- Deploy and migration commands verify, but never regenerate, that artifact.
  App `firebase.json` files do not own main Firestore Rules.
- Ecosystems that install Place allow only exact `get` access to canonical
  `places/{placeId}` records so an already-open Place detail can subscribe for
  changes after its server render. Place collection listing and every browser
  write remain denied; protected material must live outside the root Place.

## Living context

Treat this file as a living repository document, not a frozen prompt.

- Re-check it against current code, guards, `AGENTS.md`, and concept maps when
  repository structure, authority, ownership, or working conventions change.
- Update this file in the same repository change when a stable repo-wide change
  makes any instruction here incomplete or incorrect.
- Keep `AGENTS.md` as a router. Put durable repo-wide detail here; put durable
  scope-specific detail in the relevant `docs/ai/*-context.md`; put topic maps
  in `docs/concepts/*.md`.
- Keep it concise and durable. Do not add temporary task state, chat history,
  speculative plans, or implementation details already owned by source code.
- Preserve this file as the single external-GPT entrypoint. Link to current
  sources instead of copying large instructions into it.
- If an update is needed but the current task cannot edit the repository, state
  exactly what in this file has become stale.

When discussing canon, spine, alignment, family, or drift, state what must
match, what may differ, the nearest working sibling, and the affected files.
