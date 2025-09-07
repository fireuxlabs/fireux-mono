# App diff report (impound error triage)

Goal: Compare app configs between Misebox, Niederhorn, Cleanbox, Richies, and FireUX to find differences that might import app aliases on the server and trigger impound.

## Summary of behavior
- FAIL (impound): Misebox (projects/misebox/misebox-app)
- FAIL (impound): Niederhorn (projects/misebox/niederhorn)
- FAIL (impound): Cleanbox (projects/cleanbox/cleanbox-app)
- FAIL (impound): Richies (projects/cleanbox/richies-reinigung)
- PASS: FireUX (projects/fireux/fireux-app)

## Key findings so far
- All apps use createFireuxConfig() and share similar module stacks.
- Misebox/Niederhorn specify the tenant module `fireux-misebox` (extensions may add plugins/layouts).
- FireUX uses the tenant module `fireux-fireux` and did NOT error.
- Niederhorn has `ssr: false` temporarily, but error still persists at Nitro build time.

## nuxt.config.ts comparison
- Misebox:
  - modules: ['fireux-misebox']
  - ecosystem: 'misebox'
  - vuefire.auth.sessionCookie: false
  - compatibilityDate: '2025-09-01'
- Niederhorn:
  - Same as Misebox + `ssr:false`, custom nitro preset passthrough, Vite define guards
- FireUX:
  - modules: ['fireux-fireux']
  - ecosystem: 'fireux'
  - no ssr override (defaults), compatibilityDate: '2025-09-01'
- Cleanbox:
  - modules: ['fireux-cleanbox', 'fireux-jobs']
  - ecosystem: 'cleanbox'
- Richies:
  - same as Cleanbox

Hypothesis: The difference lies in code bundled by the tenant module `fireux-misebox` (or one of its transitive dependencies) that causes Nuxt to include `nuxt/dist/app/nuxt.js`, which imports `#build/nuxt.config.mjs` during Nitro build.

## app.config.ts comparison
- Misebox: primary 'green', neutral 'slate'
- Niederhorn: primary 'violet', neutral 'zinc'
- Cleanbox: primary 'blue', neutral 'slate'
- Richies: primary 'blue', neutral 'slate'
- FireUX: missing file in repo snapshot; likely similar and benign.

These values are benign; app.config.ts by itself is allowed client-side, but app-only usage in server code (direct or transitive) would trigger the error.

## Module wiring
- We standardized all module.ts (core/tenants/extensions) with server registration commented out.
- Therefore, active server handlers are not the cause.

## Next steps
1) Targeted search:
   - Search the `fireux-misebox` package for any imports of '#app', 'nuxt/app', '#imports', 'useAppConfig', or referencing `~/.nuxt` types in non-client-only files (plugins without .client, server composables, utilities).
2) Toggle isolation (fast bisection):
  - Temporarily comment out `configureLayouts` and/or `configurePages` in the tenant modules (misebox, cleanbox). If error disappears, we know a layout/page (SSR) path is at fault.
  - If still failing, temporarily comment out `configureComposables` (rare, but possible if a composable is imported server-side).
3) If nothing obvious, add a dev-only logging hook to trace when `nuxt/dist/app/nuxt.js` is pulled during Nitro bundle.

If you want, I can kick off dev for Cleanbox/Richies and expand this report with PASS/FAIL for each and the first offender stack.
