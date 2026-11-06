# FireUX Organization — Architecture and Documentation Handoff

Date: 2026-11-06
Status: Discussion handoff, **not an approved migration**.
Repository: `fireuxlabs/fireux-mono`, branch `main`.

## Purpose
This document hands off the architectural discussion from the “Organize Apps Task” voice chat to Codex / a higher-reasoning GPT. **Do not implement or migrate yet.** Audit the complete repository, report evidence and a prioritized proposal, then request approval. Do not sample three apps and extrapolate: enumerate **all** app roots (approximately 28, exact count to verify).

## Governing philosophy
**Nuxt defines what is possible; FireUX defines how we choose to build.** FireUX is an opinionated extension of Nuxt, Nuxt UI and Firebase, not a replacement. Native Nuxt owns routing, layers, pages, layouts and server mechanics; Nuxt UI owns controls, accessibility and theme facilities; Firebase owns backend primitives. FireUX adds reusable product responsibilities, Entity capabilities, Workspaces and coherent UX conventions. Prefer native APIs and reuse. Do not invent a second framework or design system.

**Documentation is evidence of historical intent, not automatic current truth.** Some decisions were written long ago and may be superseded. Examine (1) current source, (2) tests and real consumers, (3) recent commits, (4) existing documentation, (5) current product decisions. Do not blindly force code to match an old markdown rule; equally, recent code can introduce drift. Reconcile and update documentation only after verifying.

## Application spine
- Every application has an **application project root**, e.g. `projects/misebox/misebox-app/`, containing `nuxt.config.ts`, `package.json`, `app/`, and optionally `server/`, `public/`, `shared/`, tests, TypeScript and deployment configuration.
- `app/app.vue` is inside `app/`, **not** beside `nuxt.config.ts`. Recent work aligned stock roots around `<AppShell />`; verify all consumers and documented exceptions, including Go QR embedded tools and app-owned theme/language deltas.
- The term **runtime** primarily describes reusable package code, typically `packages/.../src/runtime/`. Do not conflate package runtime with an application project root or the canonical FireUX Project Entity.
- Audit `app/app.config.ts` in every application: native Nuxt presentation config plus deliberate FireUX additions, without duplicating runtime or Entity authority.
- Audit **all** application project roots for app-specific versus reusable code. App-specific presentation/adapters belong in the app; reusable domain logic belongs with its owning package.

## Configuration spine
Inspect the actual implementations and tests of:
- `packages/extensions/fireux-ecosystem/src/config.ts` — `defineFireuxEcosystem` checks `role: 'global'`, adds its layer and calls `defineFireuxApp`.
- `packages/extensions/fireux-app/src/config.ts` — `defineFireuxApp` validates FireUX App configuration and produces native `NuxtConfig`, delegating baseline, modules/layers, Firebase, SEO, PWA, runtime, Vite and Nitro setup to existing helpers.
- `packages/core/fireux-core/src/config/app/` baseline, validation and runtime owners.
- Every `projects/**/nuxt.config.ts` and the actual application manifests/consumers.

The preferred application config is **declarative**: identity, ecosystem, role, capabilities, modules, layers, Workspaces, SEO and justified app-specific deltas. Shared defaults belong to the lowest suitable owner. Audit post-builder overrides, repeated module/layer declarations, conditional `workspaces.includes(...)` layer assembly, page-removal hooks and runtimeConfig patches. Classify each as accepted exception, real drift or unverified question; do not remove it without proving behavior and precedence.

Previously observed examples to verify: Misebox's `pages:extend` removal of workspace roots and ordering runtime fields; FireUX main app's Firebase `maxInstances` and `packageComponents` override; Bären's ordering override; conditional layer composition in Bringli, BuenoHost, Granite and Misebox; Werkbox's logical `werkbox` project with physical `cleanbox` ecosystem ID (do not “fix” physical identity blindly). Confirm exact complete inventory and behavior first.

## Entity spine — one owner, multiple consumers
FireUX Entities repeat the **relevant Nuxt organizational conventions** internally, whether located in app-specific code or package runtime: components, composables, pages, models, server, utilities as genuinely needed. Do not create empty folders for symmetry. An Entity is not a miniature independent app: no second app bootstrap or app-level `app.vue`. A package may legitimately expose `src/runtime/nuxt.config.ts` as a **Nuxt layer**, distinct from an application root config.

**One Entity, one canonical owner, multiple consumers.** For example `fireux-kitchens` owns reusable Kitchen behavior and data authority. A Misebox app may own its Kitchen-specific product composition, but must not reimplement canonical Kitchen operations. Compare matching Entity directories across applications and packages, checking structure, imports, duplicate reads/writes, and whether differences are legitimate composition or ownership drift.

## Component composition and design-system rule
**Pages compose experiences; components encapsulate responsibilities; composables encapsulate state and behavior.** A component may be worthwhile even when used once because it gives a coherent responsibility its own boundary; do not extract every div or create forwarding wrappers for their own sake.

Before writing a new interface:
1. Inspect the **actual Nuxt UI components** (e.g. `UPage`, `UPageHeader`, `UPageBody`, `UContainer`, `UCard`, form controls).
2. Inspect existing **FireUX Core** and **owning domain/Entity** components, examples and patterns.
3. Compose with the existing theme, semantic tokens, variants and reusable CSS classes.
4. Use Tailwind utility classes for necessary layout or pixel-perfect adjustments **not** to recreate components already provided. Tailwind is **not banned**.
5. Use local `<style>` for genuinely unique, nonshared presentation when appropriate.

When Nuxt UI lacks a component, create an appropriately owned FireUX component that extends the established visual language. A generic reusable component may belong in Core; a Kitchen-specific one belongs in Kitchens. Prefer shared semantic classes/variants over duplicating long utility strings, while first checking Nuxt UI's own theming/slots. Preserve brand variation without inventing a new system for every app.

Vue SFC convention: `<template>` first, then `<script setup>`, then `<style>` if needed. Verify formatter/linter support; don't claim a rule is enforced when it isn't.

## Documentation architecture
We **already have `fireux-docs`**. Extend and audit it; do not invent a parallel documentation system. Documentation follows the canonical owner (Core, extension, ecosystem) and is presented centrally by FireUX Docs. Document once; link from consumers. Keep code and production bundles lightweight — do **not** import docs through runtime composables merely to make them discoverable.

Provide one clear concept guide for each convention: `nuxt.config.ts`, `app.vue` / AppShell, `app.config.ts`, components, composables, pages, layouts, HTML/template composition, styling, Entities, package runtime/layers, and Ignite. First inspect and reconcile existing `docs/concepts/*`, package docs and the FireUX Docs inventory. Avoid duplicating conflicting documents. Guides should state the current rule, rationale, native Nuxt/Nuxt UI relationship, owning code, examples and checks.

Longer term, make each extension's components discoverable via its own catalogue (e.g. Kitchens components under a Kitchens documentation surface), with props, previews and usage examples. FireUX Docs is the presentation layer; the Kitchen package remains owner. Generate or verify inventory against real exports/registration, not manually maintained stale lists. Avoid mounting connected production screens as isolated demos.

## Ignite / Codex consistency failure — priority investigation
Ben's / Interlaken Bike Tours was generated via Ignite/Codex and appeared visually excellent on a phone, but its source reportedly introduced substantial independent page markup/styling and failed to compose the established FireUX system. **Investigate this as an architectural-enforcement failure, not as an invitation to redesign FireUX.** Inspect the actual generated app, Ignite scaffolding, instructions, component inventory, validation scripts and recent changes. Determine which checks were absent, bypassed or ineffective.

**Visual completion is not architectural completion.** A user approving a UI from a phone should not need to inspect every file to discover a parallel design system. Require source-backed composition evidence: identify reused Nuxt UI/FireUX parent and lower components, owner of state, justified custom deltas, and applicable validation. Prefer executable lint/tests/checks where feasible; use review for qualitative architecture that cannot be automatically proven. Don't add developer tooling that bloats production apps.

A separate follow-up: `AppDevControls.vue` was identified as a potential ~256-line dev-tooling concentration. Check production bundle isolation and responsibility boundaries; **not** an authorized refactor.

## Audit deliverables for the next GPT
1. Enumerate **every** app root and `app/app.vue`, `nuxt.config.ts`, `app/app.config.ts`; report exact count and missing files.
2. Compare all configurations and root layouts with source references, accepted differences and probable drift.
3. Trace config wrappers through Core helpers, tests, modules and actual runtime consumers.
4. Inventory application project-root code and matching Entity spines in packages, distinguishing legitimate local composition from duplicated ownership.
5. Audit `fireux-docs` and existing concept guides; propose a single discoverable ownership-based documentation architecture.
6. Investigate Bike Tours / Ignite's bypass of shared composition and propose the smallest enforceable safeguards.
7. Present a prioritized **no-code** migration proposal, verification plan and documentation changes. Request approval before implementation.

**No sampling, no premature refactoring, no new design system, and no assumptions that docs or the latest code are automatically correct.**
