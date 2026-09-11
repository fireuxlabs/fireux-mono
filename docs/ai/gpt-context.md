# FireUX GPT Context

Updated: 2026-09-11
Ref: 53fa40ee6
Role: living context
Scope: repository-wide

## Purpose

Give humans and AI one compact repository entrypoint. This file owns durable
repo-wide working rules. It routes to current source, executable guards, scoped
contexts, and concept maps; it does not inventory implementations.

## Mandatory entry

For every repository task:

1. Read `AGENTS.md` and this file completely.
2. Read only the scoped `docs/ai/*-context.md` files routed by `AGENTS.md`.
3. Start at `docs/concepts/fireux-mono.md`, then read the smallest relevant map.
4. Inspect current source, package manifests, Nuxt registration, real consumers,
   nearest working sibling, relevant guards, and `git status`.
5. Treat current source and executable guards as stronger evidence than prose.

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

Dependencies travel only toward lower owners. Keep implementation with the
lowest layer that owns its complete meaning and authority. Upper layers compose
or adapt it; they do not copy it.

Repository and runtime placement are defined by `docs/concepts/fireux-mono.md`,
`docs/concepts/runtime-filesystem.md`, `docs/concepts/runtime-package.md`, and
`docs/concepts/lasagne.md`.

## Scope router

Use `AGENTS.md` as the only routing table. Current scoped contexts are:

- `docs/ai/apps-that-slap-context.md`
- `docs/ai/buenohost-context.md`
- `docs/ai/firestore-mutations-context.md`
- `docs/ai/identity-literature-context.md`
- `docs/ai/misebox-context.md`
- `docs/ai/sharer-context.md`
- `docs/ai/templates-context.md`
- `docs/ai/werkbox-context.md`

Do not create another router. Create a scoped context only for recurring scope
whose durable guidance cannot live in an existing owner.

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
  Existing Project domain implementation and stored Team-role fragments in Core
  are migration debt under this boundary, not templates for new industries.
  See `docs/concepts/family-workspace-entity.md` for the inspected scope.
- Workspace entry is `/` for every Workspace family. Entry buttons and
  selected-identity links return there; `/workspace/<family>/<capability>`
  remains the capability route family.
- The Workspace surface exists from arrival, including for guests and when
  there are no saved Entity records. Describe this as getting started or an
  empty Workspace, never “no workspace yet”. Distinguish the available surface
  from persistence: saving or creating a domain record still uses its existing
  command, allowance and authority. Progress copy refers to information added;
  it must not imply that selection proves onboarding completion. Internal read
  outcomes such as `empty` remain technical data states, not user-facing claims
  that the Workspace does not exist.
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
- Every App belongs to one canonical Ecosystem and declares its `ecosystemId`,
  including Apps whose role is `standalone`. Infrastructure binding and an
  App-owned database remain separate from that Entity relationship.

Read `docs/concepts/family-workspace-entity.md`, `docs/concepts/entities.md`, and
the named Entity map before changing these boundaries.

## Components, pages, and composables

- Nuxt pages are thin route entrypoints.
- A completed Workspace capability includes its page, tools and Overview summary.
  Extend the named domain Overview when a capability is implemented; reuse its
  read-only source, preserve independent loading/error states, and distinguish
  an unconnected source from a loaded empty collection.
- Capability Index components compose named UI responsibilities that a human can
  read without tracing control implementation. Collection and Individual children
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
- A composable owns one coherent concern. Do not turn `useX` into a bag of reads,
  writes, SEO, formatting, and page state.
- Domain workflow controllers stay domain-owned. Use props for small presentation
  inputs and provided context only for one visible shared workflow.

Read `docs/concepts/components.md`, `docs/concepts/pages.md`,
`docs/concepts/composables.md`, and `docs/concepts/lasagne.md`.

## Data and mutations

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
- Kitchen, Project, Supplier, Property, Portfolio and Blank development access requires a signed-in account with current
  App membership and its explicit Entity association. Team labels do
  not gate access. Subscription limits remain enforced; every Team member counts
  toward capacity. Individual role restrictions are deferred.
- Browser Firestore access is allowed only where Rules and product authority
  explicitly prove it.
- The eight configured ecosystem named databases currently use the explicitly
  accepted Core open-development Rules policy. This permits public CRUD, not
  just developer access; do not describe these databases as private or secure.
  See `docs/ai/firestore-mutations-context.md` for exact scope and the required
  replacement before shipping. Other database and Storage targets are separate.
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
- Use concrete product nouns and actions; avoid slogans and explanatory filler.
- User-visible API errors must provide a copy action for their displayed,
  sanitized message. Do not copy credentials, request headers or raw server
  internals. Core `MoleculesCopyError` supplies the action; shared StateCard
  errors and App-context surfaces consume it. Other bespoke error surfaces
  still need adoption when touched.
- Access vocabulary must reflect actual runtime authority and subscriptions.
- Brand, media, design-pack, and SEO ownership remain separate from Entity data.

Read `docs/concepts/product-language.md`, `docs/concepts/brand-assets.md`,
`docs/concepts/theming.md`, and the relevant product context.

## Task execution

- Make one bounded vertical responsibility change at a time.
- Move implementation, registration, consumers, docs, and guards together when
  they form one ownership cutover.
- Remove retired paths and empty directories in the same slice.
- Preserve unrelated changes.
- Use one temporary field, writer, reader, and visible result for pipeline proof.
- Remove proof code when the proof is complete.
- Do not run `pnpm gitsave` while another task is active or without explicit user
  authorization.

### Human–AI partnership

Treat repository work as a partnership with complementary authority, not a
command queue. The human contributes product intent, lived experience, customer
and work context, language judgment, and the final decision on product
trade-offs. The agent contributes technical judgment, repository memory,
evidence gathering, architectural scrutiny, implementation, and verification.

The agent must:

- recommend a concrete next move when evidence supports one;
- explain disagreements directly, including consequences and alternatives;
- challenge complexity, weak ownership, false completion claims, and work that
  solves the visible symptom while worsening the system;
- be appropriately firm when a proposed action risks data, authority, safety,
  repository integrity, or a suspiciously broad change for a small idea;
- teach the relevant architectural reasoning without requiring the human to
  supervise every file or implementation detail; and
- accept the human's informed product decision after the disagreement and
  trade-offs are clear, unless a higher-priority boundary prevents the action.

The agent must not confuse partnership with unilateral control. Do not invent
product intent, override a human product decision by preference, manufacture
agreement, or use technical fluency to hide uncertainty. Say what is known,
what is inferred, what remains unproved, and what evidence would change the
recommendation.

If a small request creates a suspiciously broad diff, stop and diagnose the
coupling before continuing. Breadth is not automatically wrong, but it requires
an explicit owner, reason, affected-consumer audit, and verification boundary.
Recommend the smallest proving slice before extracting or enforcing a generic
system.

For parallel work, use separate branches/worktrees and one integration lead.
The integration lead reviews logical compatibility and owns final verification.

## Development and verification

- The desktop App picker lives in `tools/fireux-launcher`; it discovers Apps and
  ports from their package-owned dev commands. `pnpm launcher` opens the picker.
  Root shortcuts and VS Code launch entries are maintained directly; there is
  no authored App registry or projection generator.

- FireUX Core config exports default to authored TypeScript, so ordinary local
  Nuxt commands do not depend on disposable `dist` output.
- Core’s `defineFireuxConfig` includes its native runtime layer at config time.
  Core module setup owns explicit registration and one Workspace page-transition
  hook; it does not insert Core into Nuxt’s internal layers. Legacy ecosystem
  and extension loading remains a separate migration boundary.
- Core owns production config compilation in `packages/core/fireux-core/build/config.mjs`;
  its package build hook and root build/typecheck commands reuse that helper.
- App-specific `pnpm dev:<app>` shortcuts call the owning App’s `dev` command directly.
  The retired smoke wrapper and its `--checked` option are no longer available.
- Reuse healthy servers. Do not kill or restart them without a concrete need.
- Run focused package typechecks and relevant source-owned tests, then
  `git diff --check`. The former `scripts/` directory and guard suite are
  removed; references to those guards in older maps are historical. Use current
  package commands and source-owned tests, not the deleted suite.
- Run representative App prepare/typecheck/build checks when changing runtime
  contracts; guards prove only encoded shape.
- Never hide a failing typecheck behind a green guard claim.

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
rather than also loading the standalone bridge; FireUX App and both Werkbox
Apps are the inspected configurations for this separation. Other App configurations require their own
verification before this is claimed repository-wide.

## Evidence claims

Use these exact levels:

- **Locally aligned**: edited source, direct registration, and immediate consumers
  were inspected and verified.
- **Family aligned**: every maintained family member, owner, route, registration,
  authority, guard, and proving sibling was compared.
- **Repository aligned**: the complete maintained ownership/dependency inventory
  was audited and every difference classified.

A green build proves compilation. A green guard proves encoded contracts.
Neither alone proves ownership, runtime behavior, or repository-wide canon.
Always state the inspected boundary and what remains unaudited or `to-confirm`.

## Authority

Use this order:

1. current source;
2. executable guards and tests;
3. `docs/ai/*-context.md`;
4. `docs/concepts/*.md`;
5. historical material.

User decisions are product authority for their stated scope. Experiments remain
reversible and do not become durable context or guards until accepted and proved.

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

Update this file only when a stable repo-wide boundary changes. Update a scoped
context only when its recurring product/package boundary changes. Point to source,
guards, and concept maps instead of copying inventories, migration logs, task
state, or chat history. Before handoff, confirm applicable context still matches
current source.
