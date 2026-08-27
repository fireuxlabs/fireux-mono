# FireUX Mono concept map

Updated: 2026-08-27
Ref: e23268507
Role: map, not canon

## Purpose

Explain the repo as a workspace so agents do not rediscover the skeleton.

## Scope

- Root pnpm workspace.
- Package lanes.
- Project app lanes.
- Guard scripts and command entry points.

## Vertical links

- Parent: ../../AGENTS.md
- Child: fireux.md
- Child: pnpm.md
- Child: runtime-package.md
- Child: app-config.md
- Child: app-ignition.md
- Child: sharer.md

## Horizontal links

- spine.md
- pages.md
- components.md
- composables.md
- demo-data.md

## Current shape

- `packages/core/*`: shared foundations.
- `packages/ecosystem/*`: ecosystem identity/config packages.
- `packages/extensions/*`: reusable domain packages.
- `projects/*/*`: concrete Nuxt Apps and the guarded project template; the
  explicit no-FireUX embed harness is a static project exception, not a
  workspace package.
- `scripts/guards/*`: executable shape rules.
- `tools/*`: local tools.
- `packages/*/*/src/runtime/<entity>/demo`: entity-owned reusable Workspace Demo
  Data. Root `runtime/demo` is reserved for genuine cross-entity composition
  or package-owned record families without a declared Entity.
- `projects/*/*/app/demo`: app-owned workspace Demo Data.
- `temp/*`: ignored temporary work only, never authored source.
- `figma-export`: optional ignored local directory or symlink, never tracked.
- `mirror`: active local comparison workspace generated from explicit file
  lists, Git changes, or model inventories; generated links are not source.

## Repository ownership spine

Read the workspace in one dependency direction:

```text
Core foundations
    ↓
Shared domain primitives
    ↓
Entity and parent-domain packages
    ↓
Ecosystem composition
    ↓
Concrete Apps
```

This is the repository comprehension spine, not a replacement for the three
package lanes. `packages/extensions` contains both shared domain primitives
and entity/parent-domain packages; the owning package and its dependencies
determine its position. A primitive may still own an Entity: Place is a
canonical Entity and also supplies lower Place capabilities to several domain
packages.

The current package classification is:

| Repository role | Current packages |
| --- | --- |
| Core foundations | `fireux-core`, `fireux-docs`, `fireux-nuxtfire` |
| Shared domain primitives | `fireux-ai`, `fireux-demo`, `fireux-finance`, `fireux-go-qr`, `fireux-places`, `fireux-sproochli`, `fireux-translation` |
| Entity and parent-domain packages | `fireux-blogs`, `fireux-companies`, `fireux-compliance`, `fireux-documents`, `fireux-jobs`, `fireux-kitchens`, `fireux-marketplace`, `fireux-products`, `fireux-properties`, `fireux-reservations`, `fireux-suppliers`, `fireux-tasks` |
| Ecosystem composition | `fireux-bringli`, `fireux-buenohost`, `fireux-fireux`, `fireux-granite`, `fireux-misebox`, `fireux-sharer`, `fireux-slap`, `fireux-werkbox` |
| Concrete Apps | packages under `projects/<ecosystem>/<app>`; `projects/templates/fireux-template` is the guarded project template |

Package role describes the primary dependency and ownership job. It does not
authorize an upper layer to absorb a lower owner's implementation, and it
does not require a package split merely because one package owns multiple
related Entities.

## Cold-reading path

A human or agent entering an unfamiliar scope follows this bounded path:

1. Read `AGENTS.md`, `docs/ai/gpt-context.md`, and the smallest applicable
   scoped context.
2. Read the owning package's `package.json` and `src/module.ts` to establish
   dependencies and Nuxt registration.
3. Start from the relevant Nuxt entrypoint under `pages`, `layouts`,
   `middleware`, `plugins`, or `server/api`.
4. Follow that adapter into `runtime/<entity>/<technical-role>` when one Entity
   owns the behavior, or the root technical spine when it is genuinely shared.
5. Follow dependencies only downward through the repository ownership spine.
6. Verify the claim against the nearest working sibling and relevant guard.

If that path requires searching unrelated component, composable, or server
trees to discover the owner, classify the placement as drift or migration;
do not normalize the ambiguity in documentation.

## Working notes

- Root `package.json` owns workspace scripts.
- `pnpm-workspace.yaml` solely owns workspace package globs; do not duplicate
  them in `package.json#workspaces`.
- The five workspace lanes are exactly `packages/core/*`,
  `packages/extensions/*`, `packages/ecosystem/*`, `projects/*/*`, and
  `tools/*`. A directory does not become a package without its own manifest.
- `pnpm-workspace.yaml#allowBuilds` is the narrow install-script policy and
  every entry uses an explicit boolean.
- `tsconfig.base.json` is the root package-path authority. Each package keeps
  its leaf config, every Nuxt App extends `projects/tsconfig.projects.json`,
  and hand-maintained aggregate configs under package lanes or `projects/` are
  retired.
- Root `demo/` is rejected; Demo stays with its package or app owner and loads
  only when an owning workspace selects it.
- Test, simulation, dev, and public prototype content are separate from Demo.
- `scripts/_lib/app-registry.mjs` is the authored source for App records and
  contract assignments; `scripts/_lib/app-smoke-contracts.mjs` owns pure HTTP
  contract builders. `pnpm sync:dev-workspace` projects the registry into root
  App dev/kill scripts, VS Code task/launch files, and the generated toolbar
  App list. `tools/vscode-fireux-toolbar/apps.presentation.json` owns only
  toolbar-specific order, icons, and non-App extras.
- `scripts/guard.mjs` is the single guard entrypoint.
- `pnpm measure:workspace` times the existing verification commands and emits
  environment-labelled JSON; it does not create a second correctness gate or
  an evidence-free timing threshold.
- `scripts/guards/dependency-ownership.mjs` rejects root runtime dependencies,
  undeclared direct imports, and nested source manifests.
- `pnpm guard` is the repo shape signal.
- `pnpm audit:scripts` rejects undated or unsupported authored scripts; rare manual entrypoints are explicit.
- Completed one-off migration scripts are removed once current writers and independent verification gates own the durable contract.
- Project apps should not own shared package truth.
- Packages and apps declare what their authored source imports; the workspace
  root does not act as a transitive runtime dependency provider.

## New project app completion

- A project directory is not an App until it passes the same project guard as
  every existing App. Direct folder copies do not create an exception: the
  canonical Level-1 shape, complete public image library, explicit asset
  source/projection authority, Core-owned auth/PWA seams, and exact App
  registry workspace are mandatory from the first save.
- Every real `projects/<ecosystem>/<app>` package must have exactly one current
  workspace entry in `scripts/_lib/app-registry.mjs`. Missing Apps and stale
  registry targets are blocking repository drift; the guarded template is the
  only project package excluded from registration.
- When the App has a public/custom hostname, pass it as hostname-only to the
  canonical creation workflow. Confirm both that hostname and the derived
  Firebase Hosting `<site-id>.web.app` hostname in the single Firebase
  Authentication decision; pass `--firebase-site` when the site id differs
  from the scaffold slug. Automated creation must provide the corresponding
  yes/no flag; it may not silently skip or mutate remote Auth configuration.
- Add the app to `scripts/_lib/app-registry.mjs` with its unique port,
  workspace, identity, role, workspaces, and focused smoke routes.
- Resolve data ownership before generating product code: global and tenant
  Apps inherit the ecosystem database; every production standalone App gets a
  dedicated named database. Provision the canonical named-database
  `apps/{appId}` record through the creation workflow. A folder alone is never
  a completed App.
- Run `pnpm sync:dev-workspace`; do not hand-maintain the generated root
  dev/kill scripts, `.vscode/tasks.json`, `.vscode/launch.json`, or
  `tools/vscode-fireux-toolbar/apps.js`. Add an optional presentation entry
  only when the toolbar needs a non-default icon or order.
- Complete the standard `/img/app/*` artwork family before saving. Materialize
  named Core/ecosystem projections from their canonical source and never
  borrow another App's export.
- A new app is not complete until its root dev command, kill command, VS Code task/launch entry, toolbar spinner, and focused smoke route exist.
- Run `pnpm guard` after the workspace sync.

## Tooling delta

- Mirror is retained because its scripts and VS Code toolbar integration were
  used and updated after the 2026-06-17 review trigger. It is an accepted local
  review aid, not a source tree, package lane, documentation authority, or
  runtime dependency. Re-review deletion only if its commands and toolbar entry
  become unused and are removed together.
