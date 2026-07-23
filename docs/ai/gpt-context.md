# FireUX GPT Context

Updated: 2026-07-23
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

## Console target and onboarding authority

- A family core owns the authoritative target items, outcome, and selection
  validity. Index and overview adapters consume that state; they do not create
  a second membership or target-outcome authority.
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
- Ecosystem composition used by Professional Experience remains outside Job
  creation and cannot change this shared contract.

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
