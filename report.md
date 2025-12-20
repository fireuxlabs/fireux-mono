# FireUX Runtime Plugin + Firebase SSR/TS Diagnostics Report

Date: 2025-12-19

## 1) Observed errors (exact text)

### VS Code / TypeScript diagnostics

In packages/core runtime plugin:

- `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`
  - Previously:
    - `Module '"#imports"' has no exported member 'defineNuxtPlugin'.`
    - `Module '"#imports"' has no exported member 'useRuntimeConfig'.`
  - Current status: **fixed** by extending the repo Nuxt shims so package-context runtime plugins can import these helpers from `#imports`.

(Other runtime plugins that import from `#imports`, e.g. `fireux-config.*` and `inject-trace.*`, currently typecheck without errors.)

### Terminal (Nuxt dev/prepare)

Not captured in this run. Use the commands in section 5 to capture reproducible terminal output.

## 2) Current architecture summary (brief)

- Env vars are read in: `packages/core/fireux-core/src/config/app/fireux.config.ts`
  - Reads `process.env.APP_DOMAIN`, `NUXT_FIREBASE_APP_ID`, `NUXT_FIREBASE_MEASUREMENT_ID`, `DEVELOPER_PIN`.

- runtimeConfig is set in: `packages/core/fireux-core/src/config/app/runtime.ts`
  - `setRuntime()` writes to `runtimeConfig.public.fireux`, `runtimeConfig.public.firebaseEcosystem`, `runtimeConfig.public.firebaseApp`.
  - It supports both a NuxtConfig object (`nuxt.runtimeConfig`) and a Nuxt instance (`nuxt.options.runtimeConfig`) by using `(nuxt.options ?? nuxt)`.

- Ecosystem config injects firebase ecosystem in: `packages/ecosystem/fireux-*/src/module.ts`
  - Example: `packages/ecosystem/fireux-fireux/src/module.ts` imports its own `./config/firebase/ecosystem.config` and calls `setRuntimeFirebaseEcosystem(...)`.

- VueFire is configured in: `packages/core/fireux-core/src/module.ts` (modules:done hook)
  - `modules:done` is used as the safe point because ecosystem modules should have already injected `runtimeConfig.public.firebaseEcosystem` and app config should have injected `runtimeConfig.public.firebaseApp`.
  - `configVuefire(nuxt)` writes a `nuxt.vuefire.config` object based on runtimeConfig.

- Firebase web app initialization lives in: `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`
  - Uses `firebase/app` (`getApps`, `initializeApp`).
  - Uses `defineNuxtPlugin` + `useRuntimeConfig` via `#imports`.
  - It is registered as client-only by filename (`*.client.ts`) if/when it is injected.

## 3) Tree + key files inspected

### Runtime plugin filenames

Under `packages/core/fireux-core/src/runtime/plugins/`:

- `firebase.client.ts`
- `fireux-config.client.ts`
- `fireux-config.server.ts`
- `inject-trace.client.ts`
- `inject-trace.server.ts`

### Are runtime plugins registered into the consuming app build?

Evidence strongly suggests: **not currently**.

- There is a helper that *would* register them via Nuxt module API:
  - `packages/core/fireux-core/src/config/module/plugins-config.ts` defines `configurePlugins(resolver)` and calls `addPlugin(...)` for each runtime plugin.
- But `packages/core/fireux-core/src/module.ts` does **not** call `configurePlugins(...)` (it only sets an alias and hooks `modules:done` to call `configVuefire`).
- Grepping the consuming app’s `.nuxt` output did not find the plugin injection strings for `firebase.client.ts` / `fireux-config.*` / `inject-trace.*`.
  - `.nuxt` does include tsconfig path aliases pointing at `packages/core/fireux-core/runtime`, which confirms the runtime alias exists, but that does not mean plugins are injected.

Conclusion: right now the repo has the code to inject plugins (`configurePlugins`) but it is not wired in.

## 4) Hypotheses (ranked)

### A. Runtime plugin file is not being registered into the consuming app build (most likely)

- `configurePlugins()` exists but is unused.
- `.nuxt` grep does not show injected plugins.
- This would explain “Firebase init is missing” even if the runtime plugin code is correct.

### B. It runs only on client (`firebase.client.ts`), so SSR doesn’t have a Firebase web app

- Even after plugin injection is fixed, the current Firebase init plugin is client-only.
- If server-side code expects Firebase Web SDK state during SSR, it will still be missing.

### C. Editor TS errors are from missing Nuxt types in the package context

- Partially true in general, but in *this* repo many runtime files import from `#imports` successfully.
- We addressed the concrete `firebase.client.ts` failure by updating `types/nuxt-shims.d.ts` to explicitly declare `defineNuxtPlugin` and `useRuntimeConfig` in the `#imports` module.

### D. `pnpm clean` deleting node_modules causes type resolution confusion

- This can exacerbate editor issues after a clean, but the core root cause for Node typings is configuration: root `tsconfig.json` requests `types: ["nuxt", "node"]` and requires `@types/node` to be installed.

## 5) Verification commands + expected output

### Prove whether plugins are injected into the consuming app

- Search in `.nuxt` for injected plugin paths:

  ```sh
  rg -n "fireux-core/src/runtime/plugins" projects/fireux/fireux-app/.nuxt --hidden --no-ignore
  rg -n "firebase\\.client" projects/fireux/fireux-app/.nuxt --hidden --no-ignore
  rg -n "inject-trace" projects/fireux/fireux-app/.nuxt --hidden --no-ignore
  ```

Expected:
- If plugins are correctly injected, you should see references to the resolved plugin files under `.nuxt` plugin manifests.
- If nothing appears, plugin injection is not wired.

### Prove whether Firebase init runs on server vs client

- Add a temporary log inside the plugin:
  - Client marker: `console.log('[fireux-core/firebase] init', { hasEco: !!eco, hasAppId: !!app?.appId })`
- Then watch:
  - Browser console (client) should show it.
  - Server terminal should *not* show it for `.client.ts`.

### Capture terminal type errors

- Run Nuxt prepare/typecheck for the app:

  ```sh
  pnpm --filter ./projects/fireux/fireux-app exec nuxi prepare
  pnpm --filter ./projects/fireux/fireux-app exec nuxi typecheck
  ```

Expected:
- If plugin injection is broken, `nuxi` output won’t mention those plugins.
- If TS shims are incomplete, you will see `#imports` and `defineNuxtPlugin`-related errors.

## 6) Proposed fix plan (smallest steps first)

### Step 1 — Wire plugin registration (required)

- In `packages/core/fireux-core/src/module.ts`, call `configurePlugins(resolver)`.
- This makes runtime plugins actually enter the consuming app build.

### Step 2 — Fix the concrete TS error in firebase plugin (required)

Current status: **done**.

- `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts` imports `defineNuxtPlugin` and `useRuntimeConfig` from `#imports`.
- `types/nuxt-shims.d.ts` explicitly declares those exports for package-context typechecking.

### Step 3 — Decide SSR strategy for Firebase (smallest safe approach)

Two viable options:

- **Option A (minimal + safe): keep Firebase Web init client-only**
  - Keep `firebase.client.ts` for browser Firebase Web SDK.
  - Ensure any server-side Firestore usage goes through `firebase-admin` (Nitro server routes already exist in core runtime).
  - Add guardrails in server-side composables so they don’t assume a Web SDK app exists.

- **Option B (matches preference “universal plugin”): add a universal plugin but no-op on server**
  - Create `firebase.ts` (universal) that checks `import.meta.server` / `process.server` and returns early on server.
  - Net effect: one plugin path, SSR-safe (no server crash), but still only initializes Web SDK on client.

(Actually initializing Firebase Web SDK during SSR is generally not needed; server code should prefer admin SDK.)

### Exact file edits (summary)

1) `packages/core/fireux-core/src/module.ts`
- Import `configurePlugins` and call it in `setup()`.

2) `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`
- Add `import { defineNuxtPlugin, useRuntimeConfig } from '#imports'`.
- (Optional) adjust header comment to match filename.

---

## Notes

- The repo already has tsconfig shims that map `#imports` (see root `types/nuxt-shims.d.ts` referenced by `paths` in `tsconfig.base.json`), which is why most runtime files can typecheck outside a generated `.nuxt/types` context.
- The remaining missing type definitions error for `node` is solved by installing `@types/node` (root `tsconfig.json` requests it via `compilerOptions.types`).
