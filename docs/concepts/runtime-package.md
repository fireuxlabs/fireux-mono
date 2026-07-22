# Runtime package family

Updated: 2026-07-22
Ref: 796952bf0
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

Every runtime package starts from:

```text
src/module.ts
src/config/module/*
src/runtime/*
```

Common runtime buckets are `components`, `composables`, `models`, `pages`,
`server`, and `utils`. A package carries only the buckets it genuinely owns.

Shared rules:

- Register Nuxt runtime surfaces through the package module.
- Use the Core module-wiring helper rather than rebuilding Nuxt registration.
- Keep only registration hooks that perform real work.
- Models, types, information helpers, and ordinary utilities are explicit
  imports; they do not need fake registration hooks.
- Declare every direct runtime, server, type-only, and stylesheet dependency in
  the owning package manifest.
- Project Apps compose packages; they do not re-own reusable package behavior.
- Cross-extension composition belongs in an ecosystem package or project that
  declares every participating package.
- Do not place a nested `package.json` under `src`.
- Add `build.config.ts` only for a real custom builder lifecycle.

## Package lanes

| Lane | Shared shape | Accepted delta and reason |
| --- | --- | --- |
| Core | Module entry, config hooks, reusable runtime | `accepted`: owns product-neutral foundations and therefore has the strictest package and dependency boundary |
| Ecosystem | Module entry plus ecosystem config, Firebase binding, shared identity/assets | `accepted`: owns cross-App composition for one ecosystem, not reusable domain implementation |
| Extension | Module entry plus domain runtime surfaces | `accepted`: owns reusable entities, public surfaces, Console operations, APIs, and assets for one domain |

Package lanes differ in ownership, not in whether module registration is
explicit and reviewable.

## Registration hooks

Current hook vocabulary includes:

- `configureRuntime`
- `configurePlugins`
- `configureComposables`
- `configureComponents`
- `configureLayouts`
- `configurePages`
- `configureAssets`
- `configureServer`

No package needs all hooks. Missing hooks are normal when the package owns no
corresponding surface. A no-op hook is drift, not parity.

## Drift and decisions

| Difference | State | Recommendation |
| --- | --- | --- |
| Similar packages expose different config files only because old scaffolds created them | `drift` | Remove empty/no-op hooks; compare registration behavior, not filenames alone |
| A project App implements package-owned Console/domain behavior | `drift` | Move reusable code to the owning package and leave app composition local |
| A package imports another extension to compose product behavior | `drift` | Move the composition to an ecosystem/project owner unless the dependency is a true domain primitive |
| A package needs custom build output | `to-confirm` | Add builder config only after the output lifecycle cannot use shared defaults |
| Runtime surface exists but is not registered | `drift` | Add the smallest real module hook and a focused smoke route/import check |

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
