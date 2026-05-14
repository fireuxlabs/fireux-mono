---
title: New App Creation
description: Checklist and improvement notes for adding a first-class FireUX app.
updated: 2026-05-12
---

# New App Creation
Authority: Tier2 (Operational)

This checklist is for adding a new deployable app to the FireUX monorepo. It exists because app creation currently spans project folders, FireUX runtime config, dev tooling, generated editor files, docs, and sometimes Firebase hosting. The goal is to make the next Sproochli-style move feel boring in the best way.

## First Rule

Do not scaffold a standalone Nuxt app until the repo conventions have been inspected.

Start from the real monorepo root and confirm:

```sh
pwd
ls
git status --short --branch
test -f pnpm-workspace.yaml && echo "monorepo ok"
find projects -maxdepth 3 -type d | head -n 50
```

If `projects/`, `packages/`, and `pnpm-workspace.yaml` are missing, stop and switch workspace.

## Inspect Before Creating

Read at least these before adding files:

- `projects/<ecosystem>/<existing-app>/nuxt.config.ts`
- `projects/<ecosystem>/<existing-app>/package.json`
- `projects/<ecosystem>/<existing-app>/app/content/meta.ts`
- `projects/<ecosystem>/<existing-app>/app/pages/**`
- `packages/ecosystem/fireux-<ecosystem>/src/module.ts`
- `scripts/_lib/app-registry.mjs`
- `projects/tsconfig.json`
- `docs/README.md`
- `docs/runtime-contract.md`
- `docs/console/README.md` when adding `/console/**`
- `docs/guide/app-branding-brief.md` when asking a designer for app assets
- `docs/guide/app-assets-dump.md` when adding or replacing app logos/wordmarks/covers

For a standalone app inside the FireUX ecosystem, `projects/fireux/find-my-seo-app` is currently the closest reference. For a global ecosystem app, inspect `projects/fireux/fireux-app`, `projects/bringli/bringli-app`, or the matching ecosystem app.

## Create The App In The Right Layer

Use this placement rule:

- Deployable app shell: `projects/<ecosystem>/<app>`
- Ecosystem module package: `packages/ecosystem/fireux-<ecosystem>`
- Extension/domain module: `packages/extensions/fireux-<domain>`
- Shared runtime behavior: `packages/core/fireux-core`

Do not put a generic new app inside an unrelated domain app. For example, a multilingual place-info app should not live under Misebox or import kitchens, chefs, suppliers, menus, or restaurant models.

## Minimal Files

A thin first-class app usually needs:

- `package.json`
- `nuxt.config.ts`
- `firebase.json` when it has Firebase hosting/function deployment
- `tsconfig.json`
- `app/app.vue`
- `app/app.config.ts`
- `app/error.vue`
- `app/content/meta.ts`
- `app/pages/index.vue`
- any public pages under `app/pages/**`
- any server routes under `server/api/**`
- an app-specific docs note when the product concept is new

Use `defineFireuxConfig(...)` in `nuxt.config.ts`. The important identity fields are:

- `ecosystem`
- `id`
- `name`
- `shortName`
- `databaseId` for standalone apps with their own named Firestore database
- `role`
- `consoleFamilies`
- `modules`
- `meta`
- `seo.siteUrl` when known

App id is stable kebab-case. Display names can change; ids should not drift.

## Registration Checklist

After adding the app folder, wire the repo-level registration points:

1. Add the app to `projects/tsconfig.json`.
2. Add the app to `scripts/_lib/app-registry.mjs`.
3. If the app is standalone, give it its own `databaseId` in both the app config and the registry.
4. Run `pnpm sync:dev-workspace` so `package.json`, `.vscode/tasks.json`, and `.vscode/launch.json` are generated from the registry.
5. Check `package.json` has the expected `dev:<key>` script.
6. If Firebase deploy is in scope, keep `firebase.json` aligned with the app id and hosting site.

Do not hand-edit generated VS Code task/launch files unless the generator itself is wrong.

## Firebase And Firestore Registration

FireUX apps have two levels of registration:

- `(default)` database: bootstrap registry and public mirror records.
- Named operational database: canonical app and domain records.

For a FireUX-owned app, ensure:

```text
(default)/ecosystem/fireux-fireux.apps contains <appId>
fireux/apps/<appId> exists
```

For standalone apps, also ensure the operational database exists and the app points at it:

```text
defineFireuxConfig({ databaseId: '<appId>' })
scripts/_lib/app-registry.mjs databaseId: '<appId>'
Firebase project has Firestore database '<appId>'
```

Do not store day-to-day standalone app domain records in the shared `fireux` database once the app has its own database. Use the shared `fireux` database for the FireUX app catalog; use the app database for product data.

Run the app catalog migration after adding registry data:

```sh
node scripts/migrate-fireux-app-catalog.mjs --app <appId> --commit
```

That migration should create/update:

```text
fireux/apps/<appId>
(default)/ecosystem/fireux-fireux.apps
```

If the app has static proof data, add a seed script before pretending the console is real. The seed script should say where it migrates from and where it writes. For example, Sproochli's first BNB proof migrates from:

```text
projects/fireux/sproochli/app/content/bnbGuides.ts
```

into:

```text
sproochli/sproochli_sites/{siteId}
sproochli/sproochli_sites/{siteId}/pages/{pageId}
sproochli/sproochli_sites/{siteId}/pages/{pageId}/sections/{sectionId}
sproochli/sproochli_sites/{siteId}/maintainers/{maintainerId}
```

## App Media And Storage

Every app should have repo-local public assets and Storage-backed canonical media.
See `docs/guide/app-assets-dump.md` for the designer handoff and drop-in workflow.

Repo-local source files:

```text
projects/<ecosystem>/<app>/public/img/app/thumbnail.png
projects/<ecosystem>/<app>/public/img/app/logo.png
projects/<ecosystem>/<app>/public/img/app/wordmark-light.png
projects/<ecosystem>/<app>/public/img/app/wordmark-dark.png
projects/<ecosystem>/<app>/public/img/app/cover.png
```

Canonical Storage objects:

```text
apps/<appId>/media/thumbnail
apps/<appId>/media/logo
apps/<appId>/media/wordmark-light
apps/<appId>/media/wordmark-dark
apps/<appId>/media/cover
```

Canonical Firestore fields live under `apps/<appId>.media`:

```text
media.thumbnail_url
media.logo_url
media.wordmark_light_url
media.wordmark_dark_url
media.cover_url
```

Use:

```sh
node scripts/audit-app-media.mjs --ecosystem <ecosystemId>
node scripts/sync-app-media-from-public.mjs --ecosystem <ecosystemId> --app <appId> --apply
```

Do not write app image URLs only to legacy top-level fields such as `thumbnail_url`.

## Routes And Console

Public pages live in `app/pages/**` and should render meaningful HTML server-side for crawlers, search, and reader tools.

Console routes should follow `docs/console/README.md`:

- `/console` is the shared console entry.
- `/console/<domain>` is the family hub.
- Visible families come from `consoleFamilies`, not route scanning.

If a console placeholder is intentionally light, keep it honest: show the domain name, rough entities, draft/published state, and what is coming next. Avoid creating fake editor complexity.

Apps with console routes should keep `app/app.vue` canonical and thin:

```vue
<template>
  <AppShell />
</template>
```

Put app-specific behavior in pages, layouts, content, or extension modules, not in `app.vue`.

## Server Routes

For public JSON endpoints:

- Put routes under `server/api/**`.
- Use shared sample/resolver functions where possible so public HTML and JSON agree.
- Set explicit headers when crawler or integration behavior matters.
- Prefer plain anchors for API links in Vue templates; `NuxtLink` is for app pages and can warn when pointed at API routes.

Example headers:

```ts
setResponseHeaders(event, {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=60, s-maxage=300',
})
```

## Fast Checks

Keep early checks scoped:

```sh
node --check scripts/_lib/app-registry.mjs
pnpm sync:dev-workspace:check
CI=1 pnpm --filter ./projects/<ecosystem>/<app> exec nuxi prepare
git diff --check
```

If useful, run a local server and verify the public HTML/API:

```sh
CI=1 APP_DOMAIN=localhost NUXT_FIREBASE_APP_ID=ci pnpm --filter ./projects/<ecosystem>/<app> exec nuxi dev --port <port> --host 127.0.0.1
curl -sS -I 'http://127.0.0.1:<port>/'
```

Avoid full workspace typecheck unless the change touches shared packages or the user explicitly asks for it.

## Friction Found While Creating Sproochli

These are improvement notes from adding `projects/fireux/sproochli`:

1. There is no single app creation command for standalone FireUX apps. `scripts/create-ecosystem.mjs` exists, but a thin `create:app` generator would save repeated manual wiring.
2. App registration is split across the app folder, `projects/tsconfig.json`, `scripts/_lib/app-registry.mjs`, and generated dev workspace files. The registry is the best source of truth, but the new-app path should make that explicit.
3. `consoleFamilies` accepts arbitrary strings, but route segment behavior is partly centralized in `consoleRoutes.ts`. A new family such as `info` works through the fallback path, but the intended pattern should be clearer.
4. Dev server verification may fail in sandboxed tools when binding localhost. Document the approved command shape or let `dev-app-with-smoke.mjs` support a cheap `--port` override for one-off checks.
5. App-level `nuxi prepare` creates ignored `.nuxt`, `.data`, and cache folders. That is fine, but new app creators should expect it and avoid treating those folders as source.
6. API links in pages should use `<a href>` instead of `NuxtLink`; otherwise Vue Router may warn about unmatched API paths during SSR.
7. The canonical reference app for “standalone inside FireUX” should be named in docs. Right now that knowledge is discoverable only by inspection.
8. Firebase hosting config is still copy-forward. A small helper that derives `codebase`, `entryPoint`, function region, and site defaults from app registry data would reduce mistakes.
9. Standalone app creation must create the named Firestore database or the runtime config will correctly point at a database that does not exist yet.
10. App media scripts must stay aligned with the nested `media.*` canon and include the `cover` object, not only logo/wordmarks.
11. Static proof content should get a seed script immediately so the console and database have a visible migration source.

## Recommended Tooling Improvements

Add a `pnpm create:app` command that asks for:

- app key
- app id
- display name
- ecosystem
- role: `global`, `tenant`, or `standalone`
- package name
- port
- console families
- Firebase hosting site/function names
- whether to create sample public page, console placeholder, JSON endpoint, and docs stub

The generator should:

- create the app folder from an existing template
- write `defineFireuxConfig(...)`
- add `app/content/meta.ts`
- add minimal pages
- add `server/api/fireux-console.get.ts` only if still needed for that app class
- update `projects/tsconfig.json`
- update `scripts/_lib/app-registry.mjs`
- run `pnpm sync:dev-workspace`
- print the exact fast checks to run

Longer term, move more derived values into `scripts/_lib/app-registry.mjs` so app creation has one obvious control surface.
