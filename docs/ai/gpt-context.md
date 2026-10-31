# FireUX GPT Context

Updated: 2026-10-31
Ref: ce2861c77
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

This is the platform ownership principle for design, implementation and review.
Use native behavior by default. A FireUX abstraction must earn its place with a
specific product responsibility or a demonstrated integration gap.

FireUX is an industry SaaS framework built by composing shared SaaS foundations
with industry libraries. Start with the [platform map](../concepts/fireux.md)
for the composition picture; use official upstream docs for framework behavior
and FireUX maps for FireUX-owned choices.

Implementation follows this dependency direction:

- Apps own deployment, routes and adapters, configuration, brand, SEO and
  genuinely App-specific presentation.
- Ecosystems own real cross-extension composition reused by their Apps.
- Extensions own reusable domains, Entities, capabilities, data authority and
  trusted behavior.
- Core owns proved product-neutral FireUX and Nuxt mechanics.

An App may consume Core or an Extension directly. Ecosystems may consume Core
and lower Extensions; Extensions may consume Core and lower Extensions. Core
does not depend on product packages. Keep implementation with the lowest owner
that has its complete meaning and authority. See
[repository ownership](../concepts/fireux-mono.md),
[runtime placement](../concepts/runtime-filesystem.md), and
[package contracts](../concepts/runtime-package.md).

Packages keep authored implementation in src, identity and commands in
package.json, typing in tsconfig.json, and entrypoint explanations in README.
Use the package manifest as the source for dependencies and version pins; do not
copy a version inventory into living context.

## New work and composition

Before editing:

1. Name the owner and the nearest working sibling.
2. Map user responsibilities to the parent composition, state and lifecycle
   owner, and focused children.
3. Name the supported lower components, readers and commands to reuse.
4. Preserve data scope, permissions, mutation and navigation contracts.
5. Choose checks that prove the changed responsibility.

Nuxt layouts consume their supplied content through the native layout slot.
Use `NuxtPage` for an App or family route outlet and real parent/child routes;
keep each outlet with its owning shell. See [layouts](../concepts/layouts.md).

Composition is a completion gate. Settle ownership and composition before
expanding behavior. A working demo or passing tests do not close a change while
known composition gaps remain. Report composition evidence separately from
functional evidence; correct known duplication and misplaced ownership in the
same change rather than deferring them to a cleanup phase.

Unshipped implementations follow the same current contract regardless of age.
Do not preserve conflicting shapes as older/newer variants or add compatibility
adapters for a completed migration without a proved external compatibility need.

Composition is the default from the first implementation. Keep parents readable
as named responsibilities. Add a child only when it owns real behavior; small
cohesive controls may stay local. Do not add forwarding wrappers, empty
controllers or universal abstractions to make file trees look symmetrical.

### Mandatory composition checks

These start and finish gates apply to implementation and structural changes.
Scale them to the work and report the findings; do not create a permanent task
checklist.

**Before editing:**

1. Identify the owner and nearest working sibling.
2. Map the user responsibilities, state and lifecycle owner, reusable controls,
   readers and commands.
3. Preserve scope, authority, reads, mutations and navigation. Resolve unclear
   ownership before implementation.
4. Select checks and any live verification needed for this slice.

**Before reporting completion:**

1. Inspect the affected route, composition, registration, consumers and
   route-to-command path.
2. Confirm there is no duplicate read, command owner or authority; preserve
   cleanup, accessibility, error and stale-completion behavior.
3. Run the selected checks, fix concrete gaps within scope, and report what was
   and was not verified.
4. Confirm the applicable living context still points to current owners and
   evidence.

The detailed UI and Entity conventions live in [components](../concepts/components.md),
[pages](../concepts/pages.md), [layouts](../concepts/layouts.md),
[composables](../concepts/composables.md),
[Lasagne](../concepts/lasagne.md) and the applicable family map.

## UI and design system

App roots provide Nuxt UI's native `UApp` once around shared controls, normally
through Core AppShell. Custom roots preserve that provider and their explicit
route-outlet ownership. See [the rendering map](../concepts/layouts.md).

Nuxt UI owns its component API, accessibility behavior and theming API.
FireUX Core adds only proved shared visual or interaction responsibilities;
domains keep their business meaning and Apps keep deliberate product framing.
Use native Nuxt colour-mode state and persistence; do not add a parallel
preference store, media listener or root-class observer. Appearance preference
is stored automatically, initially following the device; other storage triggers
remain governed by the feature inventory. Use the current stable Nuxt UI API
and inspect real consumers before retiring a FireUX mechanism. See the [Nuxt UI integration map](../concepts/nuxt-ui.md).

Authored Tailwind utility classes are banned in FireUX templates, bound class
expressions, script-generated strings, per-instance ui overrides and new theme
recipes. Do not hide utility recipes in helpers, constants or @apply. Consume
supported component props and slots, semantic classes and design tokens. Nuxt
UI may use Tailwind internally. Existing authored utilities are migration debt,
not permission to add more. There is no implicit local-layout or final-polish
exception; a unique final-element adjustment requires explicit human approval
for that adjustment.

Core shared UI uses the `Fire` library prefix. Atomic Design folders such as
atoms, molecules and organisms are internal organisation and are omitted from
public names: `FireState`, `FireCollectionPagination`. Domain and
Workspace registrations retain their named prefixes. App-local overrides of a
shared component retain its canonical Fire name. The native Core runtime layer
owns shared-library registration.

Use Nuxt's generated component names when package registration provides them.
Do not add an explicit import or alias without an inspected registration gap or
name collision. See [component ownership and reuse](../concepts/components.md).

## Shared utility boundary

Core `runtime/utils` owns small stateless transformations and validators for
shared FireUX value contracts. It does not own reactive/browser lifecycle,
fetching, authentication coordination, onboarding workflow, product literature
or Entity-specific target definitions. Authored utility filenames use kebab-case;
exported functions use camelCase. Scope-specific stateless helpers may live under
a named utility scope, such as `runtime/utils/diagnostics/format.ts`, rather than
posing as composables. Collocate stateful responsibilities with
their existing system or Entity owner. Do not create forwarding wrappers or
mandatory utility folders; use native framework/platform primitives where no
FireUX rule is required. See the runtime filesystem map.

## Entities, Workspace and data authority

A root Firestore collection can establish an Entity family when its model,
authority, routes and behavior prove that contract. The Entity owns its data,
readers, validation, permissions and protected commands. Workspace is a product
surface over an Entity, not a storage owner. UI placement and navigation groups
do not change data ownership.

User is the person; AppUser is membership in one App. A tenant App remains an
App role and uses the same Entity contracts. Every App declares its canonical
Ecosystem relationship, including standalone Apps. Preserve exact owner,
scope and lifecycle in cross-domain and account-connection flows.

The Workspace surface exists on arrival, even with no saved Entity. An `empty`
read is not a missing Workspace or onboarding flag; creating a record still
uses its owning command and authority. See
[Workspace and Entity composition](../concepts/family-workspace-entity.md).

Optional cross-ecosystem account connections preserve each Auth realm and UID
and do not create local User, AppUser or Workspace grants. Login authority stays
in a separate server-only store. Follow the
[account connections context](account-connections-context.md).

Direct Firestore views use the owning Firebase listener. Server-only API
projections use native Nuxt `useAsyncData`/`useFetch`, with `refreshNuxtData`
after successful actions and explicit refresh when needed. They do not receive
automatic updates from another browser. FireUX does not add a custom SSE,
connection-sharing or polling bridge around these native owners.
Public projections omit protected children; hiding data in Vue is not
authorization. Routes and UI availability do not grant mutation authority.
Protected writes use a named trusted command that validates the exact target.

See [Entity ownership](../concepts/entities.md),
[Workspace and Entity composition](../concepts/family-workspace-entity.md),
[Firestore data ownership](../concepts/firestore-entity.md),
[server APIs](../concepts/server-api.md), and
[Firestore mutation authority](firestore-mutations-context.md).

Shared read outcomes are exactly `idle`, `pending`, `error`, `empty` and `ready`.
A successful read without content is `empty` for documents and collections.
Consumers own contextual copy and domain policy; they do not add synonyms to
this read contract. Core `runtime/utils/read-outcome.ts` classifies normalized
boolean facts without document/collection kind. HTTP absence and reader identity
checks remain at their adapter/reader owners. There is no missing compatibility
status or adapter. See [composables](../concepts/composables.md).

Collection-page presentation preserves its reader’s outcome unchanged. A reader
owns whether retained rows remain valid after pagination fails; an old paging
error must not turn a later idle, pending, empty or error read into ready.
Collection coordinators supply diagnostic facts only; the diagnostics component
owns display defaults and defaults supplied objects to passed provenance.
Domain search supplies explicit searchable fields where hidden/internal values
or presentation metadata would otherwise become accidental search inputs.

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
industry software. Public product copy, scoped App work and branded App
requests retain their distinct owners and routes. Use current fields, states,
commands and pages as evidence; a proposal or connected source is not a shipped
capability. Feature entitlement belongs to the acting User, separately from
permission to edit the selected Entity.
A public Product packages a domain capability; it does not become the owner of
the underlying tool. Workspace may expose that same capability directly with
richer domain configuration, without requiring purchase of the public service.
Product intake, commercial terms and delivery stay above the shared tool.
Existing access and resource-usage policies still apply; this is not unlimited
provider usage or an automatic grant of editing authority. See
[product language](../concepts/product-language.md) and the routed product
contexts.

## Working and verification rules

When the human delegates an agreed multi-step outcome, continue through the
remaining authorized local steps without asking for approval after each small
inspection or repair. Close accepted slices and reopen them only for a concrete
regression or an explicit change of outcome. Report meaningful completed work
and exact blockers; do not substitute repeated audits or optional symmetry
cleanup for progress. Separate release-only gates from functional dependencies.

- Preserve unrelated and concurrent work. Inspect the shared checkout before
  editing; do not switch its branch or create a worktree unless requested.
- Never stage, commit, push, deploy or modify live data without user
  authorization for that action. gitsave stages shared work and requires an
  explicit save request.
- IDE tasks, launch entries and workspaces are generated through `pnpm ide:sync`
  from App-owned manifests and the existing launcher discovery. Use
  [the IDE workflow](../../tools/ide/README.md) for focused checks; keep generated
  configuration current with `pnpm ide:check`.
- Use focused package checks and source-owned tests for code changes. For
  prose-only changes, verify claims, local paths and anchors, then run
  git diff --check.
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
