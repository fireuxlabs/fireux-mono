FireUX Mono concept map
Updated: 2026-07-20
Ref: 8d83d3fa7
Role: map, not canon

<!-- Concurrent edit — 2026-07-20 11:50 CEST — Root Efficiency Passes 2–4 of 4: map portable root and owned tooling fixtures. -->
<!-- Concurrent edit — 2026-07-20 17:05 CEST — Demo Data Spine pass: distinguish optional console fixtures from other data families. -->
<!-- Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: map the supported root script surface. -->

Purpose:
Explain the repo as a workspace so agents do not rediscover the skeleton.

Scope:

- Root pnpm workspace.
- Package lanes.
- Project app lanes.
- Guard scripts and command entry points.

Vertical links:

- Parent: ../../AGENTS.md
- Child: fireux.md
- Child: pnpm.md
- Child: runtime-package.md
- Child: app-config.md

Horizontal links:

- spine.md
- pages.md
- components.md
- composables.md
- demo-data.md

Current shape:

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

Working notes:

- Root `package.json` owns workspace scripts.
- `pnpm-workspace.yaml` solely owns workspace package globs; do not duplicate
  them in `package.json#workspaces`.
- Root `demo/` is rejected; Demo stays with its package or app owner and loads
  only when an owning console selects it.
- Test, simulation, dev, and public prototype content are separate from Demo.
- `scripts/_lib/app-registry.mjs` owns app records and contract assignments;
  `scripts/_lib/app-smoke-contracts.mjs` owns pure HTTP contract builders.
- `scripts/guard.mjs` is the single guard entrypoint.
- `pnpm guard` is the repo shape signal.
- `pnpm audit:scripts` rejects undated or unsupported authored scripts; rare manual entrypoints are explicit.
- Completed one-off migration scripts are removed once current writers and independent verification gates own the durable contract.
- Project apps should not own shared package truth.

New project app completion:

- Add the app to `scripts/_lib/app-registry.mjs` with its unique port, workspace, identity, role, consoles, and focused smoke routes.
- Run `pnpm sync:dev-workspace`; do not hand-maintain the generated root dev/kill scripts, `.vscode/tasks.json`, or `.vscode/launch.json`.
- Add the app to the app list in `tools/vscode-fireux-toolbar/extension.js` so VS Code exposes the standard start control and running spinner.
- A new app is not complete until its root dev command, kill command, VS Code task/launch entry, toolbar spinner, and focused smoke route exist.
- Run `pnpm guard` after the workspace sync.

Open questions:

- Whether `mirror` remains useful is scheduled for later review.
