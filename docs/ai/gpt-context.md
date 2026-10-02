# FireUX GPT Context

Updated: 2026-10-01
Ref: 2807ceca9
Role: living context
Scope: repository-wide

## Purpose

Own durable repo-wide working rules and the reasoning behind them. This file
inherits the mandatory entry and sole scope router in `AGENTS.md`; scoped
contexts add only their domain-specific guidance. Use current source and
available checks to verify behavior rather than treating prose as an
implementation inventory.

## Repository law

```text
App → Ecosystem → Extension → Core
```

- Apps own deployment, routes/adapters, configuration, brand, SEO, and genuinely
  App-specific presentation.
- Ecosystems own genuine cross-extension product composition reused by Apps in
  that ecosystem.
- Extensions own reusable domains, Entities, capabilities, authority, models,
  UI, and trusted behavior.
- Core owns proved product-neutral FireUX and Nuxt mechanics.

Apps may consume Extensions or Core directly; Ecosystems may consume Core,
and Extensions may consume lower Extensions. Core never depends on product
packages. Dependencies travel only toward lower owners. Keep implementation
with the lowest layer that owns its complete meaning and authority. Upper layers compose
or adapt it; they do not copy it.

Repository and runtime placement are defined by `docs/concepts/fireux-mono.md`,
`docs/concepts/runtime-filesystem.md`, `docs/concepts/runtime-package.md`, and
`docs/concepts/lasagne.md`.

## New work

Before editing, answer:

1. Which layer and package own the behavior?
2. Which existing family and working sibling does it belong to?
3. Which lower capabilities does it reuse?
4. What must match, and what product difference may remain?
5. Can it be implemented without a registry, compatibility layer, pass-through
   wrapper, duplicate owner, or generic framework?

If ownership is ambiguous, stop and report it. Do not place work conveniently
and later describe that placement as architecture.

For a new family, follow `docs/concepts/spine.md`: build one useful member,
materially differentiate a second real sibling, compare them, and extract only
the contract that remains shared. Similar appearance, copied structure, or a
renamed alias is not proof.

## Entity and Workspace

- Firestore root collections are canonical Entity families when current models,
  authority, routes, and behavior prove them.
- Entity implementation lives under `src/runtime/<entity>/<technical-role>`.
- Root runtime roles are reserved for cross-entity mechanics and Nuxt entrypoints.
  Distinguish generic lower mechanisms from upper cross-Entity composition: the
  former must not depend on domains, while the latter may consume named domain
  capabilities. Nested Entity roles require explicit registration or imports;
  folder names alone establish neither framework discovery nor server isolation.
- Workspace is a product surface and route family, not an Entity owner.
  An Entity may expose public/detail and Workspace management surfaces over
  the same domain-owned readers and commands. Having a Workspace does not
  create another Entity model, storage owner, or compulsory composable layer.
  An Entity without its own Workspace may be managed inside another Entity’s
  Workspace through its supported capabilities. Preserve its actual root or
  parent-scoped identity; UI placement does not decide storage ownership.
- Entity-specific Workspace behavior stays beneath the owning Entity runtime.
- Name Entity capability readers for their domain responsibility, such as
  `useProjectApps` or `useProjectTeam`; do not insert `Workspace` merely because
  the capability is displayed there. Reserve Workspace naming for actual
  selection, navigation, and surface mechanics.
- Workspace availability does not change Entity ownership. A capability composes
  the domains it manages; an independently identified child retains its own
  domain, while a parent-owned record stays with its proved parent. UI children
  express composition, not storage ownership. Organize each owner by technical
  role, then a meaningful capability where needed; do not preserve forwarding
  files or duplicate paths after a completed move.
- Shared Workspace primitives stay Core-owned only when two materially different
  Entity families prove the same contract. Universal capability means a shared
  responsibility and interaction contract, not a universal set of domain fields
  or roles. Domains own Identity fields, linked records, role definitions and
  permission policy; Core presentation receives those choices explicitly.
  Project domain implementation belongs to the FireUX ecosystem, with current
  App-owned protected commands. Core retains generic App event transport and
  shared Workspace primitives. Stored Team-role fragments still in Core remain
  separate migration debt, not templates for new industries.
  See `docs/concepts/family-workspace-entity.md` for the inspected scope.
- Global and standalone Workspace entry actions resolve the App route with the
  matching `workspace-<family>` navigation key; this may be `/` or an explicit
  `/workspace/<family>` entry when `/` is a public landing. Tenant Apps retain
  their customer landing at `/`; Core `/workspace` resolves their first enabled
  `/workspace/<family>` entrance on both server and client. The accepted route
  target is Workspace Home → capability → record: navigation groups may have
  sibling overview entrances, but do not own capability URL segments or data.
  Perspectives within one record use local view state, not child routes or
  query-string tabs. Sidebar labels do not determine stable route segments.
  Adoption is bounded: Kitchen Menu record perspectives now share
  `/workspace/kitchen/menus/<slug>`; section and source-upload records remain
  separate destinations. Existing grouped capability and perspective routes
  elsewhere remain migration debt, not a claim of completed repository adoption.
  Kitchen selection, identity and management return links consume the named
  Kitchen entry from that resolver. Other domain-specific identity links remain
  outside this inspected cutover.
- The Workspace surface exists from arrival, including for guests and when
  there are no saved Entity records. Describe this as getting started or an
  empty Workspace, never “no workspace yet”. Distinguish the available surface
  from persistence: saving or creating a domain record still uses its existing
  command, allowance and authority. Progress copy refers to information added;
  it must not imply that selection proves onboarding completion. Internal read
  outcomes such as `empty` remain technical data states, not user-facing claims
  that the Workspace does not exist. AppUser has no onboarding completion flag;
  membership is separate from each domain’s creation and capability requirements.
  Review sign-in requirements tool by tool on each capability page, requesting
  sign-in at the point of use where required. Do not add a global onboarding gate.
- One active Entity id is the ordinary Workspace selection contract; collections
  and permissions remain domain-owned.
  A settled non-empty Workspace must retain a valid selection; an empty
  relationship alone permits no active Entity. Kitchen and Project prove this
  rule and the persistent selected-Entity navigation control; the other families
  still require the same cutover. See `docs/concepts/family-workspace-entity.md`.
- In FireUX, `tenant` is an App role, not an Entity family. A tenant App still
  uses `AppUser` and the same package-owned Entity and Workspace contracts as a
  global App. Never infer or introduce `Tenant`, `TenantUser`, tenant CRUD, or a
  tenant collection from generic SaaS terminology. Read
  `docs/concepts/family-tenant-global.md` for the accepted runtime differences.
- FireUX's cross-ecosystem directory reads identity from each approved owning
  database. It does not edit that identity through Project membership or broader
  service-account permissions. App/Ecosystem ignition and owning-system identity
  management are deferred; collecting initial identity does not authorize a
  cross-ecosystem editor. Project-owned data stays separate from displayed
  App/Ecosystem identity.
- Every App belongs to one canonical Ecosystem and declares its `ecosystemId`,
  including Apps whose role is `standalone`. Infrastructure binding and an
  App-owned database remain separate from that Entity relationship.

Read `docs/concepts/family-workspace-entity.md`, `docs/concepts/entities.md`, and
the named Entity map before changing these boundaries.

## Components, pages, and composables

- Entity Workspace presentation uses direct named capability folders, not
  `Operations`, `Capabilities`, `Supporting` or `Sundries` containers. `Index`,
  `Navigation`, `Selector` and `Dashboard` may be root components when consumed;
  entry-only collection/single controls and creation dialogs belong in `Home`.
  Cross-page domain helpers use their specific responsibility (for example
  `Navigation`, `AI`, `Research` or `Tools`), not a miscellaneous bucket.
  App-owned Home framing uses distinct names so it cannot shadow domain Home
  components. Shared mechanics remain Core-owned; domain tools and authority
  remain domain-owned. Follow `docs/concepts/components.md` for the source map.
- Collection-based Workspace capabilities use `Collection` and `Single` for
  structural component names and slots. Visible labels remain domain-owned:
  My Kitchens, the selected Kitchen’s Menus or Team, and the selected record’s
  name. Workspace entry presentation lives under `Workspace/Home`; `Landing`
  names public entry presentation. Selection state may still be named `selected`.


- Nuxt pages are thin route entrypoints.
- Core Auth System owns post-auth navigation after the live User read settles.
  Provider/email controls perform authentication only. Missing User goes directly
  to User setup, retaining a validated internal destination; existing User returns
  to that destination. Dashboard remains the default without a destination. Auth and User setup share the
  minimal auth layout, avoiding a transient Dashboard or public-navigation shell.
- Core owns the single dashboard route. Each App may register a global
  `DashboardWorkspace` component; Dashboard Home renders it in the Overview
  Workspace slot. These App adapters compose domain-owned components that reuse landing collections
  and live selection readers. Core does not resolve domain navigation components
  to compose dashboard content.
- A completed Workspace capability includes its page, tools and Overview summary.
  Extend the named domain Overview when a capability is implemented; reuse its
  read-only source, preserve independent loading/error states, and distinguish
  an unconnected source from a loaded empty collection.
- Capability Index components compose named UI responsibilities that a human can
  read without tracing control implementation. Collection and Single children
  own their local tools; compact and open presentations reuse the same forms and
  commands. Universal, optional shared, and domain capabilities use this same
  composition discipline, with different availability and ownership. Do not add
  empty composables, forwarding components, or a generic composition engine.
- Component paths must predict generated names and owners.
- Apps use responsibility-first roots such as `Landing` and `Workspace`; do not
  repeat the App name beneath its own boundary.
- Package Entity UI belongs beneath `runtime/<entity>/components`.
- Prefer Nuxt UI directly. Add shared CSS or components only for a proved repeated
  contract.
- Apply the Entity file admission contract in
  `docs/concepts/composables.md#entity-file-contract` before adding or retaining
  Entity adapters: one responsibility, one owner, a real consumer, and a proved
  delta where needed. Its role list is not a mandatory scaffold. Read and Detail
  do not both exist unless their responsibilities differ; extra App or Workspace
  consumers do not justify forwarding wrappers. Verify behavior, not file counts.
- A composable owns one coherent concern. Do not turn `useX` into a bag of reads,
  writes, SEO, formatting, and page state.
- Domain workflow controllers stay domain-owned. Use props for small presentation
  inputs and provided context only for one visible shared workflow.

Read `docs/concepts/components.md`, `docs/concepts/pages.md`,
`docs/concepts/composables.md`, and `docs/concepts/lasagne.md`.

## Data and mutations

- Mutable on-screen collections and documents must follow stored changes through
  live bindings, including additions, edits, unpublication and deletion. Reactive
  parameters around a one-shot read do not satisfy this contract. Core owns the
  shared document/query mechanics; domain-owned public projections retain their
  authorization and subscribe to every record they depend on. SSR supplies initial
  content. Polling and manual refresh are not substitutes for live data.
  Core `firestore/operations/read-outcome.ts` owns shared read-state precedence
  for direct bindings and server detail projections: inactive is idle, an obsolete
  source is pending, then failure, loading and settled data. Document 404 is
  missing and retains its live dependency subscription so the record can reappear;
  denied access closes the stream. A collection failure is never an empty result. Domain projections
  supply identity and presence, and must hide stale or failed detail data.
  One-shot command validation, explicit searches, external-provider lookups and
  local edit buffers remain distinct. Mutable server readers use Core
  `useLiveAsyncData`/`useLiveFetch` with `defineLiveReadHandler`; paged readers
  use `readLivePages` so every loaded page remains subscribed. Core runtime
  Firestore resolvers observe document/query/getAll dependencies only inside an
  explicit live request; other server database resolvers must reuse
  `observeRuntimeFirestore`. Domain handlers continue to own authorization and
  projection. Live reads cannot execute Firestore writes. Reconnect retries
  repair failed connections; they are not periodic data polling. See
  `docs/concepts/server-api.md` and Core's live-client/live-server read tests.

- Do not keep Entity metadata declarations or locator models solely to satisfy
  a structural check. A retained declaration must have a real source consumer;
  record models and runtime readers/writers remain the domain implementation.
- Entity model files require a distinct domain contract; being stored in a
  collection does not justify an extra collection model. Use arrays for records
  and shared transport types for common pagination metadata. Keep child records,
  API responses, UI state, and configuration distinguishable from Entity models.
- Models express domain truth; storage paths and document identity stay outside
  models unless they are genuine domain fields.
- Protected writes use named trusted commands and exact authority.
- App self-service membership uses the stored App `self_join_enabled` policy
  in User onboarding, bootstrap, and the trusted join command. The authored
  `selfJoinEnabled` config only seeds newly initialized Apps.
- App creation uses a trusted Project command or configured-App initialization because its Ecosystem
  relationship and initial membership are required. Do not add a primitive App
  Create solely for CRUD symmetry; see `docs/ai/firestore-mutations-context.md`.
- Kitchen Landing has a bounded anonymous creation/handoff path owned by Kitchen.
  Project Landing has a bounded anonymous create/resume path at the current UID;
  it does not yet adopt that record into an account. Neither path fabricates User
  or AppUser membership. Other
  Kitchen, Project, Supplier, Property, Portfolio and Blank development access requires a signed-in account with current
  App membership and a domain-owned access record bound to that membership’s
  `created.at`. AppUser stores no Entity arrays or primary selections. Team labels
  do not gate access. Subscription limits remain enforced; every Team member counts
  toward capacity. Individual role restrictions are deferred.
- Browser Firestore access is allowed only where Rules and product authority
  explicitly prove it.
- The eight ecosystem development templates retain the explicitly accepted
  Core open-development Rules policy, which permits public CRUD.
  Misebox (`misebox-78f9c` / `misebox`) remains in development; the user-selected
  policy is the same open-development template. A previously deployed restricted
  policy must not be confused with shipping authorization. Verify live policy
  independently; restoring the selected policy requires an authorized Rules-only rollout.
  See `docs/ai/firestore-mutations-context.md` for exact scope and the required
  replacement before shipping. Other database and Storage targets are separate.
  Keep the accepted development templates separate from production Rules. Restricted Rules are release
  work, not a prerequisite for accepting each Entity or capability development
  pass; retain the application-level command and access contracts meanwhile.
- Parent-owned records and capabilities live beneath the parent Entity when
  proved; do not invent generic settings/config registries.
- Migrations are audited, create-only where possible, preserve preimages, and use
  separate deletion gates.
- Public/detail projections never include protected operational records merely
  because Vue can hide them.

Read `docs/ai/firestore-mutations-context.md`,
`docs/concepts/firestore-entity.md`, and `docs/concepts/server-api.md`. Use the
Firestore skill whenever Firestore is accessed or changed.

## Product language and presentation

Core `runtime/utils/platform-context.ts` owns public platform meaning, separate
from this repository guidance. FireUX App publishes it at
`/api/fireux/context/platform` and renders the same source on `/product`.
Lower context scopes add specific meaning rather than copying this block;
publication does not automatically inject it into AI requests or grant authority.

- Derive literature bottom-up from current fields, states, commands, and pages.
- Keep product discovery traceable from sourced evidence through operator jobs,
  bounded Tool hypotheses, capability decisions, and implemented pages. A Tool
  hypothesis is not an implemented Tool, and a capability decision is not a
  release claim.
- Keep the Workspace hierarchy explicit: Workspace → Capability → Tool →
  authorized command. There is no separate Workspace Operation layer. Use
  “operation” only for an executed action or operational data, not as a second
  name for a Capability. CRUD is the record-mechanics floor.
- Keep UX copy short and specific. Omit copy that adds no needed information;
  do not fill optional descriptions, repeat headings, or explain obvious controls.
  Existing placeholder text is not product authority. Keep help for meaningful
  choices, limitations, errors and next actions.
- User-visible API errors must provide a copy action for their displayed,
  sanitized message. Do not copy credentials, request headers or raw server
  internals. Core `MoleculesCopyError` supplies the action; shared StateCard
  errors and App-context surfaces consume it. Other bespoke error surfaces
  still need adoption when touched.
- Access vocabulary must reflect actual runtime authority and subscriptions.
- Across Workspaces, feature entitlement belongs to the acting User, separately
  from their permission to edit the selected Entity. Free/Plus is the feature
  vocabulary: Professional and Business both provide Plus features; Business
  adds capacity rather than another feature level for now. A teammate's paid
  subscription never grants the actor paid actions. Downgrade preserves saved
  results and limits future actions. Each capability must explicitly define and
  enforce its own Free/Plus actions; this policy is not evidence of implemented
  gates. Existing subscription storage remains unchanged by this vocabulary.
- Brand, media, design-pack, and SEO ownership remain separate from Entity data.

Read `docs/concepts/product-language.md`, `docs/concepts/brand-assets.md`,
`docs/concepts/theming.md`, and the relevant product context.

## Task execution

- This shared checkout is worked on `main`. Do not switch its branch or create a
  worktree unless the user explicitly requests it. Check the active branch and
  any user-specified saved commit before editing; report a mismatch first.

- Make one bounded vertical responsibility change at a time. Move implementation,
  registration, consumers, docs and relevant checks together for an ownership
  cutover; remove retired paths and empty directories in the same slice.
- If a small request creates a suspiciously broad diff, stop and identify the
  missing seam, mixed ownership, coupling or unproved abstraction. Establish the
  owner, affected consumers and verification boundary before extending it.
- A pipeline proof uses one temporary field, one writer, one reader and one plain
  visible result. Do not turn it into a catalogue or framework; remove proof code
  when it has served its purpose.
- Preserve unrelated uncommitted work, including concurrent changes. Never revert
  another task's work to make a check pass.
- `pnpm gitsave` stages shared work: run it only for a user-requested save, with a
  stable shared tree and no other active task.
- For parallel work, use separate branches/worktrees and one integration lead
  responsible for compatibility and final verification.
- When historical output dominates the context, checkpoint useful state and
  continue in a fresh task with explicit acceptance criteria.

### Human–AI partnership

The human owns product intent, lived context and final product trade-offs. The
agent owns technical judgment, evidence gathering, implementation and
verification. Recommend a concrete next move, explain material disagreements
and consequences, and challenge avoidable complexity or unclear ownership.
Stop when authority, safety or repository integrity is at risk. After explaining
the evidence and trade-offs, respect the human's informed product decision
unless a higher-priority boundary forbids it.

Do not invent intent, manufacture agreement or hide uncertainty. State what is
known, inferred and unproved without requiring the human to supervise every
implementation detail.

When the user asks to open source in VS Code, use `code -r`. For comparison,
open both files and use the smallest VS Code split command needed; do not use
computer control for ordinary file opening or arrangement.

For `canon`, `spine`, `align`, `family` or `drift` work, state before editing:
the scope, owner and reference sibling, what must match, what may differ, exact
files in scope, and what remains unaudited. Be direct about drift; do not
reassure beyond the evidence.

## Development and verification

- The desktop App picker lives in `tools/fireux-launcher`; it discovers Apps and
  ports from their package-owned dev commands. `pnpm launcher` opens the picker.
  Root shortcuts and VS Code launch entries are maintained directly; there is
  no authored App registry or projection generator.

- FireUX Core config exports default to authored TypeScript, so ordinary local
  Nuxt commands do not depend on disposable `dist` output.
- Core’s `defineFireuxConfig` includes its native runtime layer at config time.
  Core module setup owns explicit registration and one Workspace page-transition
  hook. All maintained Apps declare their conventional runtime layers before
  module setup. Core preserves explicitly authored Core precedence and otherwise
  appends it; missing owning layers fail through the public native-layer assertion.
  Modules must not insert runtimes into Nuxt’s private resolved-layer list.
- Core owns production config compilation in `packages/core/fireux-core/build/config.mjs`;
  its package build hook and root build/typecheck commands reuse that helper.
- App-specific `pnpm dev:<app>` shortcuts call the owning App’s `dev` command directly.
  The retired smoke wrapper and its `--checked` option are no longer available.
- Reuse healthy servers. Do not kill or restart them without a concrete need.
- Choose checks for the changed responsibility: focused package typechecks and
  relevant source-owned tests for code; representative App prepare/typecheck/build
  checks when runtime contracts change. For prose-only changes, verify references
  and claims. Finish with `git diff --check`.
- Broaden or repeat checks only for changed contracts, failures or unresolved
  concerns. The former `scripts/` guard suite is removed; do not restore it or
  claim its checks ran. Use current package commands and source-owned tests.
- Report exact existing or concurrent failures and the resulting verification
  limits. A green check does not excuse a failing typecheck or prove an
  uninspected responsibility.

App-specific navigation presentation belongs in the existing `app/app.config.ts`.
Core navigation consumes it directly; deployment runtime config does not carry
navigation overrides or hidden route keys. Shared route defaults remain with
the route owner.

### Framework typing boundary

Standalone package checks use `types/nuxt-shims.d.ts` as an imports bridge.
That bridge loads Core’s runtime-config declarations so dependent package checks
share the same configuration contract.
Standard Vue and Nuxt helpers must retain their framework signatures, never
loose `any` overloads. Core declares its own runtime-config additions in
`packages/core/fireux-core/src/types/runtime-config.d.ts`, reusing the existing
configuration types. A generated Nuxt App check must use generated imports
rather than also loading the standalone bridge; FireUX App, Misebox App and both
Werkbox Apps are the inspected configurations for this separation. Other App
configurations require their own verification before this is claimed
repository-wide.

## Evidence claims

`Aligned`, `canonical`, `fixed`, `complete` and `done` are evidence claims.
Qualify them as local, family or repository scope using these levels:

- **Locally aligned**: edited source, direct registration, and immediate consumers
  were inspected and verified.
- **Family aligned**: every maintained family member, owner, route, registration,
  authority, guard, and proving sibling was compared.
- **Repository aligned**: the complete maintained ownership/dependency inventory
  was audited and every difference classified.

A green build proves compilation. A green guard proves encoded contracts.
Neither alone proves ownership, runtime behavior, or repository-wide canon.
Always state the inspected boundary and what remains unaudited or `to-confirm`.
Never present a bounded repair as completion of its parent task.

## Authority

Use this order:

1. current source;
2. executable guards and tests;
3. Scoped contexts at their owning package/App `docs/ai` location, or central cross-owner `docs/ai`, as routed by `AGENTS.md`;
4. `docs/concepts/*.md`;
5. README placeholders and historical material.

User decisions, corrections, requirements and acceptance criteria are product
authority for their stated scope. Requests to try, preview or compare are
experiments: keep them reversible and do not turn them into durable context or
checks before acceptance and source evidence. Source proves behavior, not that
an implementation is desirable.

## Rule review

A documented or guarded rule is evidence of deliberate enforcement, not proof
that the rule is still useful or correctly scoped. Review established rules
against current source, real consumers, recurring failures, and the cost of the
constraint. Ask what problem the rule prevents, whether that problem still
exists, whether an experienced reader could infer the boundary from the system,
and whether the rule introduces ceremony, duplication, or avoidable indirection.
Current source proves how the repository behaves; it does not by itself prove
that the behavior or architecture is desirable.

Ordinary work follows established rules. Reopen a rule when current source
contradicts it, real consumers repeatedly work around it, exceptions or
duplication accumulate, enforcement causes recurring failures, or the user asks
for an architectural review. Age and inconvenience alone are not evidence that
a rule is stale or wrong.

Classify the result explicitly:

- **Keep**: current evidence supports the rule and its scope.
- **Simplify**: the intent is sound but the mechanism is needlessly elaborate.
- **Narrow**: the rule is useful only within a smaller proved scope.
- **Replace**: the problem is real but the present rule solves it poorly.
- **Remove**: no current evidence justifies the constraint.
- **Unproved**: the rule is plausible but needs comparison or an experiment.

Do not weaken a safety or authority boundary merely because it is inconvenient.
Do not preserve a hierarchy merely because documentation and guards agree. Keep
changes reversible until the replacement is accepted and independently proved.
Any proposal to simplify, narrow, replace, or remove a rule must name the exact
scope, current evidence, affected consumers, safety and authority consequences,
replacement or removal path, and verification that would prove the outcome.

## Living-context maintenance

Update this file when a stable repo-wide boundary changes, and a scoped context
when its recurring product/package boundary changes. Update both only when both
layers change. Before finishing, verify that applicable guidance still matches
source; if edits are not authorized, report the exact stale instruction and
contradicting source.

Follow `docs/concepts/documentation.md` before creating, renaming or changing the
role of durable documentation. Prefer an existing owner. Create a scoped context
only for recurring guidance that does not belong in the global file; it must
inherit `AGENTS.md` and this file, define purpose, scope, ownership, authority,
refresh and verification expectations, and living maintenance. Point to current
source, tests and maps; exclude task state, chat history, speculative plans and
stale snapshots.

Keep the scope router only in `AGENTS.md`. Add a nested `AGENTS.md` only for
subtree-wide operational instructions that cannot live in source, available
checks or an existing context. Do not copy repository architecture into it.
Documentation records proved decisions; it must not turn a plausible
implementation into canon.

### Scoped context placement

Global and cross-owner contexts stay central. Domain guidance belongs beside its
package; ecosystem composition beside its ecosystem; distinct App guidance beside
its App. Root `AGENTS.md` remains the sole router. Retire old paths and update
consumers in the same move; do not add forwarding guides or per-folder scaffolds.
Internal working guidance is distinct from curated public runtime explanations.
Neither reading a context nor publishing an explanation grants command authority
or implies automatic AI context injection.
