# AGENTS.md

Purpose: operating instructions for AI agents working in `fireux-mono`.
See: `docs/concepts/fireux-mono.md`

Effective: 2026-07-20

<!-- Concurrent edit — 2026-07-20 11:50 CEST — Root Efficiency Passes 2–4 of 4: record portable root, tooling split, and demo ownership. -->
<!-- Concurrent edit — 2026-07-19 17:07 CEST — Directory Authority Cutover: record resolved App and Ecosystem database authority. -->
<!-- Concurrent edit — 2026-07-20 20:12 CEST — Repo Efficiency Pass 2 of 6: record projected public profile reads and owner-only raw authority. -->
<!-- Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: record supported script lifecycle and shared protected artifacts. -->
<!-- Concurrent edit — 2026-07-20 22:07 CEST — Repo Efficiency Pass 4 of 6: record runtime-owned App media and guarded snapshot mutation tooling. -->
<!-- Concurrent edit — 2026-07-20 16:34 CEST — Console Spine pass: record target-state, route-meta, write-authority, and targeted-read contracts. -->
<!-- Concurrent edit — 2026-07-20 17:05 CEST — Demo Data Spine pass: record optional console fixture ownership and loading. -->
<!-- Concurrent edit — 2026-07-20 22:21 CEST — Both-Entity Authority: record canonical-root and App-support boundaries. -->

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
- Demo Data spine: `docs/concepts/demo-data.md`
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
- Node: root `package.json` requires Node `>=22.23 <23`.

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

- Allowed authored root dirs include `.github`, `.vscode`, `docs`, `packages`,
  `projects`, `scripts`, `templates`, `tools`, `types`, and `mirror`; known
  generated and local-only directories are tolerated but must remain untracked.
- `pnpm-workspace.yaml` is the sole workspace-package glob authority;
  `package.json#workspaces` is forbidden duplication.
- `figma-export` is an optional ignored machine-local directory or symlink. It
  must never be tracked or point another clone at one developer's filesystem.
- Root `demo/` is forbidden. Reusable fixtures belong to their owning package
  under `src/runtime/demo`; app-specific fixtures belong under `app/demo`.
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
- Kitchen/Menu runtime files over 400 lines are checked separately by `scripts/guards/kitchen-menu-size.mjs`; this domain complexity rule is not part of extension folder shape.

Ecosystem package shape is controlled by `scripts/guards/ecosystem.mjs`.

- Required L1: `package.json`, `registry.json`, `README.md`, `src`, `tsconfig.json`, `docs`, `.firebaserc`.
- Required tracked config: `src/config/firebase/ecosystem.config.ts` and the inert placeholder `src/config/firebase/service-account.example.json`.
- Real Firebase Admin credentials must never live inside the repository, tracked or untracked. Use application-default credentials or an external credential file referenced by environment.
- Local ADC flows that mint Firebase custom tokens may also require `FIREBASE_SERVICE_ACCOUNT_ID` plus `iam.serviceAccounts.signBlob`; the service-account email is identity metadata, not a private key.
- Required public assets surface: `src/runtime/public`.
- Implementation belongs in `src`.

Project app shape is controlled by `scripts/guards/projects.mjs`.

- Required L1: `app`, `public`, `server`, `package.json`, `nuxt.config.ts`, `tsconfig.json`, `firebase.json`, `.env`.
- Allowed L1 extras: `docs`, `content.config.ts`.
- `.firebaserc` remains forbidden at app L1 because ecosystem packages own Firebase project selection.
- Known generated output such as `.firebase`, `.nuxt`, `.output`, `.data`, `dist`, and `tsconfig.tsbuildinfo` is tolerated locally but must never be tracked.
- Every app must include the baseline public image library under `public/img/app`.

Generated-artifact containment is controlled by `scripts/guards/generated-artifacts.mjs`.

- Guards enforce authored source shape separately from disposable local output.
- Root `temp/` and `figma-export` are local-only and must remain untracked.
- Known build, cache, coverage, Firebase CLI, and TypeScript build artifacts may exist while development tools are running.
- Those artifacts must remain ignored and untracked; the generated-artifacts guard checks the Git index.
- Use `pnpm pre-guard-clean` when an intentionally artifact-free filesystem is needed. Do not require it merely to validate authored source shape.

Demo Data shape is controlled by `scripts/guards/demo-data.mjs`.

- Demo Data is optional, read-only console data. It is not public content, a
  dev preview, a test fixture, a simulation database, or storage authority.
- Reusable Demo modules live under their owning package `src/runtime/demo`;
  app-only Demo modules live under the owning project `app/demo`.
- Console composable adapters load Demo modules with dynamic imports through
  `useConsoleDemoData`. An inactive source must not import or evaluate Demo.
- Demo modules follow current real models and record shapes. Change or cull a
  stale fixture; never add compatibility or runtime fallback for it.
- Demo modules remain local and pure: no Firestore, Storage, Firebase Admin,
  server, public-adapter, or mutation value dependencies.

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

Module setup generally uses `configureFireuxModule` from `fireux-core/config/module/module-wiring` and package-specific `configureComponents`, `configureComposables`, `configurePages`, `configureServer`, etc. Models remain explicit imports unless a package has a real registration mechanism for them.

Do not add runtime surfaces without checking module registration.

Extension component/composable registration is checked by `scripts/guards/runtime-registration.mjs`.

- Runtime `components` and `composables` must be registered through `configureFireuxModule` or an intentional Nuxt runtime layer.
- Models, types, info helpers, and utilities are explicit-import libraries; they do not need fake no-op registration hooks.
- A runtime asset imported by a component is bundled through that import. Add an assets hook only for global CSS or other module-level asset behavior.

## App Config Spine

Apps use:

- `defineFireuxConfig` from `fireux-core/config/app/fireux.config`
- `withFireuxNuxtConfig` from `fireux-core/config/app/nuxt-overrides`

Important app config fields visible in code:

- `ecosystem`
- `projectId`
- `ecosystemId`, optional
- `databaseId`, optional
- `id`
- `name`
- `shortName`
- `role`: `global`, `tenant`, or `standalone`
- `modules`
- `consoles`
- `consoleConfig`
- `domains`
- `profiles`
- `selfJoinEnabled`: bootstrap and UX intent for self-joining; the value is
  copied into a newly created canonical App, whose stored
  `self_join_enabled` field is the server enforcement authority
- `navHiddenKeys`

`ecosystem` selects the ecosystem package/Firebase binding. It is not an entity
relationship. `projectId` names the canonical FireUX Project entity;
`ecosystemId` names the canonical Ecosystem entity and is omitted for direct
Project Apps.

`databaseId` optionally selects the App runtime database. The canonical App
record follows that resolved database; without an override it uses the
Ecosystem binding database. Canonical Ecosystem identity remains in the binding
database and must not follow an app-specific override.

`useFireUXConfig` is the runtime app identity/mode accessor. Do not duplicate app mode logic locally.

Global apps can expose multiple domains/consoles. Tenant apps can pin console targets through `consoleConfig.<family>.targetIds` and often set `canCreate: false`.

## Console Spine

Shared console primitives live in:

- `packages/core/fireux-core/src/runtime/composables/fireux/app/console/useConsole.ts`
- `useConsoleAccess.ts`
- `useConsoleEntityRuntime.ts`
- `useConsoleDemoData.ts`
- `useConsoleTargets.ts`
- `useConsoleIndex.ts`
- `useConsoleOverview.ts`
- `useConsoleSelection.ts`
- `useConsoleTeam.ts`

Console page `nav` metadata is presentation-only. Put authentication, roles,
visibility, and target-selection requirements at top-level page metadata.
Console write controls may reflect `canWrite`, but every mutation must also
enforce that runtime authority before changing Firestore or Storage.

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

For a `storage: 'both'` entity, root means canonical top-level identity, not
automatically public-readable. Supplier, Portfolio, Property, and Kitchen each
have one root entity plus a same-id App support record. App support records own
access and only an explicitly modelled operational delta; they never supply
identity, override root stamps/relationships, or become an entity when the root
is missing. Joined reads require the root and allowlist App fields. Root and App
mutations use separately named fixed paths and never accept caller-selected
scope or collection paths. Property owns optional `portfolio_id` and required
`place_id`; Portfolio stores no inverse or nested full Property. The shared
attach reread is a correctness check only: deployed Rules or trusted server
transactions remain the create/transfer/access security boundary. These shape
rules are checked by `scripts/guards/both-entity-authority.mjs`.

Identity records follow one strict boundary: `/users/{uid}` is public identity,
`/users/{uid}/private/account` is owner-private account data,
`/users/{uid}/notifications/{notificationId}` is owner-only delivery/read state,
and `/apps/{appId}/users/{uid}` is app membership and capability authority.
User, UserApp, and root/app profile documents never embed identity snapshots or
notification arrays. Root profiles join canonical User by matching uid.
Profile creation goes through a fixed authenticated domain endpoint backed by
`server/utils/profile/provision`: domain models own exact seeds, while the
server transaction creates records and updates `User.profiles` and
`UserApp.profiles` in canonical profile order. Provisioning is self-only and
the profile id must be listed in the current App's runtime `profiles`; disabled
profile routes fail closed before Firestore access. Browsers must not create
profile records, mutate either
profile index directly, or publish notifications; notification producers are
trusted server pipelines, while owners retain read/acknowledgement controls.
Root Agent, Chef, and Professional documents are complete exact model shapes;
sparse profile documents and compatibility aliases are invalid. Their domain
seeds create every canonical field, and owner updates must preserve the full
shape enforced by Firestore Rules. Those public roots are self-editable and raw
client reads are owner-only; public list/detail pages consume the bounded
domain API projection and initial detail content is server-rendered through
`usePublicProfileDetail`. Their App overlays remain stamps-only. Root and App
mutation helpers are separate authorities and must not regain a caller-selected
scope. Public URL fields are empty or valid HTTPS. `User.avatar` is valid HTTPS
or the canonical `/img/ecosystem/avatar.png` value; clearing an avatar persists
that value, not an empty string. A Professional owner mutation may change at
most one structured profile family so every changed item remains fully
Rules-validated. Professional experience stores a valid `place_id` reference,
never a Place snapshot. The editor must materialize the canonical Place before
assigning the reference. Before client Place writes are ever unblocked, move
structured Professional writes behind a trusted server boundary that verifies
every referenced Place; syntactic Rules validation alone cannot prove up to 24
references within Firestore access-call limits.

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

## Shared Seam Boundaries

FireUX uses named domain layers with small shared mechanics. Similar pages,
collection managers, and console families should remain independently named so
their domain delta can grow without unpicking a generic shell.

- Share repeated state transitions, filtering, mapping mechanics, and small
  presentation primitives; keep data authority, copy, actions, routes, and
  domain rendering in the named domain layer.
- `useCollectionSearch` owns collection filtering and variant state.
  `useCollectionVariantCards` owns pill/cell mapping mechanics. Do not merge
  these into a collection-manager shell or make either composable own fetching.
- A collection manager using `useDevCollectionJson` must load its snapshot on
  `DevJson` open and unload it on close. `scripts/guards/canon.mjs` enforces the
  lifecycle so a closed debug panel performs no snapshot work.
- Every `useConsoleIndex` adapter must pass its source collection `outcome`.
  Outcome is the sole loading/error/ready/empty authority; card count and a
  separate pending fallback must not infer source state.
- App membership pending/error state participates in global console target
  outcome; an access read failure must never be presented as an empty target
  collection or used to invalidate persisted selection.
- ID-limited console target reads load those root documents directly. Do not
  bind the full root collection and filter it client-side when target IDs or
  operator overlays already define the allowed set.
- Console Demo adapters defer fixture imports until their source is active and
  pass their explicit outcome onward. Test, simulation, and dev fixtures are
  separate families and must not be folded into Demo.
- Named `ConsoleXIndexTargets` wrappers may share `ConsoleTargetCollection` for
  state presentation. They retain domain mapping, selection, copy, actions,
  and multi-source composition; an idle source renders no chooser.

See `docs/concepts/collection-manager.md` and `docs/concepts/console.md` for the
current maps and source links.

## Public, Console, and Firestore Buckets

Use these mental buckets:

- `firestore`: stored entity stack and CRUD/read seams.
- `console`: selected operator workspace and console-owned operations.
- `public`: public/runtime route helpers and presentation seams.
- `app` project folder: app-local composition only.

If a domain behavior should work across apps, put it in the owning package, not in a single project app.

Package ownership is checked by `scripts/guards/ownership.mjs`.

- Apps may own pages and app-specific composition for a package-owned console family.
- Apps must not recreate `components/Console/<Family>` or `composables/fireux/console/<family>` when a package already owns that family.
- A console family with no package owner may remain app-local while its entity-ness and reuse boundary are still being established.

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
six weeks. It also fails when an authored script lacks an executable caller,
unless the script explicitly declares `manual_entrypoint: true`. Manual
entrypoints are rare, named, dry-run-first operational seams; documentation
references alone do not make an ordinary script active. Do not delete stale
scripts automatically; review whether they are still part of the active
command surface first. Completed migration and recovery scripts belong in Git
history once current creation paths own the canonical shape and a separate
release or verification gate retains any required completion proof.

Root `package.json` exposes supported user commands. CI and documentation use
the canonical `guard` and `typecheck:*` commands directly; do not add aliases
that only forward to another root command.

Protected JSON backups shared by ordinary operational scripts use
`scripts/_lib/protected-json-artifact.mjs`. The helper owns only exclusive
mode-0600 serialization and hashing. Target selection, payload projection,
dry-run/apply authority, batching, and post-write verification remain in each
named domain script. Stronger crash-journal or fsync workflows stay local.

App media mutation is runtime-owned. `pnpm audit:app-media` is read-only;
historical root scripts that bulk-uploaded, reset, or deleted App media are not
supported operational entrypoints. Firestore snapshot syncs must name the
project and database, default to inspection, require target-bound confirmation
plus a protected preimage before apply, reject changed source/target versions,
verify written fields, and release Firebase Admin apps.

Dev model-drift copy is diagnostic data. Do not attach a generic cross-domain
migration recipe that guesses missing values or deletes type-mismatched fields;
write a reviewed domain migration when a real data change is required.

Root ESLint treats authored `.mjs` and `.cjs` tooling as first-class source.
Generated output and local scratch lanes are excluded; moving authored tooling
into `temp/` to evade checks is not allowed.

`scripts/_lib/app-registry.mjs` owns app identity, routes, and smoke-contract
assignments. Pure HTTP contract builders belong in
`scripts/_lib/app-smoke-contracts.mjs`; do not mix them back into registry data.

## Concurrent Edit Stamps

Timestamped `Concurrent edit` comments are short-lived coordination markers for
multiple active tasks sharing the same worktree. They identify who touched an
authored file, when, and for what narrow scope so another task can avoid
silently overwriting concurrent work. They are not canon, TODOs, ownership
locks, implementation rationale, or evidence that the named task is complete.

When concurrent tasks are confirmed in the same worktree, add one syntax-safe
stamp to every authored file you materially edit:

```text
Concurrent edit — YYYY-MM-DD HH:mm TZ — <task or pass>: <narrow scope>.
```

Stamp rules:

- Use the actual local wall-clock time and include the timezone abbreviation.
- Name the task or pass and the edited seam; do not write a vague `updated`
  comment.
- Use the file's native comment form: `//` in TypeScript/JavaScript or Vue
  script, `<!-- -->` in Markdown or Vue template, and `/* */` in CSS.
- Keep one active stamp per task per file. Update your own stamp when continuing
  the same work; never rewrite or remove another active task's stamp.
- Preserve surrounding changes from other tasks. A stamp warns about a
  collision; it does not make an overlapping edit safe by itself.
- Do not stamp generated output, lockfiles, snapshots, build artifacts, or
  machine-owned files. Do not corrupt JSON, CSV, or another comment-hostile
  format to add a stamp; report that path in the handoff instead.
- A concurrent checkpoint may commit stamps while work is active. Do not infer
  completion from the commit, and do not block a safe checkpoint merely because
  stamps are present.
- Remove or consolidate stamps only during an explicit reconciliation/cleanup
  after the overlapping tasks have completed. Git history remains the durable
  provenance after that cleanup.

## Communication

When the user says `canon`, `spine`, `align`, `family`, or `drift`, pause before editing and state:

- what must match
- what may differ
- which sibling is the reference
- which files will be touched

Be direct when the repo is drifting. The goal is not to agree with every local exception; the goal is to help FireUX become simpler, stronger, and less spaghetti-shaped.
