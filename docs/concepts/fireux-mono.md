FireUX Mono concept map
Updated: 2026-07-20
Ref: f7d3704ef
Role: map, not canon
<!-- Concurrent edit — 2026-07-20 11:50 CEST — Root Efficiency Passes 2–4 of 4: map portable root and owned tooling fixtures. -->

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

Current shape:
- `packages/core/*`: shared foundations.
- `packages/ecosystem/*`: ecosystem identity/config packages.
- `packages/extensions/*`: reusable domain packages.
- `projects/*/*`: concrete Nuxt apps.
- `scripts/guards/*`: executable shape rules.
- `tools/*`: local tools.
- `packages/*/*/src/runtime/demo`: package-owned reusable demo fixtures.
- `projects/*/*/app/demo`: app-owned demo fixtures.
- `temp/*`: ignored temporary work only, never authored source.
- `figma-export`: optional ignored local directory or symlink, never tracked.

Working notes:
- Root `package.json` owns workspace scripts.
- `pnpm-workspace.yaml` solely owns workspace package globs; do not duplicate
  them in `package.json#workspaces`.
- Root `demo/` is rejected; fixtures stay with their package or app owner.
- `scripts/_lib/app-registry.mjs` owns app records and contract assignments;
  `scripts/_lib/app-smoke-contracts.mjs` owns pure HTTP contract builders.
- `scripts/guard.mjs` is the single guard entrypoint.
- `pnpm guard` is the repo shape signal.
- Project apps should not own shared package truth.

New project app completion:
- Add the app to `scripts/_lib/app-registry.mjs` with its unique port, workspace, identity, role, consoles, and focused smoke routes.
- Run `pnpm sync:dev-workspace`; do not hand-maintain the generated root dev/kill scripts, `.vscode/tasks.json`, or `.vscode/launch.json`.
- Add the app to the app list in `tools/vscode-fireux-toolbar/extension.js` so VS Code exposes the standard start control and running spinner.
- A new app is not complete until its root dev command, kill command, VS Code task/launch entry, toolbar spinner, and focused smoke route exist.
- Run `pnpm guard` after the workspace sync.

Open questions:
- Whether `mirror` remains useful is scheduled for later review.
