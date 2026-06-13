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
  modules: ['fireux-products', 'fireux-blogs'],
})
```

Use `defineNuxtConfig({ ...fireuxConfig, ...localOverrides })` only when the app needs a real Nuxt override such as app-local CSS, page filtering, or Vite dev-server options.

Do not wrap a plain `defineFireuxConfig(...)` result in `defineNuxtConfig(...)`.

## Core Fields

- `ecosystem`: the parent ecosystem key.
- `id`: the app identity key.
- `name`: display name.
- `shortName`: compact display name.
- `role`: `global`, `tenant`, or `standalone`.
- `membership`: optional `open` or `restricted` app membership policy.
- `databaseId`: app-owned Firestore database for standalone apps.
- `contactEmail`: public support/contact email when needed.
- `modules`: installed FireUX package capabilities.
- `consoles`: console workspaces exposed by the app.
- `consoleConfig`: optional per-console behavior, such as whether this app may create new console targets or pin existing targets.
- `domains`: public/admin root domains the app consumes.
- `profiles`: profile identities the app consumes.
- `navHiddenKeys`: app-local public/dashboard nav suppressions.
- `seo`: app-level public SEO config such as `siteUrl`, `staticPaths`, and `noindexPaths`.
- `designPack` / `designPacks`: app-level or surface-level design tokens.

## Capability Meaning

`modules` installs package capability.

`consoles` exposes selected console workspaces.

`consoleConfig` tunes exposed console workspaces. By default, tenant apps use existing console targets and do not show Create, while global and standalone apps may create targets unless disabled. Use `targetIds` when an app should open specific existing console targets.

`domains` opts the app into root public/admin domain surfaces supplied by installed packages.

`profiles` opts the app into profile identity surfaces supplied by installed packages.

`membership` controls ordinary sign-in membership. Tenant apps default to `restricted`, so sign-in creates core identity only and private dashboard/console routes require App Admin approval. Global and standalone apps default to `open`.

These are not interchangeable. Installing a module must not automatically expose every route from that module.

## Local Overrides

Keep local overrides rare and explicit:

```ts
const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  role: 'global',
  modules: ['fireux-products', 'fireux-blogs'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  css: [...(fireuxConfig.css ?? []), '@/assets/styles/main.css'],
})
```

Valid local override examples:

- app-local CSS
- route filtering for a package that currently exposes too much
- Vite development server options
- narrow Nuxt hooks that cannot yet live in a shared package

Invalid local override examples:

- no-op `defineNuxtConfig({ ...fireuxConfig })`
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
