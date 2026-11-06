# Runtime package family

Updated: 2026-11-06
Ref: b8e3b2348
Role: map, not canon

## Package root spine

The common authored root is `src/`, `package.json`, `tsconfig.json` and
`README.md`. Manifests own package identity, dependencies, exports and commands.
There is no separate package metadata registry. Runtime App and Ecosystem records
retain their domain identity; package metadata does not replace those records.

Build files are present only for a real build responsibility. Core's
`build.config.ts` calls `build/config.mjs`; its `prepack` command calls the same
compiler to supply production configuration exports. Other packages use the
module-builder defaults unless their own source establishes another need.
Package-owned `docs/` and existing required configuration files remain scoped to
their actual responsibilities. `.nuxt/`, `dist/` and `node_modules/` are generated
or installed content, excluded from the authored root.

## Purpose

Map how FireUX packages expose reusable runtime surfaces to Nuxt Apps and why
Core, Ecosystem, and Extension packages legitimately differ.

## Links

- Parent: `fireux.md`
- Children: `runtime-filesystem.md`, `components.md`, `composables.md`,
  `pages.md`, `server-api.md`
- Horizontal: `pnpm.md`, `app-config.md`, `spine.md`
- Source references: package manifests, `src/module.ts`, real config hooks,
  `src/runtime/nuxt.config.ts` where present, and App `nuxt.config.ts` layer
  declarations; verify their effects through generated Nuxt output and
  relevant source-owned tests.

## Shared spine

Read each runtime package through its module entry, any native runtime layer,
and the surfaces it owns:

```text
src/module.ts
src/config/module/*  # only for real registration/config hooks
src/runtime/nuxt.config.ts  # native layer where adopted
src/runtime/*
```

The detailed ownership contract is mapped in `runtime-filesystem.md`. Root
technical buckets such as `components`, `composables`, `models`, and `utils`
are shared across entities. Nuxt entrypoints such as `pages`, `layouts`,
`plugins`, `middleware`, and `server/api` retain their conventional locations.
Entity-owned implementation lives under `src/runtime/<entity>/<role>`. A
package carries only the hooks, entity roots, and buckets it
genuinely owns; a small package such as `fireux-docs` does
not add empty structure for symmetry.

Shared rules:

- Native layers expose conventional Nuxt runtime entrypoints at config time.
  Modules own explicit registration, options and filtering that remain necessary.
  Inspect the current owner before adding either mechanism; missing native
  layer configuration fails explicitly rather than inserting private layers.
- Register bounded entity component and composable roots through the same
  supported Nuxt Kit helpers; do not build an entity discovery framework.
- Use the Core module-wiring helper for existing module registration steps;
  it does not replace config-time native layers.
- Keep only registration hooks that perform real work.
- Models, types, information helpers, and ordinary utilities are explicit
  imports; they do not need fake registration hooks.
- Runtime TypeScript package imports are extensionless. Every runtime package
  projects that single authored form through `exports` and `typesVersions` to
  `src/runtime/*.ts`; explicit `.vue`, `.css`, and `.scss` imports retain their real
  suffix. Do not fix consumer resolution by appending `.ts` one import at a
  time.
- Use `src/types` for package-facing structural contracts and `runtime/types`
  for runtime/UI coordination. Do not create a barrel merely to hide that
  ownership boundary.
- A product-neutral utility used at both Nuxt config time and runtime may live
  at `src/utils`; Core brand-asset normalization is the current proven seam.
  Runtime-only behavior remains under `src/runtime/utils`.
- Declare every direct runtime, server, type-only, and stylesheet dependency in
  the owning package manifest.
- Project Apps compose packages; they do not re-own reusable package behavior.
- `fireux-app` owns the default Blogs, Products and AI modules and native layers,
  together with the Core layer. `fireux-ecosystem` builds on that bundle for
  Main Apps. Concrete Apps declare their selected bundle and any packages they
  import or configure directly. Core imports no App or product bundle.
- Cross-extension composition belongs in an ecosystem package or project that
  declares every participating package.
- Do not place a nested `package.json` under `src`.
- Add `build.config.ts` only for a real custom builder lifecycle.

## Package lanes

| Lane      | Shared shape                                                                 | Accepted delta and reason                                                                                    |
| --------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Core      | Module entry, config hooks, reusable runtime                                 | `accepted`: owns product-neutral foundations and therefore has the strictest package and dependency boundary |
| Ecosystem | Module entry plus ecosystem config, Firebase binding, shared identity/assets | `accepted`: owns cross-App composition for one ecosystem, not reusable domain implementation                 |
| Extension | Module entry plus domain runtime surfaces                                    | `accepted`: owns reusable entities, public surfaces, Workspace operations, APIs, and assets for one domain   |

Package lanes differ in ownership, not in whether module registration is
explicit and reviewable.

Named Ecosystem modules share Core’s `configureFireuxEcosystemModule` for
bindings, native-layer validation and public assets. Keep hooks only for real
domain behavior; omit forwarding page hooks, duplicate asset registration and
App-default configuration. Workspace-specific components, composables and
commands register only when the App selects that Workspace. A selected native
layer filters its unselected Workspace pages without removing App-owned routes.
Project intent handlers have one explicit registration owner in `fireux-projects`;
they are outside native server discovery. Verify with Core’s
`src/test/ecosystem-wiring.test.mjs` and consuming App preparation.

## Dependency roles

The physical Core, Ecosystem, and Extension lanes are workspace organization.
Dependency role supplies the missing architectural order inside those lanes:

| Role                            | Job                                                                                       | May depend on                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Core foundation                 | Nuxt integration and product-neutral FireUX foundations                                   | external libraries                                    |
| App composition                 | Standard App defaults, or shared Ecosystem Main App surfaces                              | Core and selected lower extensions                    |
| Shared domain primitive         | One bounded reusable capability or foundational Entity contract                           | Core and lower primitives                             |
| Entity or parent-domain package | One coherent domain owner, including its related Entities and operations                  | Core, primitives, and named lower domain capabilities |
| Ecosystem composition           | Cross-package composition, ecosystem identity, configuration, and shared product behavior | Core, primitives, and domain packages                 |
| Concrete App                    | Final route, brand, tenant, and product composition                                       | its ecosystem plus explicitly enabled packages        |

Dependencies point downward. A dependency on a lower package does not transfer
ownership: Kitchen may consume Place, Finance, Supplier, or Sproochli
capabilities only through those packages' named seams. Cross-extension product
composition that has no domain reason still belongs at the ecosystem or App
layer.

Package size is a review signal, not a reason to split. A large package remains
coherent when its Entities, operations, authority, and public surfaces share
one parent-domain owner. Split only when an independently reusable owner and a
stable dependency boundary are already visible in current source.

## Natural package-reading path

For an unfamiliar runtime behavior:

```text
package.json + src/module.ts + declared native layers
        ↓
Nuxt entrypoint
        ↓
entity-owned implementation
        ↓
shared package capability
        ↓
Core or external primitive
```

`package.json` establishes declared dependency authority. App/package native
layer declarations, `src/module.ts` and real `src/config/module/*` hooks
establish discovery. Nuxt entrypoints adapt framework requests; they do not become the business owner. The entity or
shared runtime path owns implementation. Compare generated Nuxt declarations
and relevant tests with those sources; the former package and dependency
guards are removed.

## Registration steps

The shared module-wiring vocabulary is `runtime`, `plugins`, `composables`,
`components`, `layouts`, `pages`, `assets`, and `server`. Domain-specific work
may keep a named `configureX` function. Plain composable registration calls
Core's `registerComposablesDir` directly. Core's Nuxt layouts and plugins are
discovered through its runtime layer, with no second component-layout or
explicit plugin registration. `registerLayoutComponents` names the component registration used by Kitchen
and ecosystem wiring. It preserves the existing component names from
`runtime/layouts`; native Nuxt layout discovery remains owned by runtime layers.
The generated `layout-components.test.mjs` proving host checks both separately;
this rename adds no compatibility alias or new discovery mechanism.
Core `runtime/server/api` endpoints are registered by the runtime layer scan,
with HTTP methods derived from filenames. Core keeps explicit registrations
for root SEO and manifest handlers outside `server/api`. Authorization and
development-only rejection remain inside the owning handlers.

Core exposes a `./layer` export backed by `src/runtime/nuxt.config.ts`.
`defineFireuxApp` appends it at config time when absent, preserving an explicitly
authored Core position and deduplicating declarations, so
Core discovery does not depend on an App remembering a separate declaration.
Core's module no longer inserts its runtime into Nuxt's internal layer list.
The module owns explicit Entity component/composable registration, configuration,
root SEO/manifest handlers, and one Workspace page-transition hook. Its layer
owns conventional pages, layouts, middleware, plugins, and server discovery.

Tenant and standalone Apps use `defineFireuxApp`; Main Apps use
`defineFireuxEcosystem`, which includes the App bundle. The App bundle supplies
Core, Blogs, Products and AI. The Ecosystem bundle adds the shared Apps directory,
its API routes and Main App landing composition. Named Ecosystem packages keep
their own Firebase bindings and product runtime.

Apps select their domain layers and module options in the same builder input.
For example, Granite selects its Portfolio packages; Bringli selects Suppliers,
Places and Businesses; Misebox selects Kitchen runtime when that Workspace is
enabled. Inspect those App configurations for their actual domain precedence
and the named Ecosystem modules for conditional domain installation. A package
export alone does not activate its native layer.

The neutral starter and FireUX satellites receive the standard App bundle and
add only their selected capabilities. AI exposes a native layer for conventional
pages and server discovery; component/provider-only Go QR and Sproochli remain
module-only. FireUX Main App selects its own Docs layer for the developer
reference. That FireUX-specific content is not a shared Main App default.

All maintained hosts declare their runtime layers at config time. The shared
`requireNativeRuntimeLayer` assertion checks normalized roots through Nuxt Kit's
public `getLayerDirectories` and fails with the missing runtime path when an
owner is omitted. It never mutates Nuxt's private layer list. Modules retain
capability filtering, explicit domain registration and options. A package export
alone does not activate its layer; the owning App's composition must declare it.

No package needs every step. A missing step is normal when the package owns no
corresponding surface, and a directory helper safely no-ops when that optional
directory is absent. A package-local wrapper that adds no policy is drift, not
parity.

## Drift and decisions

| Difference                                                                             | State        | Recommendation                                                                                              |
| -------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| Similar packages expose different config files only because old scaffolds created them | `drift`      | Remove empty/no-op hooks; compare registration behavior, not filenames alone                                |
| A project App implements package-owned Workspace/domain behavior                       | `drift`      | Move reusable code to the owning package and leave app composition local                                    |
| A package imports another extension to compose product behavior                        | `drift`      | Move the composition to an ecosystem/project owner unless the dependency is a true domain primitive         |
| A package needs custom build output                                                    | `to-confirm` | Add builder config only after the output lifecycle cannot use shared defaults                               |
| Runtime surface exists but is not registered                                           | `drift`      | Use the owning native layer or a necessary module hook, then verify the route/import                        |
| An App bypasses its standard bundle                                                    | `drift`      | Use fireux-app or fireux-ecosystem for shared defaults; keep direct dependencies for explicit package use   |
| Declared Entity implementation uses a scoped Nuxt spine                                | `accepted`   | Keep it under `runtime/<entity>/<role>` and verify registration and retired paths against consumers         |
| Extension lane contains both primitives and domain owners                              | `accepted`   | Use the dependency-role matrix to read ownership; do not add another physical lane without a migration need |
| A package's primary dependency role cannot be explained from current source            | `to-confirm` | Resolve its owner and consumers before adding a package split, dependency, or permanent role guard          |
| A large package owns several related Entities and operations                           | `to-confirm` | Test parent-domain cohesion; size alone is not evidence for either retaining or splitting the boundary      |

## Alignment roadmap

### Now

- Read config-time native layers alongside `src/module.ts` and real
  `src/config/module/*` hooks as the registration spine.
- Use the implemented entity-scoped ownership in `runtime-filesystem.md`; do
  not add a second path or infer a new Entity from an unresolved record family.
- Let package manifests declare actual dependency ownership.
- Keep the repository dependency role and the package's runtime ownership
  readable from its manifest, module entry, and first-level runtime shape.

### Next

- Remove remaining no-op or scaffold-only config helpers when encountered.
- Compare sibling packages by owned runtime surfaces and registration effects.
- Review packages whose first-level runtime shape mixes unexplained feature,
  technical, and owner names; classify each root before moving source.
- Keep project-app overrides small and explicit.

### Later

- Add focused source-owned tests for repeated registration failures, not for
  optional folder symmetry; do not recreate the retired guard suite.
- Standardize custom builders only after more than one package proves the same
  lifecycle.

### Ecosystem agent metadata

Ecosystem-owned agent composition is pure metadata under
`runtime/models/workspace-agents.ts`, not an `ai` Entity or discovery root.
Kitchen agent server consumers import the Kitchen-owned coordinator from
`fireux-kitchens/runtime/kitchen/models/workspace-agent`. Misebox's metadata
only composes that definition beneath its ecosystem agent.
Bringli, BuenoHost, FireUX and Granite retain equivalent exported metadata;
placement does not assert that those declarations have an active consumer.
The existing `./runtime/*` package export resolves these model paths; no Nuxt
registration or compatibility forwarding module is required.

### Native runtime contract

`runtime-layer.test.mjs` covers public native membership without private-option
access, explicit failure for missing configuration, and Jobs capability-on/off
route filtering. Portfolio route fixtures likewise declare their actual owners.
All 26 maintained App configurations were prepared before and after removal of
the private fallback; compare layers, routes/navigation, components, imports,
layouts, middleware, plugins and Nitro handlers when changing composition.

### Project domain ownership

`fireux-projects` is an optional Extension selected by `fireux-fireux` for
Project Workspace. The host declares `fireux-projects/layer`. The existing
Project data remains in the named `fireux` database; this package move changes
no stored paths, scope or authority. FireUX-specific App creation stays in
`fireux-fireux/runtime/platform/project-apps.ts`; owning-system Ecosystem
coordination stays in FireUX App. The Extension does not import an Ecosystem
package.

`fireux-projects/runtime/project` owns the Project entity, readers, components,
models and domain targets. Its module registers Project component names and
composables. Canonical reads, protected commands and authority also live under
`project/server`; FireUX App routes retain HTTP transport, approved cross-project
discovery and its remote product-context bridge. Core does not
register Project on unrelated hosts. Core's App user-joined endpoint, event
publication and optional OIDC transport remain generic and available to every
host; the existing wire envelope belongs to the Core App event owner. Project
monitor models/validation are domain-owned, without inventing a receiver route.

### Kitchen AI ownership

`fireux-kitchens` owns Kitchen AI coordination, Team tool selection, Menu summaries,
Drinks descriptions and the Kitchen voice-input HTTP adapter. Its native layer
registers the existing routes. Domain implementation lives under
`kitchen/server/agent`; provider transport stays in `fireux-ai`. Misebox keeps
its ecosystem identity and cross-extension composition. Kitchen does not import
Misebox or require a Misebox-owned provider.
