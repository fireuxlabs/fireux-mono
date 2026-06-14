# nuxt.config.ts

Authority: Operational
Updated: 2026-05-25
Scope: `projects/**/nuxt.config.ts`

Use this guide when creating or changing a FireUX app `nuxt.config.ts`.

Tier1 authority lives in `docs/runtime-contract.md` under the FireUX App Config Contract. This file explains the working app-spine shape.

## Purpose

Every FireUX app config should answer one question:

```text
What app is this, and which shared FireUX capabilities does it consume?
```

It should not become a scratchpad for cross-app links, one-off runtime state, Firebase snippets, secrets, or local feature systems.

## Standard Shape

Most apps should export `defineFireuxConfig(...)` directly:

```ts
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'example-app',
  name: 'Example App',
  shortName: 'Example',
  role: 'standalone',
})
```

Use `withFireuxNuxtConfig(fireuxConfig, localOverrides)` only when the app needs a real Nuxt override such as app-local CSS, page filtering, runtime provider config, or Vite dev-server options.

Do not wrap a plain `defineFireuxConfig(...)` result in `defineNuxtConfig(...)`.

## Core Fields

- `ecosystem`: the parent ecosystem key.
- `id`: the app identity key.
- `name`: display name.
- `shortName`: compact display name.
- `role`: `global`, `tenant`, or `standalone`.
- `databaseId`: app-owned Firestore database for standalone apps.
- `contactEmail`: public support/contact email when needed.
- `modules`: extra FireUX package capabilities or custom module options.
- `consoles`: console workspaces exposed by the app.
- `consoleConfig`: optional per-console behavior, such as whether this app may create new console targets or pin existing targets.
- `domains`: public/admin root domains the app consumes.
- `profiles`: profile identities the app consumes.
- `navHiddenKeys`: app-local public/dashboard nav suppressions.
- `seo`: app-level public SEO config such as `staticPaths`, `noindexPaths`, and rare canonical URL overrides.
- `designPack` / `designPacks`: app-level or surface-level design tokens.

## Capability Meaning

`fireux-products` and `fireux-blogs` are default app modules.

`modules` installs extra package capability, or overrides a default module with custom options.

`consoles` exposes selected console workspaces.

`consoleConfig` tunes exposed console workspaces. By default, tenant apps use existing console targets and do not show Create, while global and standalone apps may create targets unless disabled. Use `targetIds` when an app should open specific existing console targets.

`domains` opts the app into root public/admin domain surfaces supplied by installed packages.

`profiles` opts the app into profile identity surfaces supplied by installed packages.

Sign-in creates ordinary app membership by default. App membership does not grant admin authority or console operation authority.

These are not interchangeable. Installing a module must not automatically expose every route from that module.

## App Domain

`APP_DOMAIN` is the normal deployed app host.

FireUX derives the runtime canonical `siteUrl` from `APP_DOMAIN`, adding `https://` for normal domains and `http://` for localhost values.

Do not add `seo.siteUrl` only to repeat `APP_DOMAIN`. Use `seo.siteUrl` only when the canonical SEO origin must intentionally differ from the app domain.

## Local Overrides

Keep local overrides rare and explicit:

```ts
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  role: 'global',
  modules: ['fireux-kitchens'],
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
})
```

Valid local override examples:

- app-local CSS
- route filtering for a package that currently exposes too much
- runtime provider config for a local development tool provider
- Vite development server options
- narrow Nuxt hooks that cannot yet live in a shared package

Invalid local override examples:

- no-op `defineNuxtConfig({ ...fireuxConfig })`
- hand-merged `fireuxConfig.css`, `fireuxConfig.hooks`, `fireuxConfig.runtimeConfig`, or `fireuxConfig.vite`
- sibling app URL directories
- duplicated Firebase web snippets
- direct secrets or API keys
- fallback chains for app identity
- app-local replacements for `modules`, `consoles`, `domains`, or `profiles`

## Cross-App Links

Do not store sibling app base URLs in one app's `runtimeConfig.public`.

If multiple apps need to link to one another, use a shared FireUX app-directory or registry helper. Until that exists for a specific surface, keep links local to the page/component that needs them rather than growing `nuxt.config.ts`.

## Firebase

Do not paste Firebase web snippets into `nuxt.config.ts`.

Firebase web identity belongs in environment/deploy config:

- `APP_DOMAIN`
- `NUXT_FIREBASE_APP_ID`
- `NUXT_FIREBASE_MEASUREMENT_ID`
- optional `NUXT_FIREBASE_API_KEY`

The FireUX runtime resolves those into app runtime config.

## Short Rule

Keep `nuxt.config.ts` as the app spine:

```text
identity + capability declarations + rare Nuxt override
```

Anything else probably belongs in a package, a page, a composable, a server route, deploy config, or an app registry.
