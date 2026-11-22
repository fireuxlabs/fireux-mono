# FireUX Core — Nuxt module wiring architecture audit

**Date:** 2026-11-22  
**Repository:** `fireuxlabs/fireux-mono`  
**Status:** Codex analysis handoff — **inspection only; do not edit source, tests or existing docs**.

## Operator intent

We are reviewing FireUX Core **from the top down by architectural responsibility, not alphabetical folder order**, before moving into `src/runtime/`. FireUX extends Nuxt and Nuxt UI with proved shared UX and SaaS behaviour; it is not trying to stockpile unused reusable components or invent another framework.

The operator wants a simpler, correct foundation, including removing unused mechanisms and preventing hidden coupling. This pass must determine **what genuinely earns its place** in `packages/core/fireux-core/src/module.ts` and the complete `src/config/module/` directory. **Do not implement any recommendation in this pass.**

The previous Core `src/catalogue/` (manual public component list) was removed on GitHub in commit `d5d8a41`. A different **generated package-component inventory** still exists in `module.ts`; do not conflate them or recreate the manual catalogue.

The separate `app/solutions.md` loader cleanup was implemented locally by Codex, with tests reported passing, but was reported **uncommitted**. Preserve that local work. Check actual `git status` and source rather than treating GitHub as complete local truth.

## Required preflight

1. Read `AGENTS.md` and its required routed context: `docs/ai/gpt-context.md`, `docs/concepts/fireux-mono.md`, `docs/concepts/lasagne.md`, `docs/concepts/runtime-filesystem.md`, `docs/concepts/runtime-package.md`, `docs/concepts/app-config.md`, and relevant Nuxt/Nuxt UI maps. Follow current repository rules.
2. Read the **local** checkout, branch, `git status`, real package manifests and exact source/consumers. Do not overwrite, stage, commit, push, branch, worktree, deploy or modify live data.
3. Check Nuxt 4 / Nuxt Kit / module-builder native behaviours against the versions installed in this monorepo, including differences between the **module-only** and **layer-only** installation contracts.
4. Treat the findings below as **investigation hypotheses** from prior GitHub and Codex source inspection, not accepted instructions to delete.

## Primary source scope

- `packages/core/fireux-core/src/module.ts`
- All of `packages/core/fireux-core/src/config/module/`:
  - `module-wiring.ts`
  - `module-helpers.ts`
  - `components-config.ts`
  - `assets-config.ts`
  - `pages-config.ts`
  - `runtime-layer.ts`
  - `runtime-config.ts`
  - `ecosystem-wiring.ts`
  - `reserved-route-keys.ts`

Follow relevant callers and checks outside this scope, **without expanding the editing scope**: extension/Ecosystem module entrypoints, `fireux-app` and `fireux-ecosystem` builders, `fireux-workspace`, FireUX App, Misebox App, package library pages, Core installation tests, Ecosystem wiring tests, public slug/route validation and Firebase release target checks.

## Questions to answer with evidence

### 1. Core Nuxt entry point — what is necessary?

Build a responsibility map for `src/module.ts`: typed module registration; explicit Core components, composables, assets and runtime types; robots/sitemap/manifest routes; two-stage SEO resolution (configuration and resolved pages); production App-brand assertion; Nitro build configuration; development diagnostics and global Node listener limit; and the generated package-component inventory.

For each, identify the exact API, real consumer, module-only/layer-only contract, whether Core owns it, and an evidence-based decision (**keep, simplify, narrow, move, remove, or unproved**). Do not move a feature merely to shorten `module.ts`. Installed-package compatibility and actual route registration matter more than appearance.

### 2. Generic module wiring — hidden process-wide route-key state

`config/module/module-wiring.ts` executes optional registration callbacks **and** copies `getReservedRootRouteKeys()` into `runtimeConfig.public.fireux.reservedRouteKeys`. `reserved-route-keys.ts` stores keys on `globalThis.__fireux_reserved_route_keys__`; several extensions register their slugs.

Trace every writer, reader, order dependency, and test. Determine whether one App's keys can contaminate another App prepared later **in the same Node process**, whether load order matters, and where the keys should be scoped. Distinguish actual evidence of a bug from a plausible cross-App risk.

**Propose a focused proof**, ideally preparing two differently configured Apps sequentially in one process and checking that each receives only its own reserved keys. Do not write that test during this analysis. Preserve protection against public URL/handle collisions; removing the global registry is not permission to weaken the slug policy.

### 3. Ecosystem wiring — keep Firebase authority, question generic orchestration

`config/module/ecosystem-wiring.ts` binds region, service account and Firebase Ecosystem identity/database settings. These serve real consumers and release checks. Do **not** propose removing this contract.

Investigate independently:
- `configurePublicAssets` option versus default public-asset registration: find real callers, distinguish zero local callers from external package API obligations, and check duplicate-registration tests.
- Automatic `runtime/layouts`, `runtime/composables` and `runtime/pages` discovery: count real existing Ecosystem consumers and native-layer alternatives. Prior inspection suggested no Ecosystem layouts and only Misebox composables; **reconfirm locally**.
- `configureRuntimeConfig`, `configurePages`, `configureComponents` callbacks: enumerate which Ecosystems actually supply them (previous inspection suggested Misebox and Sharer for callbacks, Misebox for pages), compare their module-owned work, setup order and exact contracts. Is this useful composition or a mini-runner with pointless abstraction?
- The `configurePages()` helper in `pages-config.ts` appears to call only `requireNativeRuntimeLayer()`. Check all callers and whether direct assertion would simplify without hiding necessary sequencing.

### 4. Module helpers and assets

Verify each helper's actual use: explicit component/composable/server registration, native layer enforcement, runtime defaults, transition policy, page filtering, and assets.

Specifically, `assets-config.ts` registers `fireux-core/assets` as a Nuxt alias. Check local and published/installed consumption and any tests before suggesting removal; no in-repo source match alone is not proof of no external consumer.

Inspect whether Core Dashboard transition policy and optional Workspace transition policy are distinct and correctly documented. The package map reportedly attributes Workspace transition configuration to Core; verify the actual owners and recommend **documentation correction only if proven**.

### 5. Remaining /packages inventory — separate from removed public catalogue

Trace `componentCatalogue`, `fireux-package-components.ts`, `runtime/app/components/Packages.vue`, `/packages` routes and consumer App configurations in FireUX and Misebox.

Answer what the **operators/developers actually need** from those pages:
- package list and descriptions;
- working examples and links;
- inventory of all Nuxt-registered components.

Measure the runtime/build complexity and whether the opt-in option still causes unconditional template generation. **Do not count registration or documentation as actual component usage.** Recommend whether to retain, relocate to an opt-in Docs/App owner, narrow, or delete the inventory, and describe exact affected consumers. This is **not** an instruction to remove `/packages` pages or delete components.

### 6. Global event-listener change

`module.ts` raises Node's default max listeners to 32 in development. Search source, history/tests and prior warnings to establish which subsystem owns the listeners and whether the workaround is still needed. Record uncertainty if no reproducible evidence exists; do not remove it blindly.

### 7. Previously requested deletion verification

Verify the earlier **manual** Core `src/catalogue/` removal has landed in the local checkout and that no obsolete imports, exports, generated Docs templates or tests remain. Distinguish this from the **live optional package-component inventory**. Report discrepancies, but **do not duplicate that deletion or edit during this audit**.

## Required output to operator

Return one concise, source-backed **architecture decision report** with:

1. **Top-level verdict:** is the Core module spine fundamentally sound, and what is actual bloat?
2. **Responsibility matrix:** concrete path/responsibility → confirmed consumers → keep/simplify/narrow/move/remove/unproved → why → risk of change.
3. **Ranked recommendations by architectural impact and safety**, separating low-risk unused indirection from high-risk runtime/URL/Firebase contracts. Do not use alphabetical order.
4. **Bounded proposed implementation slices** for separate operator approval, including path scope, prerequisite checks, actual consumer smoke checks, likely tests, and rollback/compatibility considerations.
5. **Explicit questions only where a product decision is unavoidable**, such as whether `/packages` should show component inventories.
6. **Verification accounting:** what was directly inspected, what checks (if any) were run, and what remains unproven. An inspection alone must not be represented as a passing build.

No changes to the system, no code or test edits, no automated cleanup, no opportunistic renaming, no commits or pushes. Stop after the report so the operator and the voice discussion can decide the next implementation handoff.

## Success condition

We can confidently say which portions of `src/module.ts` and `src/config/module/` are Nuxt-native necessities, which are real FireUX obligations, and which are unnecessary maintenance overhead—**without breaking the framework or rebuilding a catalogue we intentionally removed**.
