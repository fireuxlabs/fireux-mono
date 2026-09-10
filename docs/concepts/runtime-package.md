# Runtime package family

Updated: 2026-09-10
Ref: bd7ab9559
Role: map, not canon

## Purpose

Map how FireUX packages expose reusable runtime surfaces to Nuxt Apps and why
Core, Ecosystem, and Extension packages legitimately differ.

## Links

- Parent: `fireux.md`
- Children: `runtime-filesystem.md`, `components.md`, `composables.md`,
  `pages.md`, `server-api.md`
- Horizontal: `pnpm.md`, `app-config.md`, `spine.md`
- Executable references: package guards, dependency ownership guard, and each
  package's `src/module.ts`

## Shared spine

Every runtime package starts from its module entry and the surfaces it owns:

```text
src/module.ts
src/config/module/*  # only for real registration/config hooks
src/runtime/*
```

The detailed ownership contract is mapped in `runtime-filesystem.md`. Root
technical buckets such as `components`, `composables`, `models`, and `utils`
are shared across entities. Nuxt entrypoints such as `pages`, `layouts`,
`plugins`, `middleware`, and `server/api` retain their conventional locations.
Entity-owned implementation lives under `src/runtime/<entity>/<role>`. A
package carries only the hooks, entity roots, and buckets it
genuinely owns; a small package such as `fireux-docs` or `fireux-nuxtfire` does
not add empty structure for symmetry.

Shared rules:

- Register Nuxt runtime surfaces through the package module.
- Register bounded entity component and composable roots through the same
  supported Nuxt Kit helpers; do not build an entity discovery framework.
- Use the Core module-wiring helper rather than rebuilding Nuxt registration.
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
- `fireux-blogs` is the sole default App extension. Every App declares that
  direct dependency even when Core adds the module automatically.
- `fireux-products` is an explicit capability, not part of the universal App
  baseline. Only current Product consumers declare and load it.
- Cross-extension composition belongs in an ecosystem package or project that
  declares every participating package.
- Do not place a nested `package.json` under `src`.
- Add `build.config.ts` only for a real custom builder lifecycle.

## Package lanes

| Lane      | Shared shape                                                                 | Accepted delta and reason                                                                                    |
| --------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Core      | Module entry, config hooks, reusable runtime                                 | `accepted`: owns product-neutral foundations and therefore has the strictest package and dependency boundary |
| Ecosystem | Module entry plus ecosystem config, Firebase binding, shared identity/assets | `accepted`: owns cross-App composition for one ecosystem, not reusable domain implementation                 |
| Extension | Module entry plus domain runtime surfaces                                    | `accepted`: owns reusable entities, public surfaces, Workspace operations, APIs, and assets for one domain     |

Package lanes differ in ownership, not in whether module registration is
explicit and reviewable.

## Dependency roles

The physical Core, Ecosystem, and Extension lanes are workspace organization.
Dependency role supplies the missing architectural order inside those lanes:

| Role | Job | May depend on |
| --- | --- | --- |
| Core foundation | Nuxt integration and product-neutral FireUX foundations | external libraries and a lower Core bridge |
| Shared domain primitive | One bounded reusable capability or foundational Entity contract | Core and lower primitives |
| Entity or parent-domain package | One coherent domain owner, including its related Entities and operations | Core, primitives, and named lower domain capabilities |
| Ecosystem composition | Cross-package composition, ecosystem identity, configuration, and shared product behavior | Core, primitives, and domain packages |
| Concrete App | Final route, brand, tenant, and product composition | its ecosystem plus explicitly enabled packages |

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
package.json + src/module.ts
        ↓
Nuxt entrypoint
        ↓
entity-owned implementation
        ↓
shared package capability
        ↓
Core or external primitive
```

`package.json` establishes declared dependency authority. `src/module.ts` and
real `src/config/module/*` hooks establish discovery. Nuxt entrypoints adapt
framework requests; they do not become the business owner. The entity or
shared runtime path owns implementation. Guards verify the stable boundary.

## Registration steps

The shared module-wiring vocabulary is `runtime`, `plugins`, `composables`,
`components`, `layouts`, `pages`, `assets`, and `server`. Domain-specific work
may keep a named `configureX` function. Plain composable registration calls
Core's `registerComposablesDir` directly. Core's Nuxt layouts and plugins are
discovered through its runtime layer, with no second component-layout or
explicit plugin registration. `registerLayoutsDir`, still used by other
packages, actually registers Vue components; it is not Nuxt layout registration.
Those callers remain outside the verified Core cutover.
Core `runtime/server/api` endpoints are registered by the runtime layer scan,
with HTTP methods derived from filenames. Core keeps explicit registrations
for root SEO and manifest handlers outside `server/api`. Authorization and
development-only rejection remain inside the owning handlers.

Core exposes a `./layer` export backed by `src/runtime/nuxt.config.ts`.
`defineFireuxConfig` includes it at config time after App-supplied layers, so
Core discovery does not depend on an App remembering a separate declaration.
Core's module no longer inserts its runtime into Nuxt's internal layer list.
The module owns explicit Entity component/composable registration, configuration,
root SEO/manifest handlers, and one Workspace page-transition hook. Its layer
owns conventional pages, layouts, middleware, plugins, and server discovery.

The FireUX and Werkbox ecosystem layers also extend Core; Nuxt resolves the
shared layer once. Their existing App declarations remain valid. FireUX App and
FireUX Blank are the inspected native and previously implicit consumers.

FireUX App also declares the Blog and Product layers. Its optional Docs module
and layer share an App-owned enablement decision: production or explicit local
Docs mode. The FireUX ecosystem no longer installs that App-specific surface.
The Docs module owns Content integration; its layer owns
route and layout discovery.

Werkbox’s global App and tenant also declare native layers, with their distinct
domain composition kept in the owning App configurations.

Misebox Apps likewise declare native layers, including Kitchen and ecosystem
runtime layers only when their App workspace configuration enables Kitchen.

Unmigrated ecosystem and extension runtimes still use the shared
`config/module/runtime-layer.ts` helper, which inserts roots into Nuxt's internal
resolved layer list during module setup. It does not write `layers` or `extends`:
Nuxt resolves declarative `extends` before modules run. This remaining internal
insertion is migration debt, not a supported public layer API. Migrating each
caller requires comparing its layer priority, conditional capability loading,
routes, layouts, middleware, plugins, and server scans. Do not remove the shared
helper until all callers have declarative owners.

No package needs every step. A missing step is normal when the package owns no
corresponding surface, and a directory helper safely no-ops when that optional
directory is absent. A package-local wrapper that adds no policy is drift, not
parity.

## Drift and decisions

| Difference                                                                             | State        | Recommendation                                                                                              |
| -------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| Similar packages expose different config files only because old scaffolds created them | `drift`      | Remove empty/no-op hooks; compare registration behavior, not filenames alone                                |
| A project App implements package-owned Workspace/domain behavior                         | `drift`      | Move reusable code to the owning package and leave app composition local                                    |
| A package imports another extension to compose product behavior                        | `drift`      | Move the composition to an ecosystem/project owner unless the dependency is a true domain primitive         |
| A package needs custom build output                                                    | `to-confirm` | Add builder config only after the output lifecycle cannot use shared defaults                               |
| Runtime surface exists but is not registered                                           | `drift`      | Add the smallest real module hook and a focused smoke route/import check                                    |
| A reusable extension is added to every App without a universal product contract        | `drift`      | Keep Blog as the sole default; require every other extension, including Products, to be explicitly composed |
| Declared Entity implementation uses a scoped Nuxt spine                                | `accepted`   | Keep it under `runtime/<entity>/<role>` and protect registration and completed legacy paths through guards  |
| Extension lane contains both primitives and domain owners                              | `accepted`   | Use the dependency-role matrix to read ownership; do not add another physical lane without a migration need |
| A package's primary dependency role cannot be explained from current source             | `to-confirm` | Resolve its owner and consumers before adding a package split, dependency, or permanent role guard          |
| A large package owns several related Entities and operations                            | `to-confirm` | Test parent-domain cohesion; size alone is not evidence for either retaining or splitting the boundary      |

## Alignment roadmap

### Now

- Keep `src/module.ts` and real `src/config/module/*` hooks as the registration
  spine.
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

- Extend guards for repeated registration failures, not for optional folder
  symmetry.
- Standardize custom builders only after more than one package proves the same
  lifecycle.
