# Runtime package family

Updated: 2026-08-04
Ref: d232cc731
Role: map, not canon

## Purpose

Map how FireUX packages expose reusable runtime surfaces to Nuxt Apps and why
Core, Ecosystem, and Extension packages legitimately differ.

## Links

- Parent: `fireux.md`
- Children: `components.md`, `composables.md`, `pages.md`, `server-api.md`
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

Common runtime buckets are `components`, `composables`, `models`, `pages`,
`server`, and `utils`. A package carries only the hooks and buckets it
genuinely owns; a small package such as `fireux-docs` or `fireux-nuxtfire` does
not add an empty `src/config/module` layer for symmetry.

Shared rules:

- Register Nuxt runtime surfaces through the package module.
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
| Extension | Module entry plus domain runtime surfaces                                    | `accepted`: owns reusable entities, public surfaces, Console operations, APIs, and assets for one domain     |

Package lanes differ in ownership, not in whether module registration is
explicit and reviewable.

## Registration steps

The shared module-wiring vocabulary is `runtime`, `plugins`, `composables`,
`components`, `layouts`, `pages`, `assets`, and `server`. Domain-specific work
may keep a named `configureX` function. Plain composable and layout directory
registration calls Core's `registerComposablesDir` and `registerLayoutsDir`
directly; it does not gain a package-local pass-through file.

No package needs every step. A missing step is normal when the package owns no
corresponding surface, and a directory helper safely no-ops when that optional
directory is absent. A package-local wrapper that adds no policy is drift, not
parity.

## Drift and decisions

| Difference                                                                             | State        | Recommendation                                                                                              |
| -------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| Similar packages expose different config files only because old scaffolds created them | `drift`      | Remove empty/no-op hooks; compare registration behavior, not filenames alone                                |
| A project App implements package-owned Console/domain behavior                         | `drift`      | Move reusable code to the owning package and leave app composition local                                    |
| A package imports another extension to compose product behavior                        | `drift`      | Move the composition to an ecosystem/project owner unless the dependency is a true domain primitive         |
| A package needs custom build output                                                    | `to-confirm` | Add builder config only after the output lifecycle cannot use shared defaults                               |
| Runtime surface exists but is not registered                                           | `drift`      | Add the smallest real module hook and a focused smoke route/import check                                    |
| A reusable extension is added to every App without a universal product contract        | `drift`      | Keep Blog as the sole default; require every other extension, including Products, to be explicitly composed |

## Alignment roadmap

### Now

- Keep `src/module.ts` and real `src/config/module/*` hooks as the registration
  spine.
- Let package manifests declare actual dependency ownership.

### Next

- Remove remaining no-op or scaffold-only config helpers when encountered.
- Compare sibling packages by owned runtime surfaces and registration effects.
- Keep project-app overrides small and explicit.

### Later

- Extend guards for repeated registration failures, not for optional folder
  symmetry.
- Standardize custom builders only after more than one package proves the same
  lifecycle.
