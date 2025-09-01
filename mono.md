# Monorepo Report (mono.md)

This report lists all package.json, tsconfig\*.json, and module.ts files in the repo, with their contents.

## package.json files

### /package.json

```json
{
  "name": "fireux",
  "private": true,
  "type": "module",
  "version": "1.0.0",
  "workspaces": [
    "packages/core/*",
    "packages/extensions/*",
    "packages/tenants/*",
    "projects/*/*",
    "tools/*",
    "test-*"
  ],
  "scripts": {
    "dev:all": "concurrently \\\"pnpm dev:fireux\\\" \\\"pnpm dev:misebox\\\" \\\"pnpm dev:cleanbox\\\"",
    "dev:fireux": "pnpm --filter ./projects/fireux/fireux-app dev",
    "dev:misebox": "pnpm --filter ./projects/misebox/misebox-app dev",
    "dev:niederhorn": "pnpm --filter ./projects/misebox/niederhorn dev",
    "dev:cleanbox": "pnpm --filter ./projects/cleanbox/cleanbox-app dev",
    "dev:richies": "pnpm --filter ./projects/cleanbox/richies-reinigung dev",
    "build:all": "pnpm -r --parallel --filter './projects/*/*' build",
    "build:packages": "pnpm -r --filter './packages/*/*' build",
    "tsc:clean": "tsc -b --clean",
    "tsc:check": "tsc -b --pretty",
    "typecheck:apps": "pnpm -r --filter './projects/*/*' exec nuxi typecheck",
    "typecheck:packages": "pnpm -r --filter './packages/*/*' exec tsc --noEmit",
    "lint:docs": "node ./tools/scripts/lint-docs-paths.mjs",
    "lint": "eslint . --ext .js,.ts,.vue",
    "format": "prettier --write ."
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "devDependencies": {
    "@nuxt/devtools": "^2.6.3",
    "@nuxt/fonts": "^0.11.4",
    "@nuxt/icon": "^2.0.0",
    "@nuxt/schema": "4.0.3",
    "@nuxt/ui": "3.1.3",
    "@nuxtjs/color-mode": "^3.5.2",
    "@tsconfig/nuxt": "^2.0.3",
    "@types/node": "^20.19.11",
    "@typescript-eslint/eslint-plugin": "^8.41.0",
    "@typescript-eslint/parser": "^8.41.0",
    "concurrently": "^9.2.0",
    "eslint": "^9.28.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-vue": "^10.2.0",
    "nuxt": "4.0.3",
    "nuxt-vuefire": "^1.0.5",
    "prettier": "^3.5.3",
    "tailwindcss": "^4.1.12",
    "typescript": "^5.9.2",
    "vite-plugin-pwa": "^1.0.3",
    "vue-eslint-parser": "^10.2.0",
    "vue-tsc": "^3.0.6"
  },
  "pnpm": {
    "overrides": {
      "nuxt": "4.0.3",
      "@nuxt/kit": "4.0.3",
      "@nuxt/schema": "4.0.3",
      "vue": "3.5.20",
      "vuefire": "3.2.2",
      "firebase": "11.10.0"
    }
  },
  "packageManager": "pnpm@10.12.1"
}
```

### /projects/fireux/fireux-app/package.json

```json
{
  "name": "fireux-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxi build",
    "dev": "nuxi dev --port 3000",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "postinstall": "nuxi prepare"
  },
  "dependencies": {
    "nuxt": "4.0.3",
    "vue": "3.5.20",
    "vue-router": "4.5.1",
    "fireux-core": "workspace:*",
    "nuxt-vuefire": "^1.1.0",
    "firebase": "11.10.0"
  }
}
```

### /packages/core/fireux-core/package.json

```json
{
  "name": "fireux-core",
  "version": "0.1.0",
  "description": "FireUX Core - A comprehensive Nuxt 3 module for Firebase integration",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": {
      "types": "./src/module.ts",
      "import": "./src/module.ts"
    },
    "./runtime/*": {
      "types": "./src/runtime/*",
      "import": "./src/runtime/*"
    },
    "./config/*": {
      "types": "./src/config/*",
      "import": "./src/config/*"
    },
    "./config/app/*": {
      "types": "./src/config/app/*",
      "import": "./src/config/app/*"
    },
    "./config/app/fireux-config": {
      "types": "./src/config/app/fireux-config.ts",
      "import": "./src/config/app/fireux-config.ts"
    },
    "./package.json": "./package.json"
  },
  "typesVersions": {
    "*": {
      "runtime/*": ["src/runtime/*"],
      "config/*": ["src/config/*"],
      "config/app/*": ["src/config/app/*"]
    }
  },
  "files": ["src/**/*"],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build --stub",
    "postbuild": "rimraf src/**/*.map",
    "clean": "rimraf dist"
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "dependencies": {
    "dompurify": "^3.2.6"
  },
  "peerDependencies": {
    "nuxt": "4.0.3",
    "@nuxt/kit": "4.0.3",
    "@nuxt/schema": "4.0.3",
    "vue": "3.5.20",
    "vue-router": "^4.5.0",
    "vuefire": "3.2.2",
    "firebase": "11.10.0",
    "firebase-admin": "*",
    "h3": "*",
    "stripe": "*",
    "glob": "^11.0.3",
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "mkdist": "^1.5.3",
    "rimraf": "^6.0.1"
  },
  "type": "module"
}
```

... (other package.json files omitted for brevity in this view; they follow the same format as listed above)

## tsconfig\*.json files

### /tsconfig.json

```jsonc
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "projects/fireux/fireux-app" },
    { "path": "projects/misebox/misebox-app" },
    { "path": "projects/misebox/niederhorn" },
    { "path": "projects/cleanbox/cleanbox-app" },
    { "path": "projects/cleanbox/richies-reinigung" },
    { "path": "packages/core/fireux-core" },
    { "path": "packages/extensions/fireux-jobs" },
    { "path": "packages/extensions/fireux-places" },
    { "path": "packages/tenants/fireux-misebox" },
    { "path": "packages/tenants/fireux-cleanbox" },
  ],
  "compilerOptions": {
    "baseUrl": ".",
  },
}
```

### /tsconfig.base.json

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "fireux-core/*": ["packages/core/fireux-core/src/*"],
      "fireux-core/config/*": ["packages/core/fireux-core/src/config/*"],
      "fireux-core/config/app/*": [
        "packages/core/fireux-core/src/config/app/*",
      ],
      "fireux-misebox/*": ["packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["packages/extensions/fireux-places/src/*"],
      "fireux-jobs/*": ["packages/extensions/fireux-jobs/src/*"],
    },
  },
}
```

### /projects/fireux/fireux-app/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
    "skipLibCheck": true,
  },
  "include": ["./**/*"],
}
```

... (other tsconfig files omitted for brevity in this view)

## module.ts files

### /packages/core/fireux-core/src/module.ts

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureLayouts } from './config/layouts-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config'
import { configureAssets } from './config/assets-config'
import { configureErrors } from './config/errors-config'

/**
 * Public options for the FireUX core module
 */
export interface ModuleOptions {
  /**
   * Prefix for auto-registered components
   * @default 'Fire'
   */
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-core',
    version: '1.0.0',
    configKey: 'fireuxCore',
  },
  defaults: {
    prefix: 'Fire',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Core assets and error template
    configureAssets(resolver, nuxt)
    configureErrors(resolver, nuxt)

    // Call all config steps – these must exist in ./src/config/*
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver, nuxt)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    configureServer(resolver)
    configureRuntime(nuxt, 'core')

    // Components are registered via configureComponents; no duplicate registration here

    // Nitro tweak (safe to set/merge)
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    // Friendly log
    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log(
        '🔥 fireux-core: module configured (components/composables/models/pages/plugins/server/runtime)'
      )
    })
  },
})

export default module
```

... (other module.ts files omitted for brevity in this view)

---

Note: This is a snapshot for quick reference. Ask to expand any omitted sections to include all remaining files verbatim.
