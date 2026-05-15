---
title: New App Creation
description: Checklist and improvement notes for adding a first-class FireUX app.
updated: 2026-05-15
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
- `tools/vscode-fireux-toolbar/extension.js`
- `projects/tsconfig.json`
- `docs/README.md`
- `docs/runtime-contract.md`
- `docs/console/README.md` when adding `/console/**`
- `docs/guide/app-branding-brief.md` when asking a designer for app assets
- `docs/guide/app-assets-dump.md` when adding or replacing app logos/wordmarks/covers

For a standalone app inside the FireUX ecosystem, inspect `projects/fireux/sproochli`, `projects/fireux/buenohost`, or `projects/fireux/find-my-seo-app`. For a global ecosystem app, inspect `projects/fireux/fireux-app`, `projects/bringli/bringli-app`, or the matching ecosystem app.

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
4. Add the app to the Explorer `FireUX Servers` launcher in `tools/vscode-fireux-toolbar/extension.js`.
5. When a new Firestore database is created for a demo/preflight app, add explicit temporary rules for that database.
6. Run `pnpm sync:dev-workspace` so `package.json`, `.vscode/tasks.json`, and `.vscode/launch.json` are generated from the registry.
7. Check `package.json` has the expected `dev:<key>` script.
8. If Firebase deploy is in scope, keep `firebase.json` aligned with the app id and hosting site.
9. Before any real deploy, confirm the Firestore rules are acceptable for this ship.

Do not hand-edit generated VS Code task/launch files unless the generator itself is wrong.

## Explorer Server Launcher

The Explorer `FireUX Servers` panel is owned by the local VS Code toolbar extension:

```text
tools/vscode-fireux-toolbar/extension.js
```

This list is not generated from `scripts/_lib/app-registry.mjs` yet. When creating a new app, add an entry to the extension's `apps` array with:

```js
{
  key: '<app-key>',
  name: '<Display Name>',
  icon: '$(search)',
  port: 3010,
  commandId: 'fireuxToolbar.startDisplayName',
  taskLabel: 'pnpm dev:<app-key>',
  terminalName: '<Display Name> (3010)',
  pnpmCommand: 'pnpm dev:<app-key> --host',
  tooltip: 'Start <Display Name> dev (port 3010)',
  url: 'http://localhost:3010',
}
```

Keep `key`, `port`, and launch order aligned with `scripts/_lib/app-registry.mjs`. The `taskLabel` should match the generated VS Code task label, and `pnpmCommand` is the fallback terminal command when the task is unavailable.

Do not add a one-off `server:<key>` root script just to make the Explorer server launcher work. Add the app to the toolbar server list instead, then reload the VS Code window or restart the toolbar extension host.

## Firebase And Firestore Registration

FireUX apps have two levels of registration:

- `(default)` database: bootstrap registry, control records, and public mirror records.
- Ecosystem database such as `fireux`: ecosystem runtime, app catalog, and control-plane records.
- Named standalone app database: canonical product/domain records for that app.

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

Do not store day-to-day standalone app domain records in `(default)`.
Do not store day-to-day standalone app domain records in the shared `fireux` database once the app has its own database. Use the shared `fireux` database for the FireUX app catalog; use the app database for product data.

## Firestore Rules For New Databases

When creating a new named Firestore database for a demo or preflight app, manually set explicit temporary rules for that database in Firebase/Firestore so the new app can read and write while the product shape is still moving.

Temporary demo/preflight rule shape:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

This is a setup convenience, not a shipping rule. Mark it as temporary in the deploy notes or task, and make sure it is applied to the app's named database, not only `(default)`.

Current canon: app `firebase.json` files should not carry temporary Firestore rules wiring. Rules are manual Firestore state during preflight until repo-managed rules are intentionally canonized later.

Before a real client, staging, or production ship:

- Replace `allow read, write: if true` with rules scoped to the app's real public, signed-in, admin, and membership surfaces.
- Confirm the deployed rules target the database the app actually uses through `databaseId`.
- Treat open rules as a launch blocker unless the deployment is explicitly a private demo/preflight.

## Firebase Web App Config

Every deployable app must be checked against its Firebase console web app snippet.

Shared ecosystem/project-level values usually live in ecosystem config:

```text
authDomain
projectId
storageBucket
messagingSenderId
default databaseId
ecosystem default apiKey
```

App-level values live in app env/deploy configuration:

```text
APP_DOMAIN
NUXT_FIREBASE_APP_ID
NUXT_FIREBASE_MEASUREMENT_ID
NUXT_FIREBASE_API_KEY
```

`NUXT_FIREBASE_API_KEY` is override-capable because Firebase web apps in one Firebase project can use different API keys.
Do not assume all apps in an ecosystem use the same API key.

Runtime resolution for `apiKey` is:

```text
NUXT_FIREBASE_API_KEY
then ecosystem Firebase apiKey
```

Use the ecosystem default only when that app's Firebase snippet genuinely uses the ecosystem key.
Otherwise set `NUXT_FIREBASE_API_KEY` for the app locally and in the deployed hosting/function environment.

Known FireUX-project example:

```text
fireux-app / tenant use one Firebase API key.
sproochli / buenohost use a different Firebase API key.
```

This is expected and canonical.

Run the app catalog migration after adding registry data:

```sh
node scripts/migrate-fireux-app-catalog.mjs --app <appId> --commit
```

That migration should create/update:

```text
fireux/apps/<appId>
(default)/ecosystem/fireux-fireux.apps
```

If the app has static proof data, add a seed script before pretending the console is real. The seed script should say where it migrates from and where it writes. For example, BuenoHost's first BNB proof migrates from:

```text
projects/fireux/buenohost/app/demo/bnbGuides.ts
```

into:

```text
buenohost/buenohost_sites/{siteId}
buenohost/buenohost_sites/{siteId}/pages/{pageId}
buenohost/buenohost_sites/{siteId}/pages/{pageId}/sections/{sectionId}
buenohost/buenohost_sites/{siteId}/maintainers/{maintainerId}
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

Before deploying, add a human deploy check:

```text
Firestore rules checked for <databaseId>; temporary open rules are acceptable for this ship: yes/no.
```

If useful, run a local server and verify the public HTML/API:

```sh
CI=1 APP_DOMAIN=localhost NUXT_FIREBASE_API_KEY=ci NUXT_FIREBASE_APP_ID=ci pnpm --filter ./projects/<ecosystem>/<app> exec nuxi dev --port <port> --host 127.0.0.1
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
12. Firebase web app API keys are not guaranteed to be ecosystem-wide. New app creation must record `NUXT_FIREBASE_API_KEY` when the Firebase console snippet differs from the ecosystem default.

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
- update `tools/vscode-fireux-toolbar/extension.js` so the app appears in the Explorer `FireUX Servers` launcher
- run `pnpm sync:dev-workspace`
- print the exact fast checks to run

Longer term, move more derived values into `scripts/_lib/app-registry.mjs` so app creation has one obvious control surface.
