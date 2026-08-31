# FireUX GPT Context

Updated: 2026-08-30
Ref: 2166b112d
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
- Entity-specific Workspace behavior stays beneath the owning Entity runtime.
- Shared Workspace primitives stay Core-owned only when two materially different
  Entity families prove the same contract.
- One active Entity id is the ordinary Workspace selection contract; collections
  and permissions remain domain-owned.

Read `docs/concepts/family-workspace-entity.md`, `docs/concepts/entities.md`, and
the named Entity map before changing these boundaries.

## Components, pages, and composables

- Nuxt pages are thin route entrypoints.
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

- Models express domain truth; storage paths and document identity stay outside
  models unless they are genuine domain fields.
- Protected writes use named trusted commands and exact authority.
- Browser Firestore access is allowed only where Rules and product authority
  explicitly prove it.
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

- Derive literature bottom-up from current fields, states, commands, and pages.
- Keep product discovery traceable from sourced evidence through operator jobs,
  bounded Tool hypotheses, capability decisions, and implemented pages. A Tool
  hypothesis is not an implemented Tool, and a capability decision is not a
  release claim.
- Keep the product hierarchy explicit: an Operation is a stable working area,
  a Capability is what that area or a baked-in Workspace peer can do, and a
  Tool is one bounded action beneath a Capability. CRUD is the record-mechanics
  floor, not a substitute for user-facing verbs or authority.
- Use concrete product nouns and actions; avoid slogans and explanatory filler.
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

For parallel work, use separate branches/worktrees and one integration lead.
The integration lead reviews logical compatibility and owns final verification.

## Development and verification

- FireUX Core config exports default to authored TypeScript, so ordinary local
  Nuxt commands do not depend on disposable `dist` output.
- Repository build/deploy commands prepare compiled production config helpers.
- Use `pnpm dev:<app>` to start or reuse an App; add `-- --checked` for prepare
  and route smoke verification.
- Reuse healthy servers. Do not kill or restart them without a concrete need.
- Run focused checks while iterating and full `pnpm guard` before handoff.
- Run representative App prepare/typecheck/build checks when changing runtime
  contracts; guards prove only encoded shape.
- Never hide a failing typecheck behind a green guard claim.

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
