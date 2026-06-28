pnpm concept map
Updated: 2026-06-28
Ref: 9a53f2f6e
Role: map, not canon

Purpose:
Explain workspace/package command context.

Vertical links:
- Parent: fireux-mono.md

Horizontal links:
- runtime-package.md
- app-config.md

Workspace:
- The repo uses pnpm workspaces.
- Root package manager is `pnpm@11.9.0`.
- The active repo Node pin is `22.23.1`; package engines require `>=22.23 <23`.
- Workspaces include packages, projects, tools, and test packages.
- Shared pnpm settings live in `pnpm-workspace.yaml`, not `package.json#pnpm`.
- Non-interactive scripts must not trigger implicit installs; `verifyDepsBeforeRun` is disabled.

Common commands:
- `pnpm guard`
- `pnpm gitsave`
- `pnpm --dir <package-or-app> exec tsc --noEmit`
- `pnpm --dir <app> exec nuxi typecheck`
- `pnpm dev:misebox`
- `pnpm dev:go-qr`
- `pnpm dev:la-tap-berne`

Working rule:
- Use focused checks while iterating.
- Run broad checks when package shape, guard-covered structure, or shared runtime seams change.
- Do not repeatedly run expensive checks after every tiny exploratory edit unless the user asks.
