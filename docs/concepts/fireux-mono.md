# FireUX Mono concept map
Updated: 2026-07-22
Ref: 796952bf0
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
- `projects/*/*`: concrete Nuxt apps.
- `scripts/guards/*`: executable shape rules.
- `tools/*`: local tools.
- `packages/*/*/src/runtime/demo`: package-owned reusable console Demo Data.
- `projects/*/*/app/demo`: app-owned console Demo Data.
- `temp/*`: ignored temporary work only, never authored source.
- `figma-export`: optional ignored local directory or symlink, never tracked.
- `mirror`: active local comparison workspace generated from explicit file
  lists, Git changes, or model inventories; generated links are not source.

## Working notes

- Root `package.json` owns workspace scripts.
- `pnpm-workspace.yaml` solely owns workspace package globs; do not duplicate
  them in `package.json#workspaces`.
- Root `demo/` is rejected; Demo stays with its package or app owner and loads
  only when an owning console selects it.
- Test, simulation, dev, and public prototype content are separate from Demo.
- `scripts/_lib/app-registry.mjs` owns app records and contract assignments;
  `scripts/_lib/app-smoke-contracts.mjs` owns pure HTTP contract builders.
- `scripts/guard.mjs` is the single guard entrypoint.
- `scripts/guards/dependency-ownership.mjs` rejects root runtime dependencies,
  undeclared direct imports, and nested source manifests.
- `pnpm guard` is the repo shape signal.
- `pnpm audit:scripts` rejects undated or unsupported authored scripts; rare manual entrypoints are explicit.
- Completed one-off migration scripts are removed once current writers and independent verification gates own the durable contract.
- Project apps should not own shared package truth.
- Packages and apps declare what their authored source imports; the workspace
  root does not act as a transitive runtime dependency provider.

## New project app completion

- Add the app to `scripts/_lib/app-registry.mjs` with its unique port, workspace, identity, role, consoles, and focused smoke routes.
- Run `pnpm sync:dev-workspace`; do not hand-maintain the generated root dev/kill scripts, `.vscode/tasks.json`, or `.vscode/launch.json`.
- Add the app to the app list in `tools/vscode-fireux-toolbar/extension.js` so VS Code exposes the standard start control and running spinner.
- A new app is not complete until its root dev command, kill command, VS Code task/launch entry, toolbar spinner, and focused smoke route exist.
- Run `pnpm guard` after the workspace sync.

## Tooling delta

- Mirror is retained because its scripts and VS Code toolbar integration were
  used and updated after the 2026-06-17 review trigger. It is an accepted local
  review aid, not a source tree, package lane, documentation authority, or
  runtime dependency. Re-review deletion only if its commands and toolbar entry
  become unused and are removed together.
