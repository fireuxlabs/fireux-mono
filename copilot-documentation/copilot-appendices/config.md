# Nuxt app configs (consolidated)

Generated on: 2025-09-28

This report lists all Nuxt config files in the monorepo with a concise summary of key options. For full defaults, see `packages/core/fireux-core/src/runtime/utils/fireux-config.ts` which provides `createFireuxConfig` used by all apps.

## Apps

### projects/fireux/fireux-app/nuxt.config.ts

- base: createFireuxConfig({ appName: "FireUX", appShortName: "FireUX", ecosystem: "fireux", modules: ["fireux-fireux"], role: "global" })
- devServer: { host: "localhost", port: 3000, strictPort: true }
- Modules (via createFireuxConfig base list + tenant module):
  - @nuxt/ui, @nuxt/icon, nuxt-vuefire, @vite-pwa/nuxt, fireux-core, fireux-fireux
- Runtime public config (from createFireuxConfig): ecosystem=fireux, role=global, appName/ShortName, theme colors, firebaseConfig
- Vite server.fs.allow: monorepo paths (from core createFireuxConfig)

### projects/cleanbox/cleanbox-app/nuxt.config.ts

- base: createFireuxConfig({ appName: "Cleanbox", appShortName: "Cleanbox", ecosystem: "cleanbox", modules: ["fireux-cleanbox"], role: "global" })
- Modules: @nuxt/ui, @nuxt/icon, nuxt-vuefire, @vite-pwa/nuxt, fireux-core, fireux-cleanbox
- Runtime public config: ecosystem=cleanbox, role=global

### projects/cleanbox/richies-reinigung/nuxt.config.ts

- base: createFireuxConfig({ appName: "Richies", appShortName: "Richies", ecosystem: "cleanbox", modules: ["fireux-cleanbox"], role: "tenant" })
- Modules: @nuxt/ui, @nuxt/icon, nuxt-vuefire, @vite-pwa/nuxt, fireux-core, fireux-cleanbox
- Runtime public config: ecosystem=cleanbox, role=tenant

### projects/misebox/misebox-app/nuxt.config.ts

- base: createFireuxConfig({ appName: "Misebox", appShortName: "Misebox", ecosystem: "misebox", modules: ["fireux-misebox"], role: "global" })
- Modules: @nuxt/ui, @nuxt/icon, nuxt-vuefire, @vite-pwa/nuxt, fireux-core, fireux-misebox
- Runtime public config: ecosystem=misebox, role=global

### projects/misebox/niederhorn/nuxt.config.ts

- base: createFireuxConfig({ appName: "Niederhorn", appShortName: "Niederhorn", ecosystem: "misebox", modules: ["fireux-misebox"], role: "tenant" })
- Modules: @nuxt/ui, @nuxt/icon, nuxt-vuefire, @vite-pwa/nuxt, fireux-core, fireux-misebox
- Runtime public config: ecosystem=misebox, role=tenant

### projects/fireux/tennant/nuxt.config.ts

- base: createFireuxConfig({ appName: "FireUX Tenant", appShortName: "Tenant", ecosystem: "fireux", modules: ["fireux-fireux"], role: "tenant" })
- Modules: @nuxt/ui, @nuxt/icon, nuxt-vuefire, @vite-pwa/nuxt, fireux-core, fireux-fireux
- Runtime public config: ecosystem=fireux, role=tenant

## Shared defaults via fireux-core/createFireuxConfig

- srcDir: "app"; auto-imports from composables/** and utils/**
- VueFire: auth enabled, firebase config from env; optional AppCheck; admin when service account fully provided
- PWA: registerType autoUpdate; manifest uses app name, short name and theme color
- runtimeConfig.public: exposes ecosystem, appName, colors, firebaseConfig, appSettings (appId), modules list, role
- compatibilityDate: default 2025-09-01 (overridable per app)
- Vite server.fs.allow: allows monorepo roots and packages/ to enable layered module pages during dev

Links to source:

- packages/core/fireux-core/src/runtime/utils/fireux-config.ts
- packages/core/fireux-core/src/module.ts
