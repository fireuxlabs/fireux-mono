# Granite Bootstrap Checklist

Scope: Phase 0 wiring for Granite ecosystem and app shell.

## 1) Packages and app
- Ensure these paths exist:
  - `packages/ecosystem/fireux-granite`
  - `packages/extensions/fireux-properties`
  - `packages/extensions/fireux-compliance`
  - `packages/extensions/fireux-documents`
  - `packages/extensions/fireux-tasks`
  - `projects/granite/granite-app`

## 2) Runtime/app wiring
- Granite app must use:
  - `defineFireuxConfig({ ecosystem: 'granite', id: 'granite-app', role: 'global', ... })`
- App must include modules:
  - `fireux-properties`
  - `fireux-compliance`
  - `fireux-documents`
  - `fireux-tasks`

## 3) TS project references
Update references:
- `packages/extensions/tsconfig.json`
- `packages/tsconfig.json`
- `projects/tsconfig.json`

Add Granite group base config:
- `projects/granite/tsconfig.app.base.json`

## 4) Path aliases
Update `tsconfig.base.json` with:
- Module aliases:
  - `fireux-properties` / `@fireux-properties/*`
  - `fireux-compliance` / `@fireux-compliance/*`
  - `fireux-documents` / `@fireux-documents/*`
  - `fireux-tasks` / `@fireux-tasks/*`
- App aliases include Granite app paths in:
  - `~/*`
  - `@/*`
  - `~~/*`
  - `@@/*`

## 5) Dev script
Update root `package.json` scripts:
- `dev:granite` -> `pnpm --filter ./projects/granite/granite-app dev`

## 6) Runtime contract checks
- `/portfolios` exists and is the only runtime selector surface.
- `/console/portfolio*` routes block with explicit CTA when runtime is unset.
- No auto-selection fallback.

## 6.5) Required app env vars
For `projects/granite/granite-app`, provide:
- `APP_DOMAIN` (for example `granite-os.web.app`)
- `NUXT_FIREBASE_APP_ID` (from Firebase web app config)
- `NUXT_FIREBASE_MEASUREMENT_ID` (optional but recommended for analytics)

## 7) Suggested bootstrap verification commands
- `pnpm --filter ./projects/granite/granite-app dev`
- `pnpm -r --filter ./packages/extensions/fireux-properties --filter ./packages/extensions/fireux-compliance --filter ./packages/extensions/fireux-documents --filter ./packages/extensions/fireux-tasks exec tsc --noEmit`

## 8) pnpm filters quick list
- `pnpm --filter ./packages/ecosystem/fireux-granite dev`
- `pnpm --filter ./projects/granite/granite-app dev`
- `pnpm --filter ./packages/extensions/fireux-properties dev`
- `pnpm --filter ./packages/extensions/fireux-compliance dev`
- `pnpm --filter ./packages/extensions/fireux-documents dev`
- `pnpm --filter ./packages/extensions/fireux-tasks dev`
