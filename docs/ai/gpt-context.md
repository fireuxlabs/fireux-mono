# FireUX GPT Context

Updated: 2026-07-26
Ref: 796952bf0
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

- BuenoHost: `docs/ai/buenohost-context.md`
- Misebox: `docs/ai/misebox-context.md`
- Werkbox: `docs/ai/werkbox-context.md`

Use `docs/concepts/*.md` for topic maps and `scripts/guards/*` for executable
shape rules. Do not copy implementation details into AI context when current
source or a guard is the better reference.

Family work starts at `docs/concepts/spine.md`. Its registry routes every
currently documented family and cross-cutting spine to the smallest relevant
map and summarizes the alignment queue. Every family difference must be
classified as accepted, migration, drift, or to-confirm; see
`docs/concepts/documentation.md`.

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
- Prefer user-owned IDE or toolbar servers. Start one from an agent task only
  when none exists and live verification needs it. Replace it with the explicit
  `pnpm kill:<app>` command only when the user asks or a concrete runtime change
  requires a restart; never replace a listener from another checkout.

## Shared page navigation

- FireUX Core owns the default Nuxt page-transition config and its matching CSS
  integration. Navigation remains real Nuxt routing with clean URLs; the
  transition changes presentation only.
- Keep layout transitions disabled by default so persistent layout chrome stays
  mounted when the route keeps the same layout.
- A genuine app-wide opt-out or override belongs in the native Nuxt `app`
  config through `withFireuxNuxtConfig`; a genuine route exception belongs in
  page meta. Do not attach transition props to app-shell `NuxtPage` instances
  or copy the shared generated-selector CSS into projects.
- Start at `packages/core/fireux-core/src/config/app/nuxt-baseline.ts` and
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

## Console target and onboarding authority

- FireUX Core owns the single `/auth` route and its sign-in, registration,
  account-provisioning, and authenticated redirect behavior for every App.
  Project Apps supply identity and branding through configuration and shared
  assets; they do not add local `/auth`, `/login`, or `/register` pages.
- A newly created App membership publishes one deterministic
  `app.user.joined` event under that App. The event is the durable signup log
  and atomically creates an owner-only in-app notification for each existing
  App admin; routine returning sign-ins do not create events or notifications.
- A configured source SSR runtime may publish the minimal join projection to
  the FireUX control plane over fixed-audience Google OIDC. FireUX accepts only
  exact service-account source scopes and exposes a bounded feed derived from
  immutable local events through its App-admin Project Users API; browsers
  never query tenant databases directly. See
  `docs/concepts/project-user-monitor.md`.
- UserApp persists orthogonal App authority and lifecycle: `role` remains
  `user | admin`, `is_premium` remains the explicit entitlement, and
  `onboarding_status` remains `pending | completed | skipped`. The shared
  `user-app-access` resolver derives `dev > admin > premium > free` only for a
  valid membership; Dev never manufactures Admin authority, while Dev and Admin
  inherit Premium product capability. Empty `profiles` and `console_targets`
  indexes are omitted at rest and normalized on read. Rules accept missing
  optional indexes but reject malformed, unknown, or oversized values.
- Public User list and detail projections remain canonical-identity DTOs. On a
  tenant runtime, candidate visibility comes only from exact valid
  `apps/{appId}/users/{uid}` memberships before root User hydration; a guessed
  global handle and the denormalized root `app_ids` field never establish
  tenant visibility. Global runtimes retain the ecosystem-wide User catalogue.
- A family core owns the authoritative target items, outcome, and selection
  validity. Index and overview adapters consume that state; they do not create
  a second membership or target-outcome authority.
- Authenticated dashboard surfaces consume the exact current App and caller
  membership through a bounded server projection. They do not raw-read private
  App or App-user authority from browser Firestore merely to render overview
  state.
- Live root/App-support families exact-load only bounded UserApp/configured
  target IDs and expose no partial pair when a root, same-id support record,
  App scope, stored authority shape, or caller access is invalid.
- Production onboarding for those families is a fixed-runtime authenticated
  domain endpoint. One trusted transaction creates or attaches the canonical
  root, completes the same-id App support record, and updates the caller's
  UserApp target index. Operators may mutate; team members have target/read
  membership only; current App admins are the explicit override.
- Kitchen retains Place and live/Demo composition, Blank remains the small
  harness, and Project remains a read-only control-plane family. Those are
  domain deltas, not alternate target or onboarding spines.

## Demo World boundaries

- Package and project owners may provide deterministic read-only Demo World
  modules under their guarded Demo roots.
- Consoles load their owner's fixtures lazily through `useConsoleDemoData`. A
  project Product Demo may instead compose its project and package-owned worlds
  through one named `app/composables/product-demo/use*ProductDemo.ts` adapter.
- Every Console family that accepts the shared Demo source must carry its own
  lazy owner-local adapter and preserve the Live-relative target, selection,
  and selected-parent operation shape.
- Public Product Demo pages use the reserved project `/demo` route family and
  consume that adapter. Direct fixture imports elsewhere remain forbidden.
- Demo World never becomes live public-content authority or a test, simulation,
  Firestore, Storage, server, admin, or mutation seam.

## Semantic catalogue boundaries

- `/operations` is the factual index of operations exposed inside the app's
  consoles. Every declared operation must point to a working `/console/*`
  operation route; Overview, Identity, Team, Sundries, dashboards, public
  indexes, and tools are not Operations.
- `/operations` is app-wide and groups entries by their owning Console. Prefer
  stable anchors such as `/operations#kitchen`; do not duplicate the index at
  domain routes such as `/kitchen/operations`.
- Each declared operation also receives a factual detail surface at
  `/operations/<slug>` when its owning record declares an app-wide unique
  public slug. It derives its language and working Console CTA from that same
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

## Financial fact ownership

- `packages/extensions/fireux-finance` owns product-neutral minor-unit money
  and deterministic immutable FinancialFact primitives. It imports no
  producing domain.
- FinancialFacts are App-scoped support records, not entities, reports,
  general-ledger entries, or Console Operations. Raw facts remain server-only;
  P&L and other reporting are bounded derived projections.
- Domain packages retain their named operations and records. A trusted domain
  lifecycle may atomically emit a normalized fact; the dependency points from
  that domain to Finance, never back from Finance to the domain.
- Do not treat a mutable catalogue price, estimate, rent field, or control-plane
  identity as a financial fact. Add producers only when a dated authoritative
  operation exists.

## Shared marketplace authority

- `fireux-marketplace` owns App-scoped Store identity, Store-owned Offer
  Records, and private offline marketplace Order Records. Buyer and seller are
  product surfaces, not UserApp roles.
- Store owner/editor ids are bounded private authority; App Admin creates and
  moderates Stores and assigns existing App members. Public readers consume
  only bounded published Store/Offer projections, while all writes and Order
  reads use trusted fixed-runtime endpoints.
- Marketplace prices reuse Finance minor-unit money, but catalogue prices and
  offline order requests do not emit FinancialFacts. MarketplaceOrder and
  KitchenOrder are separate fulfilment families.

## Firebase Auth App domains

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

## Shared Job authority

- `fireux-jobs` owns one Job root shape and trusted author/public boundary for
  every ecosystem. The current Agent/User is explicit owner authority;
  creator stamps remain audit-only.
- Canonical Company and Place ids are required relationships. App configuration
  may select an explicit product-neutral category allowlist or the shared
  all-category scope plus presentation copy, but may not select a workplace
  entity, materializer, or alternate stored shape. Invalid runtime role or
  tenant identity always makes the public Job projection ineligible.
- Optional compensation uses the Finance minor-unit money primitive plus a pay
  unit. It is a mutable offer term, not a FinancialFact producer.
- `fireux-jobs` also owns the private Application and Engagement lifecycle.
  Both are exposed only through trusted server commands with exact candidate
  and employer partitions; browsers do not read their root collections.
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
  grants Team membership, console access, App governance, or operator authority
  by itself.
- Ecosystem composition used by Professional Experience remains outside Job
  creation and cannot change this shared contract.

## Shared Blog authority

- `fireux-blogs` owns one canonical root BlogPost truth and a bounded
  server-side public projection. Public browser routes do not read raw Blog
  roots.
- Every BlogPost names its source App and ecosystem. Every App in an ecosystem
  sees that ecosystem's complete public Blog catalogue; source App remains
  provenance, not public Blog visibility.
- `publication_scope` is available to optional feed-promotion adapters; it
  does not narrow the ecosystem-wide public `/blog` catalogue.
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

## Brand asset authority

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
- A genuinely branded child App may own a complete `/img/app` override. Do not
  overwrite child identities or maintain an unguarded second FireUX logo
  source. See `docs/concepts/brand-assets.md`.

## Translation and reviewed-copy authority

- `fireux-translation` owns low-level language catalogues and transient client
  request helpers; it owns no provider credentials or reviewed-copy workflow.
- `fireux-sproochli` owns provider authority, multilingual documents, and the
  reviewed authored-copy contract. Trusted generation stays server-side, and
  important public copy resolves only from approved content.
- Reviewed copy packs preserve one display-ready source intent and exact
  per-language variants with their own profile, status, and provenance.
  Missing or unapproved requested variants fail closed rather than falling
  through to a different language.
- Reusable domain participation is a sparse attachment on that entity's
  canonical root. Scoped support records cannot override it; public projections
  expose only bounded language state. Structured Menus request provider
  translations from Sproochli's trusted server. Sproochli reuses successful
  results from its source-aware, server-only translation memory; the client
  keeps the selected view for its session. Translation-memory records are
  explicitly unreviewed and never become approved or canonical public copy.
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
