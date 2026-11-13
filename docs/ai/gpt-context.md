# FireUX GPT Context

Updated: 2026-11-12
Ref: ac88daacf
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

`fireux-core` owns the shared Firebase/VueFire integration, including Admin
initialization and browser Auth persistence. The public reference is the
App-selected `fireux-docs` extension and is not a Core dependency.

`fireux-app` composes the standard App: its public presentation layer, Core,
Blogs, Products and AI. It owns reusable commercial offers and pricing UI,
public landing composition, styles and motion, legal documents and public catalogue
pages. The Ecosystem layer owns Main App discovery and child-App composition.
Core retains neutral controls and layouts, account consent, membership,
subscription access and capacity checks. Tenant and
standalone Apps use `defineFireuxApp` from `fireux-app/config`; Ecosystem Main
Apps use `defineFireuxEcosystem` from `fireux-ecosystem/config`. The Ecosystem
bundle includes the App bundle and shared Main App surfaces. Core can be used
independently and never imports either bundle or a product package.
AI is available through the App bundle; execution remains explicitly enabled
by the consuming feature and its provider configuration.
Provider/model presentation belongs to `fireux-ai`. Core Workspace prompts
remain passive controls and expose a slot for optional model information;
they do not read AI configuration or choose a provider/model label.

Each ecosystem owns Firebase SSR region and execution identity in its `ssr`
configuration. Core applies those values without a named-ecosystem region map.

FireUX, Misebox, BuenoHost, Bringli and Granite own their native Workspace-composition
layers. Apps select these layers explicitly; named ecosystems use native module
dependencies for selected Workspaces so configured module options are preserved.
Core layer positions remain explicit only where needed for precedence.

The App bundle owns default module and native-layer registration. Concrete Apps
declare their selected bundle and the packages they import or configure directly.
Package-specific options use native module tuples. Core's `componentCatalogue`
option replaces the former public-runtime catalogue marker; Kitchens owns opt-in
`ordering.channels` and its projection to the existing runtime contract.
Named Ecosystem packages still own their bindings and domain composition; they
do not import the Main App bundle merely because tenants share that Ecosystem.

Ecosystem Main Apps own shared public documentation. Tenant and standalone Apps
include documentation only for an explicit product need and may link to their
Ecosystem's guides. Documentation layers are selected by the App.

`fireux-projects` owns the Project domain and Workspace. `fireux-fireux`
selects it for Project Workspace and retains FireUX platform-specific App
creation. Core and the standard App bundle do not depend on Projects.

`fireux-sproochli` owns shared translation and multilingual-copy capabilities.
Apps own their source copy, language profiles and approved text. See the
[translation map](../concepts/translation.md) for that boundary.

An App may consume its own Ecosystem package, Core or an Extension directly.
Ecosystems may consume Core
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

Reusable libraries under `packages/` use `fireux-*` names. Development tools
live under `tools/` and use tool-specific names outside that prefix. Inventory
libraries, Apps and development tools separately.

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
5. Before the first edit, report the inspected composition in a concise progress
   update: the existing parent surface, named lower owners being reused, nearest
   maintained consumer, and the exact App/domain delta. A package dependency,
   screenshot, assembly declaration or list of native controls is insufficient.
   Inspect the chosen reference itself for compliance; existing source may be
   migration debt. If no suitable composition exists, state that gap and resolve
   its ownership before implementing a substitute.

**Before reporting completion:**

1. Inspect the affected route, composition, registration, consumers and
   route-to-command path.
2. Confirm there is no duplicate read, command owner or authority; preserve
   cleanup, accessibility, error and stale-completion behavior.
3. Run the selected checks, fix concrete gaps within scope, and report what was
   and was not verified.
4. Confirm the applicable living context still points to current owners and
   evidence.
5. Report composition evidence separately from functional checks: name the
   reused parent and lower owners and explain each retained custom boundary.
   Typechecks, rendered metadata tests and use of native controls cannot prove
   design or architectural alignment. A visual change also needs visual review
   at the affected viewport sizes before claiming its presentation is verified.
   When challenged about drift, return to this start gate before rewriting.

The detailed UI and Entity conventions live in [components](../concepts/components.md),
[pages](../concepts/pages.md), [layouts](../concepts/layouts.md),
[composables](../concepts/composables.md),
[Lasagne](../concepts/lasagne.md) and the applicable family map.

## UI and design system

Apps without Workspaces use Core `FireuxApp`; Apps declaring Workspaces use
`FireuxWorkspaceApp`. The Workspace root composes the ordinary root through a
conditional native slot, sharing one `UApp` provider and App initialization
lifecycle. App role does not choose the root. App-owned theme and
language setup may remain around that delegation. Go QR's documented embedded
tool branch retains its separate provider/outlet; another bypass needs a real
product and lifecycle justification. See [the rendering map](../concepts/layouts.md).

FireuxApp supplies the normal page's single `UMain` inside the selected layout;
WorkspacePage owns the Workspace landmark. The Workspace-capable root loads that frame lazily when the route requests it.
The ordinary root and its head composable import no Workspace behavior. This is
a root-composition boundary, not a guarantee that shared navigation imports no
Workspace entry helpers. Shared sign-in phase belongs to Core authentication
through `useAuthPhase`, independent of Workspace. Layouts and page descendants do not
add another `main`. The developer dock stays inside native `DevOnly` so its
component setup and dock-only code are excluded from production execution.

Nuxt UI owns its component API, accessibility behavior and theming API.
FireUX Core adds only proved shared visual or interaction responsibilities;
domains keep their business meaning and Apps keep deliberate product framing.
App-authored palette and typography live in `app/app.config.ts` under `theme`,
alongside native Nuxt UI and navigation settings. Core head and manifest consumers
read that source through `useAppConfig`; assembly/runtime FireUX config carries
no theme copy. Stored Workspace and domain themes retain their own owners.
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

For the current simple surfaces, inherit the native component, theme or existing
shared semantic style. Remove redundant utility overrides rather than copying
them into new CSS. Flag a concrete visibility, accessibility or geometry need
before retaining an exception; future unique or pixel-perfect work does not
authorize utility classes in current work.

Core owns the explicit public component catalogue in
`src/catalogue/public-components.mjs`; Docs publishes those supported building
blocks with safe previews. Nuxt registration does not publish a component.
Example-only components and fixture data belong with their consuming reference,
outside Core runtime.
The complete source inventory is development-only at `/dev/core-components`.

Core shared UI uses the `Fire` library prefix. Atomic Design folders such as
atoms, molecules and organisms are internal organisation and are omitted from
public names: `FireState`, `FireCollectionPagination`. Domain and
Workspace registrations retain their named prefixes. App-local overrides of a
shared component retain its canonical Fire name. The native Core runtime layer
owns shared-library registration.
`FireuxApp` and `FireuxWorkspaceApp` are the explicitly registered Core roots. The other App,
Workspace, Ecosystem and User registrations retain their existing prefixes.

Use Nuxt's generated component names when package registration provides them.
Do not add an explicit import or alias without an inspected registration gap or
name collision. See [component ownership and reuse](../concepts/components.md).

Entity Cards use Pill, Cell, Preview and Overview as presentation roles. User-owned
profile records retain their domain names. A Workspace Overview may compose a
Cards/Overview surface alongside its other sections; the card remains reusable
in Detail and other consumers. See the [Cards family](../concepts/card-family.md).

Apps provide the standard artwork family under `public/img/app`. Core's single
asset inspector is used by the all-App CI audit, production App builds, setup
diagnostics and release artifact checks. Run `pnpm check:assets` locally after
asset changes. These gates validate file and image contracts; brand approval,
faithful geometry and visual contrast still require review through the App's
asset previews. See [asset ownership and enforcement](../concepts/brand-assets.md).

### Vue file convention

Runtime `components` directories contain Vue components and folders of Vue
components only. Keep component-specific styles in the owning single-file
component; genuinely shared styles, content, types, utilities and composables
belong outside that tree with their existing owner. Tests may mirror component
paths beneath the separate test tree.

Authored Vue single-file components put `<template>` first, then
`<script setup>`, then any `<style>` blocks. Omit blocks that have no purpose.
This order does not replace readable composition or domain ownership. Format
changed files through the existing repository formatter and run the applicable
lint checks; do not claim those checks enforce rules absent from their config.

App public-literature contracts live in Core `runtime/app/literature/types.ts`.
The pure `defineFireuxMeta` helper lives in `runtime/app/literature/define-meta.ts`;
Workspace capability vocabulary lives in `runtime/workspace/models/capability-families.ts`.
Configuration may consume these contracts, but runtime consumers do not import
configuration loaders. `config/app/meta-content-loader.ts` alone owns the
build-time TypeScript/Markdown loading for this literature.

## Shared utility boundary

`models/`, `types/` and `utils/` are not dumping grounds. A technical label does
not establish shared ownership. Before adding a file, identify its owner, real
consumers and responsibility; place it beneath that owner. Root-level shared
directories require demonstrated cross-owner reuse, not hypothetical future use.

- Entity `models/` directories contain only `model.ts` for that Entity, including
  its owned field vocabulary. Child Entities own their own spines and model;
  contracts, projections, configuration and executable helpers stay outside models.
  Apply this shape to new and migrated owners; review remaining legacy entries
  before moving or removing them. Generic Core models are pending that review
  and must receive no new declarations.
- `types/` holds genuine runtime or integration coordination contracts. It is
  not an alternative location for domain models or unused speculative types.
- `utils/` holds focused stateless behavior. It must not hide canonical record
  definitions, workflows, reactive state, readers or commands.

Keep supporting types beside their implementation when they have no independent
consumer. Remove unused contracts rather than relocating them. Do not create
barrels, aliases, generic bags or symmetric folders merely to tidy the tree.
Review ownership and consumers when changing these directories, not just names.

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

Business is an independent Workspace Entity owned by `fireux-businesses`; it replaces the former Company/Place role. Business may use Free, and optional capabilities retain their own domain owners. Place links do not own the Business lifecycle.

User setup belongs to `runtime/user/composables/account/useUserSetup.ts`;
`useAuth` owns the Firebase session and provider actions without constructing
setup state. Setup derives missing identity, consent and App membership from
current readers and writes only after an explicit action. Existing Users join
another App without repeating current consent. See [identity and membership](../concepts/entities.md#identity-plus-membership).

Core User owns the shared profile contracts in `runtime/user/models`, profile
read/create/update composables in `runtime/user/composables/profile`, and trusted
provisioning in `runtime/user/server/profile`. Domain extensions retain their
exact profile models, seeds and fixed endpoints; App membership remains App-owned.

User is the person; AppUser is membership in one App. A tenant App remains an
App role and uses the same Entity contracts. Every App declares its canonical
Ecosystem relationship, including standalone Apps. Preserve exact owner,
scope and lifecycle in cross-domain flows.

Browser App membership readers and Workspace grant readers reuse Core's
`resolveAppUserAccess` decision: a recognized role and readable subscription
are both required. Domain grants additionally bind to the exact membership
creation timestamp; selection and Team roster labels never replace that check.

New Entity roots initialize both `created` and `updated` in the same trusted
creation event. Later updates preserve `created` and replace `updated`.
Shared stamp types keep App provenance on `created`; domain-specific historical
stamp data remains readable until its owner defines a reviewed migration.
This convention does not authorize backfills or require a universal Entity
superclass. See [Workspace Entity contracts](../concepts/family-workspace-entity.md#shared-spine).

App and Ecosystem declare their own complete Entity shapes, including document
identity and optional private context. They reuse `FireuxStamps` for creation
and update values; there is no generic Entity base. Their readers still own
public projections and their commands retain database and mutation authority.

App's initialization contract lives in `runtime/app/contracts/initialization.ts`.
AppUser is the App-scoped membership Entity at `runtime/app/app-user`, with its
own `models/model.ts`, projections, membership contract, readers, UI, access
validation and trusted commands. Its target factory retains the existing runtime
database and `apps/{appId}/users/{userId}` path. App initialization and App/User
sessions compose those owners; they do not create another membership authority.
AppUser values never replace canonical User identity. App events remain App-owned.

The Workspace surface exists on arrival, even with no saved Entity. An `empty`
read is not a missing Workspace or onboarding flag; creating a record still
uses its owning command and authority. See
[Workspace and Entity composition](../concepts/family-workspace-entity.md).

Direct Firestore views use the owning Firebase listener. Server-only API
projections use native Nuxt `useAsyncData`/`useFetch`, with `refreshNuxtData`
after successful actions and explicit refresh when needed. They do not receive
automatic updates from another browser. FireUX does not add a custom SSE,
connection-sharing or polling bridge around these native owners.
Public projections omit protected children; hiding data in Vue is not
authorization. Routes and UI availability do not grant mutation authority.
Protected writes use a named trusted command that validates the exact target.

Core route middleware checks static Workspace availability on server and client.
Client session and role decisions share `runtime/composables/navigation/route-auth.ts`;
the Dashboard's `useAuthRedirect` separately handles sign-out while mounted.
These navigation checks do not replace trusted command authority. See
[route availability and sign-in](../concepts/pages.md#route-availability-and-sign-in).

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

`FireState` is the small shared read-feedback surface. It consumes `ReadOutcome`,
owns accessible pending/error/empty messages, error copying and an optional retry
event, and renders nothing for idle/ready. Domains compose native `UAlert` or
`UCard` for their own copy, links and actions; do not add a parallel state-card
contract or translate pending into a presentation-specific loading status.

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
SaaS plan offers belong to Ecosystem main Apps, not tenant Apps. Core supplies
the shared Free, Pro and Business access and capacity mechanics; `fireux-app`
owns their commercial presentation. Canonical
subscription IDs are `free`, `pro` and `business`. The App-owned subscription
reader maps legacy stored `premium` to `pro` during the explicitly staged
migration in [App membership](../concepts/entities.md#subscription-naming-migration).
Subscription entitlement and Business identity are separate. A Business may use
Free. Upgrading to the Business plan must collect additional business details
through its owning identity command once that contract is defined. A shared
tier is not evidence of paid billing or cross-App entitlement reconciliation.
A public Product packages a domain capability; it does not become the owner of
the underlying tool. Workspace may expose that same capability directly with
richer domain configuration, without requiring purchase of the public service.
Product intake, commercial terms and delivery stay above the shared tool.
Existing access and resource-usage policies still apply; this is not unlimited
provider usage or an automatic grant of editing authority. See
[product language](../concepts/product-language.md) and the routed product
contexts.

`fireux-ai` owns the complete optional App research feature: data contract,
pure reference validation, server-only App-file loading, API and static review
pages. Apps own their authored `app/search-demand.ts` data. The standard App
bundle supplies the AI module and native layer; static research remains available
when AI execution is disabled and makes no provider request. Research data is not
Nuxt assembly configuration or runtime capability authority. See the owning
[research context](../../packages/extensions/fireux-ai/docs/ai/research-context.md).

## Working and verification rules

When the human delegates an agreed multi-step outcome, continue through the
remaining authorized local steps without asking for approval after each small
inspection or repair. Close accepted slices and reopen them only for a concrete
regression or an explicit change of outcome. Report meaningful completed work
and exact blockers; do not substitute repeated audits or optional symmetry
cleanup for progress. Separate release-only gates from functional dependencies.

- Work directly on `main` in the shared checkout. Preserve unrelated and
  concurrent work. Do not create branches or worktrees unless the user explicitly
  requests an exception.
- Shared Firebase artifact tooling lives in `tools/firebase-release`; App manifests
  retain explicit targets and build origins, and App-owned policy gates retain
  release authority. It never deploys Rules or provisions Auth. See the tool README.
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
