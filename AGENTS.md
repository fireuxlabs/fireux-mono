# AGENTS.md

Purpose: operating instructions for AI agents working in `fireux-mono`.
See: `docs/concepts/fireux-mono.md`

Effective: 2026-06-17

## Current Documentation State

Markdown documentation was intentionally culled. Do not treat deleted docs, recovered docs, old chat notes, or old README content as authority.

Markdown now consists only of `AGENTS.md`, guard-required `README.md` placeholders, and `docs/concepts/*.md` concept maps. Do not expand README placeholders unless the user asks for that rebuild.

Concept `.md` files are allowed as small maps. They explain local working context; they do not define system truth unless the code and guards agree. Each concept map should carry an `Updated` date and `Ref` git short hash.

Documentation file rule:

- `AGENTS.md`: agent operating instructions.
- `README.md`: guard/package placeholder or landing map; not canon by default.
- `docs/concepts/*.md`: current concept maps; map, not canon.
- Other `.md`: avoid unless a tool/convention requires it or the user asks.

## Concept Cascade

Use the smallest relevant concept map before broad repo scanning:

- FireUX Mono repo: `docs/concepts/fireux-mono.md`
- Documentation files: `docs/concepts/documentation.md`
- FireUX platform shape: `docs/concepts/fireux.md`
- Spine/canon working method: `docs/concepts/spine.md`
- Nuxt 4 and Vue 3: `docs/concepts/nuxt4.md`
- Nuxt UI: `docs/concepts/nuxt-ui.md`
- Color mode and light/dark spine: `docs/concepts/color-mode.md`
- Layouts spine: `docs/concepts/layouts.md`
- pnpm workspace/scripts: `docs/concepts/pnpm.md`
- Runtime package spine: `docs/concepts/runtime-package.md`
- App config spine: `docs/concepts/app-config.md`
- Entities: `docs/concepts/entities.md`
- Pages spine: `docs/concepts/pages.md`
- Components spine: `docs/concepts/components.md`
- Collection managers: `docs/concepts/collection-manager.md`
- Composables spine: `docs/concepts/composables.md`
- Firestore entity spine: `docs/concepts/firestore-entity.md`
- Console spine: `docs/concepts/console.md`
- Server API spine: `docs/concepts/server-api.md`
- Debug surfaces: `docs/concepts/debug.md`
- Tool providers: `docs/concepts/tool-provider.md`
- AI document processing: `docs/concepts/ai-document-processing.md`
- Console entity family: `docs/concepts/family-console-entity.md`
- Public index family: `docs/concepts/family-public-index.md`
- Public detail family: `docs/concepts/family-public-detail.md`
- Menu family: `docs/concepts/family-menu.md`
- Menu ordering: `docs/concepts/menu-ordering.md`
- Tenant/global family: `docs/concepts/family-tenant-global.md`

## Prime Directive

FireUX needs a solid spine more than another local exception.

In this repo, “canon” means a repeatable pattern proven by source structure, sibling implementations, and guard rules. If “canon” feels too slippery, use “spine”: the shared shape that similar surfaces follow before domain deltas are added.

Before editing any entity, console, route family, model, collection manager, public surface, module registration, or reusable seam:

1. Name the family.
2. Name the nearest working sibling.
3. Name the shared shape.
4. Name the accepted delta.
5. Then patch the smallest useful slice.

When a new concept appears, discuss its entity-ness before giving it full entity ceremony. Start as `to-confirm` unless it clearly has independent identity, lifecycle, route, collection stack, console/public surface, or cross-parent references. Use `docs/concepts/entities.md` as the checkpoint.

If a tiny behavior requires a broad diff, stop and report the missing seam. Do not patch around misunderstanding.

## Tech Stack

- Monorepo: FireUX Mono. See `docs/concepts/fireux-mono.md`.
- Package manager: `pnpm`. See `docs/concepts/pnpm.md`.
- App framework: Nuxt 4 and Vue 3. See `docs/concepts/nuxt4.md`.
- UI: Nuxt UI / Nuxt UI Pro conventions. See `docs/concepts/nuxt-ui.md`.
- Language: TypeScript.
- Runtime/server: Nitro, h3, Firebase, VueFire, Firebase Admin where needed.
- Styling: Nuxt UI plus existing app/package CSS; Tailwind 4 is present.
- Node: root `package.json` requires Node `>=20.11 <23`.

Do not introduce React, another UI kit, another router, or another package manager.

## FireUX Shape

FireUX is a modular Nuxt platform.
See: `docs/concepts/fireux.md`

- `packages/core/*`: shared primitives, runtime foundations, config helpers, module helpers, shared components/composables/models/pages/server utilities.
- `packages/ecosystem/*`: ecosystem packages with identity/config/public assets/Firebase binding.
- `packages/extensions/*`: domain extension packages that own reusable runtime surfaces.
- `projects/*/*`: concrete apps that consume packages. Apps may compose and configure; shared domain truth belongs in packages.
- `scripts/guards/*`: executable shape rules. These are the closest current authority for repo structure.

## Look First

1. User request and directly named files.
2. Nearest sibling implementation in the same family.
3. Guard files under `scripts/guards/*` when shape or naming is involved.
4. Package `src/module.ts` and `src/config/module/*` when runtime registration is involved.
5. Root `package.json` scripts when choosing checks.

Do not scan the whole repo by default. Scan broadly only when the user asks for repo-wide reassessment, canon/spine alignment, or drift analysis.

## Guard-Backed Shape Findings

Root shape is controlled by `scripts/guards/root.mjs`.

- Allowed root dirs include `.github`, `.vscode`, `docs`, `packages`, `projects`, `scripts`, `templates`, `tools`, `types`, `temp`, `mirror`, `node_modules`, and `demo`.
- Allowed root files include `AGENTS.md`, `README.md`, package manager files, TypeScript config, lint config, and deploy ignore files.
- `mirror/README.md` is guard-required in the old shape, though docs are currently culled.

Core package shape is controlled by `scripts/guards/core.mjs`.

- Required L1: `package.json`, `registry.json`, `README.md`, `src`, `tsconfig.json`.
- Core packages must not expose `exports['./runtime']`.
- Core packages must not add `src/runtime/index.ts`.
- Implementation belongs in `src`.

Extension package shape is controlled by `scripts/guards/extensions.mjs`.

- Required L1: `package.json`, `registry.json`, `README.md`, `src`, `tsconfig.json`.
- Optional L1: `docs`.
- Implementation belongs in `src`.
- Kitchen/Menu runtime files over 400 lines are guard failures.

Ecosystem package shape is controlled by `scripts/guards/ecosystem.mjs`.

- Required L1: `package.json`, `registry.json`, `README.md`, `src`, `tsconfig.json`, `docs`, `.firebaserc`.
- Required config: `src/config/firebase/ecosystem.config.ts` and `src/config/firebase/service-account.json`.
- Required public assets surface: `src/runtime/public`.
- Implementation belongs in `src`.

Project app shape is controlled by `scripts/guards/projects.mjs`.

- Required L1: `app`, `public`, `server`, `package.json`, `nuxt.config.ts`, `tsconfig.json`, `firebase.json`, `.env`.
- Allowed L1 extras: `docs`, `content.config.ts`.
- Forbidden L1: build output, `.firebase`, `.firebaserc`, `.nuxt`, `.output`, `dist`, `tsconfig.tsbuildinfo`.
- Every app must include the baseline public image library under `public/img/app`.

## Runtime Package Spine

Most packages follow this runtime shape:
See: `docs/concepts/spine.md`

- `src/module.ts`
- `src/config/module/*`
- `src/runtime/components`
- `src/runtime/composables`
- `src/runtime/models`
- `src/runtime/pages`
- `src/runtime/server`
- `src/runtime/utils`

Module setup generally uses `configureFireuxModule` from `fireux-core/config/module/module-wiring` and package-specific `configureComponents`, `configureComposables`, `configurePages`, `configureModels`, `configureServer`, etc.

Do not add runtime surfaces without checking module registration.

## App Config Spine

Apps use:

- `defineFireuxConfig` from `fireux-core/config/app/fireux.config`
- `withFireuxNuxtConfig` from `fireux-core/config/app/nuxt-overrides`

Important app config fields visible in code:

- `ecosystem`
- `id`
- `name`
- `shortName`
- `role`: `global`, `tenant`, or `standalone`
- `modules`
- `consoles`
- `consoleConfig`
- `domains`
- `profiles`
- `navHiddenKeys`

`useFireUXConfig` is the runtime app identity/mode accessor. Do not duplicate app mode logic locally.

Global apps can expose multiple domains/consoles. Tenant apps can pin console targets through `consoleConfig.<family>.targetIds` and often set `canCreate: false`.

## Console Spine

Shared console primitives live in:

- `packages/core/fireux-core/src/runtime/composables/fireux/app/console/useConsole.ts`
- `useConsoleTargets.ts`
- `useConsoleIndex.ts`
- `useConsoleOverview.ts`
- `useConsoleSelection.ts`
- `useConsoleTeam.ts`

Domain console composables belong under:

`composables/fireux/console/<entity>/{core,index,overview,identity,team,operations}`
or, for deliberately parked surfaces only,
`composables/fireux/console/<entity>/sundries`.

Allowed console entity root buckets are only:

- `core`
- `identity`
- `index`
- `overview`
- `team`
- `operations`
- `sundries`

`sundries` is a temporary quarantine for parked, loose, or underdeveloped
console surfaces. Do not treat it as a permanent product bucket; a sundry
should later graduate into `operations`, move into a core sheet, or be deleted.

Do not add console buckets named `runtime-*`, `facade`, `stack`, `manager`, `processor`, `handler`, or `resolver`.

Index component pattern:

- Page: `pages/console/<entity>/index.vue`
- Wrapper component: `ConsoleXIndex`
- Child components: `ConsoleXIndexSelected`, `ConsoleXIndexTargets`
- Domain composable: `useXConsoleIndex`
- Shared core: `useConsoleIndex`

The current mirror examples are Blank, Kitchen, Supplier, Portfolio, and Property. Blank is the smallest reference; Kitchen/Supplier show domain target fetching.

## Firestore Entity Spine

FireUX defines entities. Firestore is one storage/access family for those
entities. Use `docs/concepts/entities.md` and
`packages/core/fireux-core/src/runtime/models/core/entity.model.ts` when
deciding whether a thing is an entity, record, shape, primitive, or bucket.

Firestore entity composables belong under:

`composables/fireux/firestore/<entity>`

Allowed child buckets are:

- `fetch`
- `mutations`
- `seo`
- `utils`

Do not place console operation folders inside Firestore stacks. Do not add Firestore buckets named `runtime-*`, `facade`, `stack`, `manager`, `processor`, or `handler`.

Known boring entity stack examples include kitchen, supplier, product, place, company, blog, property, portfolio, ingredient, recipe, dish, menu, translation, job, task.

## Component Spine

Package UI belongs under `src/runtime/components/**`; app UI belongs under `app/components/**`.

The component guard rejects:

- `organisms` folders.
- `Organisms*` component names.
- Broken relative imports inside component source files.

Domain components commonly use:

- `X/Cards`
- `X/Collection`
- `X/Create`
- `X/Edit`
- `X/Overview`
- `Console/X/...`

Prefer named domain components plus shared composables/functions over one generic shell that hides domain meaning.

## Public, Console, and Firestore Buckets

Use these mental buckets:

- `firestore`: stored entity stack and CRUD/read seams.
- `console`: selected operator workspace and console-owned operations.
- `public`: public/runtime route helpers and presentation seams.
- `app` project folder: app-local composition only.

If a domain behavior should work across apps, put it in the owning package, not in a single project app.

## Working Rules

- Keep changes small and localized.
- Prefer the nearest sibling over invention.
- Prefer existing shared core seams over local helpers.
- If a flow is messy, write inputs, process, outputs, and failure states before coding.
- Do not add files just to hide complexity; add files only for real reusable seams.
- Do not patch on top of a misunderstood patch. Simplify to the smallest coherent seam, then rebuild.
- Do not invent fallback, legacy, compatibility, fake identity, fake avatar/logo, or placeholder truth.
- Display defaults are allowed only when clearly non-canonical UI.
- Do not treat old deleted markdown as authority.
- Do not recreate documentation unless the user asks.

## Checks

Use focused checks while iterating. Avoid running expensive checks after every tiny edit unless the user asks.

Useful commands:

- `git diff --check`
- `pnpm guard`
- `pnpm --dir <package-or-app> exec tsc --noEmit`
- `pnpm --dir <app> exec nuxi typecheck`

Current caveat: guard-required README placeholders are intentionally blank TODO files after the documentation reset.

## Script Lifecycle

Tracked scripts under `scripts/` carry a small `@fireux-script` header with
`last_used: YYYY-MM-DD`. When an agent runs or meaningfully relies on a script,
update that date in the script header.

Use `pnpm audit:scripts` to list scripts whose `last_used` date is older than
six weeks. Do not delete stale scripts automatically; review whether they are
still part of the active command surface first.

## Communication

When the user says `canon`, `spine`, `align`, `family`, or `drift`, pause before editing and state:

- what must match
- what may differ
- which sibling is the reference
- which files will be touched

Be direct when the repo is drifting. The goal is not to agree with every local exception; the goal is to help FireUX become simpler, stronger, and less spaghetti-shaped.
