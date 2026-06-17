FireUX Mono concept map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

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
- `temp/*`: temporary work only.

Working notes:
- Root `package.json` owns workspace scripts.
- `scripts/guard.mjs` is the single guard entrypoint.
- `pnpm guard` is the repo shape signal.
- Project apps should not own shared package truth.

Open questions:
- Whether `mirror` remains useful is scheduled for later review.
