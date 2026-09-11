# pnpm concept map

Updated: 2026-09-11
Ref: 53fa40ee6
Role: map, not canon

## Purpose

Locate workspace configuration and working commands.

## Links

- Parent: fireux-mono.md
- Related: runtime-package.md, app-config.md

## Workspace

`pnpm-workspace.yaml` owns package globs, dependency overrides, install-script
allowances, and the Node version. Root `package.json` pins pnpm and owns shared
commands. Each package owns its runtime dependencies and local scripts.
`tsconfig.base.json` owns source aliases; Nuxt Apps share
`projects/tsconfig.projects.json`.

The desktop launcher discovers Apps and ports through
`tools/fireux-launcher/apps.mjs`. Root dev shortcuts invoke App-owned commands.
VS Code launch entries and toolbar presentation are maintained directly.
There is no App registry or synchronization generator.

## Commands

- `pnpm launcher`: open the desktop App picker.
- `pnpm dev:<app>` or `pnpm --dir <app> dev`: run an App's dev command.
- `pnpm --dir <package> exec tsc --noEmit`: check one package.
- `pnpm --dir <app> exec nuxi typecheck`: check a Nuxt App.
- `pnpm build:packages`: build workspace packages.
- `pnpm build:nuxt-baseline`: build FireUX Blank.
- `pnpm typecheck:packages` and `pnpm typecheck:apps`: broader checks.
- `pnpm lint`: run the current ESLint configuration.
- `pnpm gitsave`: stage all changes, commit, and push through
  `.github/gitsave.sh`; run only when the user requests a save and the shared
  tree is stable. It does not run the deleted guard suite.

Inspect `package.json` for the exact current command. The former `scripts/`
commands, smoke wrappers, registry synchronization, and guard suite are removed.
App-local deployment commands may still reference that deleted tooling; verify
those targets before deployment rather than treating the command name as proof
that a deployment path exists.

## Verification

Choose checks for the changed responsibility. Use source-owned tests where
available and finish with `git diff --check`. Do not repeat broad checks after
small edits unless a failure or changed contract warrants them.

Reuse healthy development servers. Direct Nuxt commands do not provide the old
smoke wrapper's port ownership and readiness checks. Do not stop an occupied
port merely to make a new command succeed.

The current CI workflow is `.github/workflows/ci.yml`; it runs package typing,
lint, package builds, and the baseline App build. No shape workflow or script
lifecycle guard remains.
