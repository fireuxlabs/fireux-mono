# Nuxt 4 integration map

Updated: 2026-11-06
Ref: 97ab6b477
Role: map, not canon

## Purpose and authority

Use official [Nuxt documentation](https://nuxt.com/docs/4.x/getting-started/introduction)
for framework behavior. This map records how FireUX packages extend Nuxt and
where the local integration lives. Current manifests and source take precedence
over a copied framework manual.

## Upstream references

- [Nuxt 4 documentation](https://nuxt.com/docs/4.x/getting-started/introduction)
- [Nuxt modules](https://nuxt.com/docs/guide/concepts/modules)
- [Nuxt layers](https://nuxt.com/docs/4.x/guide/going-further/layers)
- [Auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)
- [App directory](https://nuxt.com/docs/4.x/directory-structure/app)
- [Routing](https://nuxt.com/docs/4.x/getting-started/routing)
- [NuxtPage](https://nuxt.com/docs/4.x/api/components/nuxt-page)

## FireUX integration

[defineFireuxApp](../../packages/extensions/fireux-app/src/config.ts) composes
Core, Blogs, Products and AI for tenant and standalone Apps.
[defineFireuxEcosystem](../../packages/extensions/fireux-ecosystem/src/config.ts)
adds the Main App bundle. Both use Core's shared Nuxt and Firebase mechanics.
Core remains independently usable. Apps declare their own Ecosystem binding
and any additional domain layers and modules.

A package owns its Nuxt module and runtime layer. Its module registers that
package's components, composables, assets, pages or server handlers through
Nuxt's supported module APIs. Apps and packages use conventional Nuxt
entrypoints and package-owned runtime paths; see
[runtime placement](runtime-filesystem.md) and
[package contracts](runtime-package.md).

Use Nuxt's public module and layer APIs. Do not insert package runtimes into
private resolved-layer internals. The current source entrypoints are
[App composition](../../packages/extensions/fireux-app/src/config.ts),
[Core framework helpers](../../packages/core/fireux-core/src/config/app/nuxt-defaults.ts),
[Core module](../../packages/core/fireux-core/src/module.ts), and the relevant
App or package's nuxt.config.ts.

## Native defaults

Apps use the conventional `app/` source directory and root `public/` assets.
The App bundle explicitly retains `srcDir: 'app'` because package layers declare
`srcDir: '.'`; native layer merging would otherwise redirect App discovery to
the project root. Core does not repeat the default viewport or manually register
the App public folder. Nuxt's default `scanPageMeta: 'after-resolve'` timing supplies metadata to
Core's `pages:resolved` policies; Core still explicitly requests `layout` for
its Dashboard transition policy. Shared FireUX CSS, transitions and deliberate
build/runtime settings remain in `nuxt-defaults.ts`.

`nuxt-defaults.test.mjs` exercises layered App source/native public discovery, the default
viewport and metadata extraction with Core's actual transition policy. Production
verification also checks the copied public assets, not just directory discovery.

## Current compatibility bridge

Core currently sets Nuxt's future compatibility version to 5 and keeps
experimental Nitro auto-imports enabled. The bridge remains because registered
package server code still uses Nuxt's #imports alias. The source comment names
the Nitro migration as its removal boundary. Treat this as existing integration
work, not as a second Nuxt version or a permanent framework contract. See
[nuxt-defaults.ts](../../packages/core/fireux-core/src/config/app/nuxt-defaults.ts).

Exact Nuxt, Vue, Nuxt UI and integration package versions live in the root,
Core and App manifests plus pnpm-lock.yaml. Check those sources before a
framework change; do not keep a second version matrix here.

## Related FireUX maps

- [Platform composition](fireux.md)
- [Runtime filesystem](runtime-filesystem.md)
- [Runtime package contract](runtime-package.md)
- [App configuration](app-config.md)
- [Pages](pages.md)
- [Layouts](layouts.md)
- [Nuxt UI](nuxt-ui.md)
