# App Alignment Report (2025-09-05)

This report compares Nuxt apps under `projects/**` and proposes a minimal example app `fireux-tennant` to validate alignment.

## Apps discovered

- FireUX: `projects/fireux/fireux-app`
- Cleanbox: `projects/cleanbox/cleanbox-app`
- Richies (Cleanbox profile): `projects/cleanbox/richies-reinigung`
- Misebox: `projects/misebox/misebox-app`
- Niederhorn (Misebox profile): `projects/misebox/niederhorn`
- Proposed example: `projects/fireux/tennant` (new, simple test tenant)

## Shared shape (target)

- srcDir: `app`
- Module factory: `createFireuxConfig({ modules: [tenantModules], ecosystem, appName, appShortName, primaryColor, neutralColor, vuefire, pwa })`
- Runtime config: minimal public exposure via `createFireuxConfig`.
- Compatibility date: `'2025-09-01'` across apps.
- Composables auto-import only; models imported explicitly via aliases.

## Nuxt config comparison

- FireUX
  - modules: `['fireux-fireux']`
  - ecosystem: `fireux`
  - colors: primary `#EAB308` (yellow)
  - vuefire auth: client sessionCookie false
  - compatibility: 2025-09-01
- Cleanbox
  - modules: `['fireux-cleanbox', 'fireux-jobs']`
  - ecosystem: `cleanbox`
  - colors: primary `#000000`
  - vuefire auth: client
  - compatibility: 2025-09-01
- Richies
  - modules: `['fireux-cleanbox', 'fireux-jobs']`
  - ecosystem: `cleanbox`
  - colors: primary `#000000`
  - vuefire auth: client
  - compatibility: 2025-09-01
- Misebox
  - modules: `['fireux-misebox']`
  - ecosystem: `misebox`
  - colors: primary `#8B5CF6`
  - vuefire auth: client
  - compatibility: 2025-09-01
- Niederhorn
  - modules: `['fireux-misebox']`
  - ecosystem: `misebox`
  - colors: primary `#0EA5E9`
  - vuefire auth: client
  - compatibility: 2025-09-01
- FireUX Tennant (example)
  - modules: `['fireux-fireux']`
  - ecosystem: `fireux`
  - colors: primary `#3B82F6`
  - vuefire auth: client
  - compatibility: 2025-09-01

## Effects component ownership

- Core contains `packages/core/fireux-core/src/runtime/components/effects/LandingEffect.vue`.
- Generated `.nuxt/components.d.ts` shows the component is auto-registered into apps; however, you stated effects should be owned per app/tenant.
- Recommendation:
  1. Move `LandingEffect.vue` out of core into each tenant that needs it, or into each app under `app/components/effects/LandingEffect.vue`.
  2. Keep composable `useLandingEffect` in core (safe to auto-import) but make the visual component app-local.
  3. Update core to stop auto-registering that component if moved.

## Alignments to apply

- Keep `createFireuxConfig` ownership of public runtimeConfig keys; stop using `useAppConfig` in server contexts. Prefer `useRuntimeConfig()`.
- Ensure each app defines its own `app/app.config.ts` with UI colors and can override visual effects locally.
- Confirm no app imports `#app` or `#build/*` in server runtime code.

## Proposed fireux-tennant scaffold

- Path: `projects/fireux/tennant`
- Files:
  - `package.json` (Nuxt 4, depends on `fireux-core`)
  - `tsconfig.json` (extends workspace, Nuxt types)
  - `nuxt.config.ts` (uses `createFireuxConfig` with `fireux-fireux` tenant)
  - `app/app.vue` basic page
  - Add `app/app.config.ts` if you want per-app UI color overrides.

## Next steps

- Decide: remove `LandingEffect.vue` from core; recreate per app/tenant.
- If approved, I’ll migrate the file and adjust component auto-registration, then rerun dev for each app to validate.
- Optionally add a script to verify all apps share the same `compatibilityDate` and `imports.dirs` shape.
