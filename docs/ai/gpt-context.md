# FireUX GPT Context

Updated: 2026-11-18
Ref: 2f47a03c2
Role: living context
Scope: repository-wide

## Purpose and authority

Keep durable repo-wide working rules here. [AGENTS.md](../../AGENTS.md) is the
sole scope router. Detailed product and package guidance belongs in the
corresponding context or concept map.

Use current source to establish implementation, and available tests or guards to
establish only the contracts they exercise. A documented decision records intent;
it does not make existing implementation desirable or complete.

## FireUX ownership

> Nuxt runs the web app, Nuxt UI supplies the controls, Firebase supplies the backend, and FireUX composes them into repeatable SaaS products.

Use native behavior by default within FireUX ownership and composition rules.
Supported Nuxt/Nuxt UI APIs establish API validity; FireUX fit also requires
the ownership and composition checks below.
A FireUX abstraction must earn its place with a specific product responsibility
or a demonstrated integration gap. FireUX is an industry SaaS framework combining
shared SaaS foundations with industry libraries.
Use official upstream docs for framework behavior and the
[platform map](../concepts/fireux.md) for FireUX-owned integration.

- Apps own deployment, routes and adapters, configuration, brand, SEO and
  genuinely App-specific presentation.
- Ecosystems own real cross-extension composition reused by their Apps.
- Extensions own reusable domains, Entities, capabilities, data authority and
  trusted behavior.
- Core owns proved product-neutral FireUX and Nuxt mechanics.

Dependencies point toward lower owners. An App may consume its own Ecosystem,
Extensions or Core directly; Ecosystems may consume Extensions and Core;
Extensions may consume lower Extensions and Core. Core does not depend on
product packages. Keep implementation with the lowest owner that has its
complete meaning and authority.

The [repository map](../concepts/fireux-mono.md),
[package contract](../concepts/runtime-package.md) and
[App configuration map](../concepts/app-config.md) locate concrete package,
bundle and registration responsibilities. Manifests own dependencies, version
pins, exports and commands; do not copy their inventory into living context.

## New work and composition

FireUX fit is a completion gate for every implementation and structural change.
It includes ownership and composition, supported Nuxt/Nuxt UI and FireUX patterns,
data authority, lifecycle, navigation, product language and the actual consuming
experience. Establish the relevant source-backed pattern and intended App/domain
differences before expanding behavior. Preserve deliberate product differences;
copying a sibling or applying brand styling alone does not establish fit. Correct
known duplication and misplaced ownership within the agreed scope in the same
change. Report FireUX fit evidence separately from functional evidence.

The implementation task owns delivering FireUX fit. Architecture stewards the
patterns and ownership boundaries; Verification checks the actual consuming
result against them; Main is accountable for acceptance of the complete outcome.
Include the reference, actual consumers, intended differences and required
evidence in handoffs. These responsibilities apply to every task and model,
whether or not dedicated coordination chats are available. They do not require
every change to pass through specialist chats.

When an intended contract changes, reconcile the owner, affected consumers,
checks and applicable living context together. Protect meaningful behavior and
authority; investigate stale mocks or implementation-shape assertions rather
than letting them dictate architecture. Never weaken a check merely to obtain
a passing result. Follow the [rule-review process](#authority-and-rule-review)
for changes to established boundaries.

Unshipped implementations follow the same current contract regardless of age.
Do not preserve conflicting shapes as older/newer variants or add compatibility
adapters for a completed migration without a proved external compatibility need.

Composition is the default from the first implementation. Parents visibly name
child responsibilities, with props/events for ordinary presentation APIs and
inherited native/shared styles and tokens. Bounded domain-provided context
remains valid for genuinely shared state. Native slots remain supported; new
shared extension points and layouts must meet the
[component API](../concepts/components.md#component-apis-and-extension-points) and
[layout admission](../concepts/layouts.md#layout-admission) criteria.
A child may own a coherent section's content,
presentation, styling or behavior, even with one consumer and no reactive state.
Separation of concerns is sufficient reason for a component; reuse is not required.
Small cohesive controls may stay local. Do not add forwarding wrappers, empty
controllers or universal abstractions to make file trees look symmetrical.

Keep the path from read to screen to action direct. A composable's return is a
contract with its current callers. Return only the data they render or use and
the actions they call. Keep intermediate state private and avoid forwarding
whole lower-level results. Build controls for the operator's current tasks.
Remove unused outputs and controls and add them when a real need arises.

### Mandatory composition checks

These start and finish gates apply to implementation and structural changes.
Scale them to the work and report the findings; do not create a permanent task
checklist.

**Before editing:**

1. Inspect the owner, actual consumers and nearest working sibling.
2. Map the user responsibilities, state and lifecycle owner, reusable controls,
   readers and commands.
3. Preserve scope, authority, reads, mutations and navigation. Resolve unclear
   ownership before implementation.
4. Select checks and any live verification needed for this slice.
5. Before the first edit, report the inspected composition in a concise progress
   update: the existing parent surface, named lower owners being reused, nearest
   maintained consumer, and the exact App/domain delta. A package dependency,
   screenshot, assembly declaration or list of native controls is insufficient.
   Inspect the chosen reference itself for compliance; existing source may be
   migration debt. If no suitable composition exists, state that gap and resolve
   its ownership before implementing a substitute.

**Before reporting completion:**

1. Inspect the actual consuming result against the relevant pattern and intended
   user outcome, following the affected route, composition, registration,
   consumers and route-to-command path as applicable.
2. Confirm there is no duplicate read, command owner or authority; preserve
   cleanup, accessibility, error and stale-completion behavior.
3. Run the selected checks, fix concrete gaps within scope, and report what was
   and was not verified.
4. Confirm the applicable living context still points to current owners and
   evidence.
5. Report FireUX fit evidence separately from functional checks: identify the
   inspected reference and actual consumers, name the reused parent and lower
   owners, and explain each retained difference. Typechecks, rendered metadata
   tests, screenshots alone and use of native controls cannot prove overall fit.
   UI changes need rendered review at affected viewport sizes and interaction
   checks appropriate to the change. Nonvisual changes need evidence at the real
   consumer, registration or command boundary. When challenged about drift,
   return to this start gate before rewriting.
6. Do not call the outcome done while a known fit gap or required inspection
   remains outstanding. If the actual result cannot be inspected, report the
   implementation, review or verification as pending, name the missing evidence
   or blocker, and limit completion claims to the scope actually verified.

The detailed UI and Entity conventions live in [components](../concepts/components.md),
[pages](../concepts/pages.md), [layouts](../concepts/layouts.md),
[composables](../concepts/composables.md),
[Lasagne](../concepts/lasagne.md) and the applicable family map.

## UI and design system

Nuxt UI owns its component, accessibility and theming APIs. FireUX Core adds
only proved shared visual or interaction responsibilities; domains retain their
business meaning and Apps retain deliberate product framing.

Use supported native controls, inherited shared semantic styles and design tokens
first. Authored Tailwind utility classes are disallowed by default in templates,
bound class expressions, script-generated strings, per-instance `ui` overrides,
new theme recipes, helpers, constants and `@apply`. The only exception is the
exact adjustment explicitly approved by the human; that approval does not extend
to other locations or later changes. Nuxt UI may use Tailwind internally.

Existing authored utilities without that approval are migration debt, not
approved exceptions or precedent. Remove redundant overrides; do not convert
utility recipes into local CSS to evade the rule. Local semantic styling still
needs an owned presentation or structural responsibility and shared tokens.
There is no implicit local-layout, final-polish or future-design exception.

The [layouts map](../concepts/layouts.md#app-root-provider-ownership) covers roots,
landmarks and provider lifecycles; [components](../concepts/components.md) covers
registration, publication and presentation roles.
Native appearance ownership is mapped in [colour mode](../concepts/color-mode.md),
App settings in [App configuration](../concepts/app-config.md#configuration-boundaries),
and artwork contracts in [brand assets](../concepts/brand-assets.md).

### Vue file convention

Use the [component file convention](../concepts/components.md#vue-file-convention)
for SFC block order, component runtime trees and bounded static component
namespace entrypoints. Explicitly imported
[component-private presentation composables](../concepts/composables.md#component-private-presentation-composables)
may be colocated when warranted; domain acquisition, commands and shared state
retain their technical owners. Follow the
[local namespace adoption rule](../concepts/components.md#local-component-namespaces)
during substantive component development; incidental touches and bulk conversion
do not trigger adoption. Format changed files with the existing formatter and
run applicable lint checks; do not claim enforcement for rules absent from their
configuration.

## FireUX source spine

A FireUX package runtime is the native Nuxt spine plus sibling FireUX Entity
roots and the existing shared Workspace owner where justified. Each Entity has
only its required Nuxt-style technical roles and optional owned `records/`;
there is no Entity spine inside another Entity spine. A first-class Entity belongs
at the owning package runtime root. Parent-owned support truth stays a Record
inside its owner, with behavior in that owner's technical roles and no miniature
record spine. Classify ownership and lifecycle before choosing placement.

Native pages, layouts, middleware, plugins and HTTP API entrypoints stay on the
outer Nuxt spine; an Entity is not another complete Nuxt application. Source
flattening changes neither stored scope nor authority. Current nested Entity
source remains migration debt until a complete consumer cutover. Workspace's
current shared ownership stays intact while its terminology is reviewed.

Carry only the responsibilities actually needed; do not create symmetric
folders or forwarding layers. The shared Workspace runtime owns frame/selection
mechanics, not domain records. Domain component audiences and library admission
follow the [surface convention](../concepts/components.md#domain-component-surfaces);
component grouping moves no model, reader, state or command authority.

The [runtime filesystem map](../concepts/runtime-filesystem.md) owns placement;
[App configuration](../concepts/app-config.md#app-content-and-styles) owns authored
content, styles and environment boundaries. Retired runtime demos and future
sample-data admission are covered by [Demo data](../concepts/demo-data.md).

## Shared utility boundary

A technical label does not establish shared ownership. Before adding a model,
type or utility, identify its owner, actual consumers and responsibility.
Root-level shared directories require demonstrated cross-owner reuse, not
hypothetical future use. Keep supporting types beside their implementation when
they have no independent consumer. Remove unused contracts rather than relocating
them; do not create barrels, aliases or generic bags merely to tidy the tree.

The [runtime filesystem contract](../concepts/runtime-filesystem.md#shared-utility-boundary)
distinguishes models, coordination types and stateless helpers. Concrete shared
contracts and their consumers are mapped in [Core models](../concepts/core-models.md#stored-records);
reader and provided-context responsibilities live in
[composable naming](../concepts/composables.md#names-describe-responsibility).

## Entities, Workspace and data authority

An Entity owns its records, readers, validation, permissions and protected
commands. A collection or visible Workspace alone does not establish an Entity
or storage owner. UI placement and navigation groups do not change authority.
Preserve exact owner, scope and lifecycle in cross-domain flows.

User identity, App membership and subscription entitlement are distinct facts.
Feature entitlement belongs to the acting User, separately from permission to
edit the selected Entity. Public projections omit protected data;
hiding it in Vue is not authorization. Routes and UI availability grant no
mutation authority. Protected writes use a named trusted command that validates
the exact target.

Workspace operational currency belongs to the selected Entity, independently
of Place geography. Follow the shared [currency boundary](../concepts/family-workspace-entity.md#operational-default-currency)
for optional defaults, domain editing authority and separately denominated
prices and financial records.

Supported mutable readers deliver authorized record changes to open pages by
default, including changes made in another browser. Domains declare safe
projections, exact scope and authority; Core owns shared connection, refresh,
reconnect, deduplication and disposal. Direct Firestore bindings retain their
native owner. Ordinary App consumers do not install listeners or select a live
transport. The [server API contract](../concepts/server-api.md#api-reads-and-refresh)
and [reader contract](../concepts/composables.md#native-api-read-ownership)
locate the supported mechanics and verification boundaries.

Concrete identity and membership contracts are mapped in
[Core models](../concepts/core-models.md) and [Entities](../concepts/entities.md).
[Workspace Entity composition](../concepts/family-workspace-entity.md#shared-spine)
maps shared lifecycle, stamp and membership-bound access contracts.
[Composables](../concepts/composables.md#shared-read-outcomes) locates read outcomes
and native acquisition/refresh owners; [components](../concepts/components.md#state-presentation)
covers feedback presentation. Storage and command boundaries are mapped in
[Firestore ownership](../concepts/firestore-entity.md),
[server APIs](../concepts/server-api.md) and the
[mutation context](firestore-mutations-context.md).

## Firebase security boundary

Firebase behavior is documented upstream; FireUX owns its product data,
authorization and release decisions. Firestore Security Rules protect client SDK
requests. Trusted Admin/server SDKs use server IAM and must enforce the domain
command's authority independently; do not treat Rules as filters or as server
authorization.

The currently accepted open-development Rules policy is explicitly scoped in
the [Firestore mutation context](firestore-mutations-context.md). It is not a
privacy guarantee or shipping authorization. Stored data, authored Rules and
deployed Rules are separate evidence; live policy requires an authorized
readback.

Migrations require an exact read-only plan, retained preimages, target
verification and separate copy and retirement authority. Consult the owning
Firestore and App/Ecosystem context before any connected operation. No
documentation audit authorizes live data changes or deployment.

## Product language

FireUX describes an industry SaaS framework for founders and teams building
industry software. Public product copy, scoped App work and branded App requests
retain their distinct owners. Use current fields, states, commands and pages as
evidence; a proposal or connected source is not a shipped capability.

Derive product language from the owning capability. Product intake, commercial
terms and delivery do not take ownership of its shared tool or grant editing
permission, entitlement or unlimited provider usage. The
[product-language map](../concepts/product-language.md) owns vocabulary, product
packaging and pricing boundaries; the [Entity map](../concepts/entities.md#subscription-naming-migration)
owns supported subscription migration semantics. Research guidance stays with
the routed [research owner](../../packages/extensions/fireux-ai/docs/ai/research-context.md).

## Working and verification rules

When the human delegates an agreed multi-step outcome, continue through the
remaining authorized local steps without asking for approval after each small
inspection or repair. Close accepted slices and reopen them only for a concrete
regression or an explicit change of outcome. Report meaningful completed work
and exact blockers; do not substitute repeated audits or optional symmetry
cleanup for progress. Separate release-only gates from functional dependencies.

Codex Main is the repository entry and coordination chat. Name bounded source
tasks `<manifest-name>[/actual-domain] — <outcome>` and identify the exact owner
path, real consumers, acceptance evidence and blocker in the handoff. Use a
domain suffix only for a source-backed responsibility. Keep one implementation
owner for overlapping paths and server processes; a package does not require a
permanent chat. `pnpm codex:map` derives the repository inventory from current
source, with an optional external thread snapshot. Generated task status stays
outside living context; `AGENTS.md` remains the required-context router.

- Before editing, inspect the current checkout and `git status`. Work directly
  on `main` in the shared checkout and preserve unrelated and concurrent work.
  Do not create branches or worktrees unless the user explicitly requests an
  exception.
- Never stage, commit, push, deploy or modify live data without user
  authorization for that action. `pnpm gitsave` requires `main`, stages shared
  work, commits and pushes `origin/main`. Run it only after an explicit save request.
- For an explicit routine save, reuse already loaded guidance when it remains
  current. Use one compact preflight for checkout, branch and shared change
  summary, run the existing `pnpm gitsave`, then use one final check for commit,
  working-tree and sync status. Report the short commit and clean/sync result.
  Do not add broad tests, a fresh architecture audit, delegation or another Git
  workflow to an ordinary shared checkpoint. If the preflight reveals a concrete
  blocker such as conflicts or the wrong branch, report it without silently
  changing branches or discarding work. Explicit save authority covers the
  shared checkpoint, including unrelated changes; it does not authorize editing
  those changes.
- IDE tasks, launch entries and workspaces are generated through `pnpm ide:sync`
  from App-owned manifests and the existing launcher discovery. Use
  [the IDE workflow](../../tools/ide/README.md) for focused checks; keep generated
  configuration current with `pnpm ide:check`.
- Use focused package checks and source-owned tests for code changes. For
  prose-only changes, verify claims, local paths and anchors, then run
  git diff --check.
- Prefer tests of behaviour, domain authority, state transitions and reproduced
  regressions. Keep tests outside runtime and align their paths with the owning
  source area or user journey; shared test execution belongs to
  `tools/ide`. Use the [focused test workflow](../../tools/ide/README.md#choosing-tests)
  and simplify stale mocks or incidental source-shape assertions when touching
  their responsibility. Passing Node tests does not replace type or browser checks.
- A typecheck proves compilation. A guard proves only its encoded contract.
  Neither proves ownership, live behavior or repository-wide alignment.

## Evidence claims

Qualify aligned, canonical, fixed, complete and done by inspected scope:

- Locally aligned: owner, registration and immediate consumers were inspected.
- Family aligned: every maintained member, owner, route, authority and relevant
  check in that family was compared.
- Repository aligned: the maintained ownership and dependency inventory was
  audited and every difference classified.

State the inspected boundary and remaining uncertainty. Do not label a bounded
repair as completion of its parent task.

## Authority and rule review

Use this evidence order: current source; available guards and tests; scoped
contexts at their owner; concept maps; then README placeholders and historical
material. Human decisions, requirements and acceptance criteria are product
authority for their stated scope. Source establishes behavior, not whether that
behavior is desirable.

Reopen a rule when source contradicts it, consumers repeatedly work around it,
exceptions or duplication accumulate, enforcement repeatedly fails, or the
human requests an architecture review. Classify the result as keep, simplify,
narrow, replace, remove or unproved. Before weakening a safety or authority
boundary, name the evidence, affected consumers, consequences, transition and
verification.

## Living-context maintenance

Update this file only when a stable repo-wide boundary changes. Update a scoped
context when its package or product boundary changes; update both only when both
layers change. Keep scope routing only in [AGENTS.md](../../AGENTS.md).

Prefer an existing owner. Create a scoped context only for recurring guidance
that has no better owner. It must inherit this file and AGENTS.md, define its
scope, ownership, authority, refresh and verification expectations, and link to
current source and checks. Keep task status, chat history, speculative plans,
duplicate inventories and stale test claims out of living context.

Follow the [documentation map](../concepts/documentation.md) for durable-doc
roles, links, metadata and maintenance.
