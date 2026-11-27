# Alpha 19 Codex — Native Nuxt layer root audit

For FireUX — Architecture. Replies to Alpha 17 New and Alpha 18 Old. The durable sibling checkout `fireux-app-architecture-reset` is clean at `02752add05f2ff4887b097817b03119373cd5d0c` on `codex/app-architecture-reset`. Both handoffs match the inspected checkpoint and layer shape. Git corroborates the module ancestry Old identified as plausible. It supplies no recorded requirement to retain the extra directory. Holzworm uses the same endpoint with a direct layout fetch. Blank and Misebox use Core's App Detail.

## Recommendation

Make the existing `packages/core/fireux-core/` package root the Nuxt layer root, retaining `extends: ['fireux-core/layer']`. Moving the configuration and its three sibling trees together preserves their relationship. Keep the enclosing package category and name. The category is repository organization, matched by `pnpm-workspace.yaml:2`, with package-root tooling and consumer references. There is no demonstrated benefit to relocating or renaming it.

Current complete tracked tree (36 files). The proposed tree has the same package files and all the same descendants, with the four children of `src/` placed immediately beside the manifest and README.

```text
packages/core/fireux-core/
├── README.md
├── package.json
└── src/
    ├── nuxt.config.ts
    ├── app/components/
    │   ├── App/
    │   │   ├── Collection.vue
    │   │   ├── Detail.vue
    │   │   └── Detail/Card.vue
    │   ├── AppUser/Detail.vue
    │   ├── Ecosystem/Detail.vue
    │   └── User/Detail.vue
    ├── server/
    │   ├── api/
    │   │   ├── app.get.ts
    │   │   ├── app-users/{count.get.ts,me.get.ts,me/join.post.ts}
    │   │   ├── apps/{[id].get.ts,index.get.ts}
    │   │   ├── ecosystem.get.ts
    │   │   └── users/{me.get.ts,me.post.ts}
    │   ├── app/{collection/read.ts,detail/read.ts,read-app-document.ts}
    │   ├── app-user/{admin/count.ts,detail/read.ts,join/create.ts}
    │   ├── ecosystem/detail/read.ts
    │   ├── user/{create/provision.ts,detail/read.ts}
    │   └── utils/{firebase-admin.ts,firestore-document-id.ts,require-firebase-user.ts}
    └── shared/
        ├── app/app.model.ts
        ├── app-user/app-user.model.ts
        ├── ecosystem/ecosystem.model.ts
        ├── fireux-stamps.ts
        └── user/{user-consent.ts,user.model.ts}
```

```text
packages/core/fireux-core/   (proposed)
├── README.md
├── package.json
├── nuxt.config.ts
├── app/      (same subtree)
├── server/   (same subtree)
└── shared/   (same subtree)
```

## Native vs repository conventions

- Nuxt 4 Apps place configuration at the root, Vue code under `app/`, Nitro code under `server/`, and cross-context code under `shared/`. Those feature directories are optional. A layer is a partial App rooted at its own config and can contribute only the features it uses. A sibling package is explicitly extended. An App's local `layers/` is a different native auto-registration mechanism. See [directory structure](https://nuxt.com/docs/4.x/directory-structure), [authoring layers](https://nuxt.com/docs/4.x/guide/going-further/layers) and [layer usage](https://nuxt.com/docs/4.x/getting-started/layers).
- A Nuxt module is a setup entry selected by `modules` or discovered from local `modules/`. `src/module.ts` and `playground/` are starter organization. Packaged entry points resolve to the module definition and modules register runtime additions via Nuxt Kit as needed. Published layer packages ship the layer config and its tree. Nuxt's npm example points `main` at the config and uses the bare package in `extends`. With an existing exports map, expose its `.` entry explicitly if adopting that selector. A package providing both can expose a module at `.` and its config at `./layer`, or use two explicit entries. Each is consumed in the appropriate Nuxt option. No separate package is required. The historical sibling `packages/ecosystem/fireux-fireux/package.json:7–11` illustrates the distinction. See [module structure](https://nuxt.com/docs/4.x/guide/modules/module-anatomy), [module starter](https://nuxt.com/docs/4.x/guide/modules/getting-started), [local modules](https://nuxt.com/docs/4.x/directory-structure/modules), and [module registration recipes](https://nuxt.com/docs/4.x/guide/modules/recipes-basics).
- Core's tracked `src/nuxt.config.ts:1–19` declares runtime defaults. It provides no directory overrides, injected modules, or custom aliases. `app/components/` is native component discovery. The nested App, AppUser, Ecosystem and User folders supply FireUX naming, with Nuxt deriving component names from the relative path. `server/api/` is native route discovery, including `[id]`, `index` and HTTP suffixes. `server/utils/` participates in Nitro's utility imports, although Core explicitly imports these helpers. The entity folders `server/app`, `app-user`, `ecosystem`, `user` and their operation subfolders are ordinary explicitly imported FireUX organization. `shared/` is native and Core's entity folders and stamps use explicit imports. Nuxt conventionally auto-imports `shared/utils` and `shared/types`, neither of which exists here. See [components](https://nuxt.com/docs/4.x/directory-structure/app/components), [server](https://nuxt.com/docs/4.x/directory-structure/server) and [shared](https://nuxt.com/docs/4.x/directory-structure/shared).

## Source and verification

Git history shows the older Core exported `./src/module.ts` at the package root and `./src/runtime/nuxt.config.ts` as `./layer`. `a33671560` established the native layer at `src/nuxt.config.ts` while the old module still existed. `0d602225c` removed the module entry, builder and prepack scripts, retaining `./layer` and simplifying the pack allowlist to `["src"]`. Keeping it today would retain familiar paths or leave room for other package files. Neither justifies an extra root for this layer-only package.

Installed Blank uses Nuxt/Kit 4.7.0 and Nitro 2.14.0. Misebox and Holzworm use Nuxt/Kit 4.6.1 and Nitro 2.13.4. All use c12 3.3.4. Installed c12 `dist/index.mjs:301–318,334–341` resolves package exports to a config file and takes its directory as the layer cwd. Nuxt Kit `dist/index.mjs` `loadNuxtConfig` (4.6.1 line 792, 4.7.0 line 875) and `getLayerDirectories` (Kit plugins chunk lines 459/471) normalize the directories. `@nuxt/nitro-server/dist/index.mjs:913` (4.6.1) and `:1691` (4.7.0) pass each layer's server directory into Nitro's `scanDirs`. Nitro `dist/core/index.mjs` `scanHandlers` (2.13.4 line 884, 2.14.0 line 932) scans API, routes and middleware. Component discovery in Nuxt `dist/index.mjs` uses the layer's component directories (4.6.1 lines 6001–6013, 4.7.0 lines 8879–8896).

Read-only Kit resolution of the three actual configs found exactly one Core layer each, with the current config and expected sibling directories, App IDs, private scopes, and fail-closed Firebase defaults. The installed Nitro scan found the same nine routes for each: GET App, Ecosystem, peer list/detail, User self, AppUser self/count, plus POST User self and AppUser join. No server boot, Firebase access, production build, or moved-layout validation was performed. The package root proposal follows from the resolver and directory relationship. `git diff --check` passed.

## Export changes and consumers

In `packages/core/fireux-core/package.json:6–16` map `./layer` to `./nuxt.config.ts`, `./app` to `./shared/app/app.model.ts`, `./user-consent` to `./shared/user/user-consent.ts`, `./app/detail-card` to `./app/components/App/Detail/Card.vue`, and `./server/app/read-app-document` to `./server/app/read-app-document.ts`. Keep `./package.json`. Change `files` to the config and the three native trees. Keep Core private and preserve dependencies. The same relative imports still work when the three trees move together. No new Nuxt alias, `srcDir`, `serverDir` or layer name is needed.

Bare `fireux-core` currently has no root export and fails Node resolution. Exposing `.` as the config would make bare package `extends` viable, but changing consumers is a separate choice. It would also give the old module specifier a new meaning in layer contexts. A relative filesystem path is supported but couples the Apps to repository layout. Keep the existing native export directly pointing to the config, with no shim or additional entry.

- Active config consumers at line 2: `projects/fireux/fireux-blank/nuxt.config.ts`, `projects/misebox/misebox-app/nuxt.config.ts`, and `projects/fireux/holzworm/nuxt.config.ts`. Misebox's `app/components/MiseboxAuth.client.vue:64` also imports consent. Holzworm's `app/layouts/landing.vue:15` fetches self directly. No call-site change required.
- Historical direct layer references remain in 15 other project configs across Bringli, Buenohost, FireUX, Granite, Misebox, Sharer and Slap, in `packages/ecosystem/fireux-{fireux,werkbox}/src/runtime/nuxt.config.ts`, in `packages/extensions/fireux-app/src/defaults.ts:11` and its tests, and in `projects/fireux/fireux-app/shared/ignition-preview.ts:189` as generated config. Preserving the selectors avoids adding migration work. Docs extension imports the card; the platform App imports the App type, projection reader and manifest; Workspace and Ecosystem extensions import App model types. Those retained entry names also need no call-site edits.
- `tsconfig.base.json:38–40` still points into retired module/runtime and a stale wildcard. The three active Apps use generated Nuxt TypeScript references. Resolve active package imports through the package exports and review any real base-tsconfig consumer before touching those historical mappings. Do not replace the wildcard with a public filesystem bypass. Current Core README and native checkpoint links need new paths when the move happens. Review other hard-coded references for present paths; pre-existing release CLI, asset utilities, and test references into retired `src/config`, `src/runtime`, `src/test` or `build` remain separate issues.

## Smallest sequence after approval

1. Move the config and the three trees together and retarget the five manifest paths and file allowlist in the same change. Update current documentation links and any demonstrated hard-coded live path.
2. Verify workspace and Blank's separate install resolution, packed contents in a temporary directory, generated component and route types, the same nine handlers, and typechecks/builds in all three Apps. Compare signed-out SSR and hydration, check the existing emulator peer and protected identity boundaries, and avoid live infrastructure. Keep any pre-existing release tooling blockers visible.
3. Bring internal server ownership and naming back for discussion after the layer-root decision. This audit recommends only the physical root move and export targets. No reset implementation or local documentation changed.
