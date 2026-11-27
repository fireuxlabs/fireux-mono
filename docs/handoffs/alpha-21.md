# Alpha 21 Codex — Core package exports and native discovery audit

**Audit and proposal for FireUX — Architecture. Implementation approval is a separate decision.**

The durable sibling reset worktree at `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-app-architecture-reset` matched Alpha 20. Branch `codex/app-architecture-reset`, HEAD `0c1738d259e8b0a596f82dcd610fc50976cb1914`, clean status and clean diff check. No discrepancy in Core's package-root structure or export list. No reset files or canon were modified. This is a separate mailbox commit.

## Findings by export

| Export | Exact dependency and effect of removal | Proposal |
| --- | --- | --- |
| `./layer` | Native Nuxt assembly. Removing it breaks the named layer in all 18 direct App configs below, two historical ecosystem layers, default assembly and generated templates. | **KEEP** |
| `./app` | Five tracked type imports: `packages/extensions/fireux-ecosystem/src/runtime/components/landing/AppCollection.vue:130` and `packages/extensions/fireux-workspace/src/runtime/workspace/utils/policy.ts:1`; platform `projects/fireux/fireux-app/app/components/App/Detail/{Header.vue:25,Index.vue:21}` and `projects/fireux/fireux-app/server/utils/apps.ts:1`. All are outside the verified reset spine. The canonical model and AppRole have concrete cross-package consumers, including pure Workspace policy. This file also exposes the model's associated constants, with no tracked bare import of the constants. Removing the entry breaks type resolution and pressures consumers to duplicate the contract or depend on Core's filesystem. | **KEEP** for documented workspace consumption. Review stored model vs public DTO during the owning contract work. |
| `./user-consent` | Active `projects/misebox/misebox-app/app/components/MiseboxAuth.client.vue:64` uses the value in the displayed consent and POST payload (229–230). Core's `server/user/create/provision.ts:3` imports the same constant relatively, to validate the submitted versions. Native discovery does not scan this file in `shared/user/`. Removal breaks compilation while the explicit import exists. | **KEEP**. A small, stable shared value with a current cross-package consumer. |
| `./app/detail-card` | The only tracked bare import and printed example are in `packages/extensions/fireux-docs/src/runtime/pages/docs/components/app-detail-card.vue:21,36`, linked from its Docs components index at line 18. The historical platform App includes the Docs layer at `projects/fireux/fireux-app/nuxt.config.ts:67`. Core's active `app/components/App/Detail.vue:15` imports the card relatively. Nuxt already generated `AppDetailCard` from Core in all three active Apps. Removing the subpath breaks the historical page and printed snippet until they migrate. No separate Vue/library consumer was evidenced. | **REPLACE** the bare component import and snippet with native `<AppDetailCard>` in an App extending Core. Use `#components` only where script needs a component value. Remove the export in the same approved change, after checking the actual Docs host. |
| `./server/app/read-app-document` | One tracked bare import in `projects/fireux/fireux-app/server/utils/apps.ts:2`. Its platform-owning code selects named targets and reuses the pure App validation/projection for collection (18) and detail (76). Collection feeds `server/utils/default-directory.ts:3,9` and `server/routes/sitemaps/directory.xml.get.ts:12,19`. Core's detail and collection use relative imports. Removing the subpath breaks the historical platform reader. Core's HTTP endpoints have a different authority and target scope. The platform cross-database read should not be redirected through these endpoints or cause broader access in Core. | **KEEP** provisionally as an explicit server-side contract for this consumer. Revisit its ownership and name in the server discussion. |
| `./package.json` | Only bare import is `projects/fireux/fireux-app/app/utils/package-library.ts:5` and map entry 17, used by `app/pages/packages/index.vue:4` and `app/pages/packages/[package]/index.vue:11`. That library derives package names from the App dependency manifest and uses only optional descriptions from other manifests. Core has no description. Removing the export alone breaks resolution. Removing the redundant import and map entry leaves Core's row and undefined description intact. Release and IDE files using physical paths do not use this export. | **REMOVE** with the linked platform consumer edit. |

The audit found no verified external package consumer. Core is private; the historical Docs snippet is intended for public reading, and any untracked downstream reliance is unknown. Historical here means outside the verified three-App reset graph. It does not establish whether a historical service is deployed or a feature is still needed. The platform still uses historical assembly and retired Core imports (for example the package library's `fireux-core/runtime/app/components/Packages.vue`). A full platform build and Docs-host result are gaps. Treat the two removals below as conditional on checking the owning consumers, rather than masking existing issues with new aliases.

### All direct layer consumers

Active: `projects/fireux/fireux-blank/nuxt.config.ts:2`, `projects/misebox/misebox-app/nuxt.config.ts:2`, `projects/fireux/holzworm/nuxt.config.ts:2`.

Historical; all are `nuxt.config.ts` beneath the named App:
- `projects/bringli/bringli-app`:16.
- `projects/buenohost/ausfinn-apartments`:17, `projects/buenohost/book-with-nats`:17, `projects/buenohost/buenohost-app`:20.
- `projects/fireux/find-my-seo-app`:5; `projects/granite/granite-app`:16.
- `projects/misebox/baeren-ringgenberg`:41, `projects/misebox/friiites`:28, `projects/misebox/interlaken-essen`:45, `projects/misebox/la-tap-berne`:24.
- `projects/sharer/kjordi`:5, `projects/sharer/sharer-app`:5.
- `projects/slap/interlaken-bike-tours`:22, `projects/slap/slap-app`:5, `projects/slap/yellow-velo`:5.

Other tracked references: `packages/ecosystem/fireux-fireux/src/runtime/nuxt.config.ts:4`, `packages/ecosystem/fireux-werkbox/src/runtime/nuxt.config.ts:4`, `packages/extensions/fireux-app/src/defaults.ts:11` and `src/test/app-defaults.test.mjs`, `projects/fireux/fireux-app/shared/ignition-preview.ts:189` (generated layer config). The current canon and Core README document the selector. No config edit is proposed.

## Native discovery and installed evidence

- **Components:** Nuxt scans layer `app/components/`. The template name or generated `#components` is the Nuxt-app interface. Internal explicit relative imports are fine, including Core Detail's choice of its own card. Register a component name intentionally since multiple layers can provide the same name. [Nuxt components](https://nuxt.com/docs/4.x/directory-structure/app/components).
- **Composables:** native top-level scans under `app/composables/` and `app/utils/`, with generated `#imports` when an explicit import is useful. Nested implementation stays explicit by default. Core currently has no composable directory. Native discovery does not require export map entries. [Composables](https://nuxt.com/docs/4.x/directory-structure/app/composables), [auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports).
- **Shared models:** `shared/` gives app/server-compatible placement. Only conventional `shared/types` and `shared/utils` participate in default auto-import scans. Entity folders here use explicit relative imports. The generated Misebox `#shared` alias resolves to the consuming App's shared directory. It is not a generic Core package import. Export a named contract when code in another package genuinely depends on it. [Nuxt shared directory](https://nuxt.com/docs/4.x/directory-structure/shared).
- **Server utilities, entity operations and routes:** Nitro imports server utilities in its server environment, and file discovery registers `server/api` and `server/routes`. Core's entity operation folders are ordinary modules, wired through relative imports. Consumers use typed HTTP calls for the route's behavior or a deliberate server library contract for independent computation. Use explicit boundaries for authorization and client bundling. The exports map does not authorize any HTTP request. [Nuxt server directory](https://nuxt.com/docs/4.x/directory-structure/server).
- **Layer and package:** c12 resolves `fireux-core/layer` to the config and Nuxt discovers from that filesystem root. npm's `files` defines what is packed. Node's `exports` defines what package specifiers resolve. The files Nitro and Nuxt need must ship even with few public specifiers. Removing `./package.json` does not remove the manifest from the tarball. [Authoring layers](https://nuxt.com/docs/4.x/guide/going-further/layers), [Node entry points](https://nodejs.org/api/packages.html#package-entry-points), [npm files](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#files).
- **Nuxt UI:** Installed 4.13.1 and 4.12.0 register the whole runtime component directory by Nuxt Kit and explicitly select public composables (`dist/module.mjs:251–260` and `:196–205`). They also expose module/CSS, Vite/unplugin and grouped or wildcard component, runtime, composable and utility paths for direct integration. Nuxt uses the module route. Plain Vue explicitly uses a separate Vite integration. This supports directory-based discovery for thousands of components. The additional exports are a separate distribution choice with a broader consumer base than Core's current layer. [Nuxt UI for Nuxt](https://ui.nuxt.com/docs/getting-started/installation/nuxt), [Nuxt UI for Vue](https://ui.nuxt.com/docs/getting-started/installation/vue).

Installed read-only evidence: Blank uses Nuxt 4.7.0/Nitro 2.14.0 and Misebox/Holzworm use 4.6.1/2.13.4. c12 3.3.4 `dist/index.mjs:301,334–341` resolves module specifiers. Nuxt `dist/index.mjs:8894,9042` (4.7.0) and `:6011,6113` (4.6.1) supply the component and import directories. `@nuxt/nitro-server/dist/index.mjs:1691` and `:913` pass layer server directories to Nitro. Nitro `dist/core/index.mjs:309,932` and `:311,884` cover utility scanning and handler discovery. Read-only Kit and Nitro probes resolved the same single Core root and nine handlers in all three Apps. Generated `.nuxt/components.d.ts` confirms `AppDetailCard` and `.nuxt/types/nitro-imports.d.ts` confirms Core server utils, without bare imports of the physical paths. Node 22 resolved all six declared subpaths and rejected the unexported physical consent subpath. No proposed manifest, historical builds, or runtime changes were exercised in this audit.

## Proposed complete manifest

Minimum with current evidenced contract consumers and the two targeted historical consumer edits approved separately. A layer-only manifest is a starting rule for new layer packages, with removal here requiring replacement or retirement of the model, consent and platform projection callers. Keep all six current entries until the paired edits can be verified.

```json
{
  "name": "fireux-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    "./layer": "./nuxt.config.ts",
    "./app": "./shared/app/app.model.ts",
    "./user-consent": "./shared/user/user-consent.ts",
    "./server/app/read-app-document": "./server/app/read-app-document.ts"
  },
  "files": ["nuxt.config.ts", "app", "server", "shared"],
  "engines": {
    "node": ">=22.23 <23",
    "pnpm": "11.9.0"
  },
  "dependencies": {
    "firebase-admin": "^12.7.0",
    "h3": "^1.15.4"
  },
  "peerDependencies": {
    "@nuxt/ui": "^4.12.0",
    "nuxt": "^4.6.1",
    "vue": "^3.5.43"
  }
}
```

## Proposed convention and decision boundary

Start a layer with its layer entry and a packing allowlist. Use native discovery for mounted Nuxt capabilities, relative imports for implementation, and explicit workspace dependencies plus a small named export for an independently needed cross-package contract. Deliberately document supported component names, composable names and HTTP routes where appropriate. Their discovery alone grants no commitment to support direct package imports. Use a single existing domain module when several symbols belong to one real contract. Consider grouping when consumers share that boundary and lifecycle. Broad wildcards make every matching implementation path part of the package API and require extra boundary discipline. Avoid convenience barrels, wildcard surfaces and generated registries in this slice. Keep server-only contracts separate from app imports.

Implementation authorization is pending. Before any later removal, verify which layer supplies `AppDetailCard` in the real Docs host, render the page/updated example, compare the package-library Core row, and search the supported downstream graph and docs for remaining callers. Pack and test the new interface under Node resolution and Nuxt, with retained contracts resolving and removed entries rejected. Hold existing source-TypeScript loading assumptions. Run all three App typechecks and builds, verify six components and nine handlers, and repeat the relevant signed-out SSR and Misebox consent/identity regression checks on disposable emulators. Keep the cross-database reader scope and public projection intact. If the historical host blocks targeted verification, report it and keep that export decision separate from any migration. The existing `tsconfig.base.json:38–40` aliases and `docs/concepts/runtime-package.md:32` retired Core wiring link remain stale; the current source is the package manifest and Core README. They were outside the audit's edit scope. Internal server organization follows the package-interface decision.
