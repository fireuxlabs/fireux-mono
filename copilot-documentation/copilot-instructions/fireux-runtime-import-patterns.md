# FireUX Mono Runtime Import Patterns

_Last updated: 2025-10-14_

## Why this doc exists

Nuxt’s auto-import aliases (for example `#fireux-core-composables`) only resolve when the Nuxt module that registered them is active. Package-level TypeScript builds (and Vite when evaluating sibling packages) bypass that registration, which is why we were seeing `Cannot find module '#fireux-core-composables/...` errors. This note explains the pattern we now follow so that shared composables stay portable across the mono-repo.

## Core guidance

- **Always import from the published package surface** when working outside the `fireux-core` package itself:
  - Use `fireux-core/runtime/composables/...` (with the `.ts` suffix because we use `"verbatimModuleSyntax": true` and moduleResolution `Bundler`).
  - Example: `import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate.ts'`.
  - The same rule applies to other FireUX packages (e.g. `fireux-places/runtime/composables/usePlaceSave.ts`).
- **Do not import from `fireux-core/src/**`** unless you are inside the `fireux-core` package. ESLint now enforces this by blocking only the raw `src` paths.
- **Nuxt auto-import aliases are runtime conveniences only.** They keep working inside app code, but cross-package code must stick to the package export paths.

## TypeScript setup checklist

1. Each package TS config already extends `tsconfig.json` at the repo root. Because of that, the `fireux-core/runtime/*` path aliases resolve without extra per-package wiring.
2. Do **not** include the deleted `types/fireux.d.ts`; ambient helpers should live beside the runtime composable or in the consuming package.
3. Run `pnpm typecheck:packages` whenever you touch inter-package imports to confirm the packages build in isolation.

## Linting posture

- We narrowed the `no-restricted-imports` rule to target only `fireux-core/src/**`. This keeps us from reaching into unpublished internals while allowing the exported runtime files.
- No error was silenced: TypeScript and ESLint still flag direct `src` imports and unresolved modules.

## Quick validation commands

```bash
pnpm typecheck:packages
pnpm lint
```

Both commands should pass after updating imports. If you see Vite errors in dev mode, restart the dev server so it ingests the new module paths.
