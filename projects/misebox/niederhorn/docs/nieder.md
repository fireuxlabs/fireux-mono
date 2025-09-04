# Niederhorn — Structure Reference

This document lists the package and tsconfig files for the Niederhorn app, its parent Misebox app, and the tenant packages it uses, plus module.ts files and their supporting config files. Use this as a consistency reference.

## Apps

### projects/misebox/niederhorn/package.json

```json
{
  "name": "Niederhorn",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxi build",
    "dev": "nuxi dev --port 3003",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "postinstall": "nuxi prepare"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62"
  },
  "dependencies": {
    "@nuxt/ui": "3.1.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "@vueup/vue-quill": "^1.2.0",
    "dompurify": "^3.2.6",
    "firebase": "11.10.0",
    "firebase-admin": "^13.4.0",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "fireux-misebox": "workspace:*",
    "nuxt": "4.0.3",
    "nuxt-vuefire": "^1.0.5",
    "stripe": "^18.3.0",
    "vue": "3.5.20",
    "vue-router": "^4.5.1"
  }
}
```

### projects/misebox/niederhorn/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"]
    },
    "skipLibCheck": true
  },
  "include": ["./**/*"]
}
```

### projects/misebox/niederhorn/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-misebox'],
    ecosystem: 'misebox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  }),
})

export default config
```

### projects/misebox/misebox-app/package.json

```json
{
  "name": "misebox-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxi build",
    "dev": "nuxi dev --port 3001",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "postinstall": "nuxi prepare",
    "clean": "rimraf dist",
    "migrate:chefs": "tsx scripts/migrate-chef-data.ts"
  },
  "dependencies": {
    "@nuxt/ui": "3.1.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "@vueup/vue-quill": "^1.2.0",
    "dompurify": "^3.2.6",
    "firebase": "11.10.0",
    "firebase-admin": "^13.4.0",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "fireux-misebox": "workspace:*",
    "nuxt": "4.0.3",
    "nuxt-vuefire": "^1.0.5",
    "stripe": "^18.3.0",
    "vue": "3.5.20",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62"
  }
}
```

### projects/misebox/misebox-app/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"]
    },
    "skipLibCheck": true
  },
  "include": ["./**/*"]
}
```

### projects/misebox/misebox-app/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-misebox', 'fireux-jobs'],
    ecosystem: 'misebox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  }),
})

export default config
```

## Tenant Packages

### packages/tenants/fireux-misebox/package.json

```json
{
  "name": "fireux-misebox",
  "version": "0.1.0",
  "description": "Chef and Supplier marketplace system for FireUX apps",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./package.json": "./package.json"
  },
  "files": [
    "src/**/*"
  ],
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
    "fireux-core": "workspace:*",
    "fireux-places": "workspace:*"
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
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "mkdist": "^1.5.3",
    "rimraf": "^6.0.1",
    "glob": "^11.0.3"
  },
  "type": "module"
}
```

### packages/tenants/fireux-misebox/tsconfig.json

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "composite": false,
    "baseUrl": ".",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "#fireux-misebox-models/*": ["./src/runtime/models/*"],
      "#fireux-places-models/*": [
        "../../extensions/fireux-places/src/runtime/models/*"
      ]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### packages/tenants/fireux-misebox/src/module.ts

```ts
import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-misebox',
    version: '0.1.0',
    configKey: 'fireuxMisebox',
  },
  defaults: {
    prefix: 'Mise',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

    // Delegate to config functions
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configureLayouts(resolver, nuxt)
    configurePlugins(resolver)
    configureServer(resolver)
    configureRuntime(nuxt, 'misebox')

    // Nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-misebox: module configured')
    })
  },
})

export default module
```

#### Supporting config files (fireux-misebox)

- src/config/components-config.ts
```ts
import { addComponentsDir } from '@nuxt/kit'

export function configureComponents(
  resolver: any,
  options: { prefix?: string } = {}
) {
  // Consistent with core/jobs: domain-prefixed, non-global, no path prefix
  addComponentsDir({
    path: resolver.resolve('../runtime/components'),
    prefix: options.prefix ?? 'Mise',
    global: false,
    pathPrefix: false,
  })
}
```

- src/config/composables-config.ts
```ts
/**
 * Composables Configuration for FireUX Misebox
 *
 * Auto-imports Chef and Supplier composables from specific directories
 */
import { Resolver, addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add all composable directories for auto-import
  addImportsDir([
    resolvePath('./runtime/composables/**'),
  ])

  // Add models directory for auto-import
  addImportsDir(resolver.resolve('./runtime/models'))
}
```

- src/config/models-config.ts
```ts
/**
 * Models Configuration for FireUX Misebox
 *
 * Auto-import all model interfaces in runtime/models/{profiles,objects} using a glob.
 * Each model file exporting an interface named after the file (PascalCase + .model.ts)
 * will be exposed as a global constant referencing its type.
 *
 * Example: runtime/models/objects/Ingredient.model.ts -> global const Ingredient
 */
import type { Resolver } from '@nuxt/kit'
import { addTypeTemplate } from '@nuxt/kit'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

function toGlobalName(file: string) {
  // Expect .../<Dir>/<Name>.model.ts
  const base = file.split(/[\\/]/).pop() || ''
  const name = base.replace(/\.model\.ts$/, '')
  return name
}

export function configureModels(resolver: Resolver) {
  const root = resolver.resolve('.')

  function walk(dir: string, acc: string[] = []): string[] {
    let entries: string[] = []
    try {
      entries = readdirSync(dir)
    } catch {
      return acc
    }
    for (const name of entries) {
      const abs = join(dir, name)
      let s
      try {
        s = statSync(abs)
      } catch {
        continue
      }
      if (s.isDirectory()) {
        walk(abs, acc)
      } else if (name.endsWith('.model.ts')) {
        acc.push(abs)
      }
    }
    return acc
  }

  const files = [
    resolver.resolve('./runtime/models/profiles'),
    resolver.resolve('./runtime/models/objects'),
  ].flatMap((d) => walk(d))

  const decls = files
    .map((abs) => {
      const globalName = toGlobalName(abs)
      const rel = relative(root, abs).replace(/\\/g, '/')
      return `  const ${globalName}: typeof import('${resolver.resolve('./' + rel)}').${globalName}`
    })
    .join('\n')

  addTypeTemplate({
    filename: 'types/misebox-models.d.ts',
    getContents: () => `declare global {\n${decls}\n}\n\nexport {}\n`,
  })
}
```

- src/config/pages-config.ts
```ts
export function configurePages(resolver: any, nuxt: any) {
  nuxt.options._layers ||= []
  nuxt.options._layers.push({
    cwd: resolver.resolve('./runtime'),
    config: { srcDir: resolver.resolve('./runtime') },
  })
}
```

- src/config/layouts-config.ts
```ts
import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure misebox layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })

  // Optionally register as Nuxt layout keys
  for (const key of ['MiseboxDefault', 'MiseboxDashboard', 'MiseboxDev']) {
    const f = join(layoutsDir, `${key}.vue`)
    if (existsSync(f))
      addLayout({ src: f, filename: `misebox-${key}.vue` }, key)
  }
}
```

- src/config/plugins-config.ts
```ts
export function configurePlugins(_resolver: any) {
  // no-op (tenant has no plugins for now)
}
```

- src/config/server-config.ts
```ts
export function configureServer(_resolver: any) {
  // no-op (tenant has no server handlers)
}
```

### packages/extensions/fireux-jobs/package.json

```json
{
  "name": "fireux-jobs",
  "version": "0.1.0",
  "description": "Job posting and application system for FireUX apps",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./package.json": "./package.json"
  },
  "files": [
    "src/**/*"
  ],
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
    "fireux-core": "workspace:*"
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
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "mkdist": "^1.5.3",
    "rimraf": "^6.0.1",
    "glob": "^11.0.3"
  },
  "type": "module"
}
```

### packages/extensions/fireux-jobs/tsconfig.json

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "composite": false,
    "baseUrl": ".",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "#fireux-jobs-models/*": ["./src/runtime/models/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": [
    "src/**/*.ts",
    "src/runtime/env.d.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### packages/extensions/fireux-jobs/src/module.ts

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureLayouts } from './config/layouts-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    version: '1.0.0',
    configKey: 'fireuxJobs',
  },
  defaults: { prefix: 'Fire' },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    configureServer(resolver)
    configureRuntime(nuxt, 'jobs')
    // Safe nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true
  },
})
```

#### Supporting config files (fireux-jobs)

- src/config/components-config.ts
```ts
import { addComponentsDir } from '@nuxt/kit'
export function configureComponents(
  resolver: any,
  options: { prefix?: string } = {}
) {
  addComponentsDir({
    path: resolver.resolve('../runtime/components'),
    prefix: options.prefix ?? 'Fire',
    global: false,
    pathPrefix: false,
  })
}
```

- src/config/composables-config.ts
```ts
import { addImportsDir } from '@nuxt/kit'
export function configureComposables(resolver: any) {
  addImportsDir(resolver.resolve('../runtime/composables'))
}
```

- src/config/models-config.ts
```ts
import { addImportsDir } from '@nuxt/kit'
export function configureModels(resolver: any) {
  addImportsDir(resolver.resolve('../runtime/models'))
}
```

- src/config/pages-config.ts
```ts
export function configurePages(resolver: any, nuxt: any) {
  nuxt.options._layers ||= []
  nuxt.options._layers.push({
    cwd: resolver.resolve('../runtime'),
    config: { srcDir: resolver.resolve('../runtime') },
  })
}
```

- src/config/layouts-config.ts
```ts
import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureLayouts(resolver: any, _nuxt: any) {
  const dir = resolver.resolve('./runtime/layouts')
  if (!existsSync(dir)) return
  addComponentsDir({
    path: dir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })
}
```

- src/config/runtime-config.ts
```ts
export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  const rc = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {})
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux as Record<string, any>
  ns[key] ||= defaults
}
```

- src/config/server-config.ts
```ts
import { addServerHandler } from '@nuxt/kit'
import { existsSync } from 'node:fs'
export function configureServer(resolver: any) {
  const appGet = resolver.resolve('../runtime/server/api/app.get.ts')
  if (existsSync(appGet))
    addServerHandler({ route: '/api/app', handler: appGet })
}
```

## Core Module (referenced by apps and tenants)

### packages/core/fireux-core/package.json

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
      "import": "./src/module.ts",
      "require": "./src/module.ts"
    },
    "./runtime/*": {
      "types": "./src/runtime/*",
      "import": "./src/runtime/*"
    },
    "./config/*": {
      "types": "./src/config/*",
      "import": "./src/config/*"
    },
    "./package.json": "./package.json"
  },
  "typesVersions": {
    "*": {
      "runtime/*": [
        "src/runtime/*"
      ],
      "config/*": [
        "src/config/*"
      ]
    }
  },
  "files": [
    "src/**/*"
  ],
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
    "@vueuse/core": "*",
    "@nuxt/ui": "3.x",
    "@nuxt/icon": "2.x",
    "tailwindcss": "^4",
    "postcss": "^8.4",
    "autoprefixer": "^10.4"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "mkdist": "^1.5.3",
    "rimraf": "^6.0.1"
  },
  "type": "module"
}
```

### packages/core/fireux-core/tsconfig.json

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "composite": false,
    "baseUrl": ".",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "#fireux-core-models/*": ["./src/runtime/models/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": [
    "src/**/*.ts",
    "src/runtime/env.d.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### packages/core/fireux-core/src/module.ts

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'
import { configureServer } from './config/server-config'
import { configureAssets } from './config/assets-config'
import { configureErrors } from './config/errors-config'

const module: NuxtModule = defineNuxtModule({
  meta: { name: 'fireux-core', version: '1.0.0', configKey: 'fireuxCore' },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1) runtime first
    configureRuntime(nuxt, 'core')

    // 2) plugins (can read runtime)
    configurePlugins(resolver)

    // 3) components
    configureComponents(resolver)

    // 4) composables
    configureComposables(resolver)

    // 5) models
    configureModels(resolver, nuxt)

    // 6) layouts
    configureLayouts(resolver, nuxt)

    // 7) pages
    configurePages(resolver, nuxt)

    // 8) server (api/middleware)
    configureServer(resolver)

    // 9) assets
    configureAssets(resolver, nuxt)

    // 10) errors
    configureErrors(resolver, nuxt)
  },
})

export default module
export { createFireuxConfig } from './runtime/utils/fireux-config'
```

#### Supporting config files (core)

- src/config/assets-config.ts
```ts
/**
 * Configure public assets for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureAssets(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add CSS files to Nuxt automatically
  nuxt.options ||= {}
  if (!nuxt.options.css) nuxt.options.css = []
  const css = nuxt.options.css as string[]
  const mainCssPath = resolvePath('./runtime/assets/styles/main.css')
  const mainScssPath = resolvePath('./runtime/assets/styles/scss/main.scss')

  // Ensure Tailwind/NUXT UI base first (main.css)
  if (!css.some((s) => String(s).includes('runtime/assets/styles/main.css'))) {
    css.push(mainCssPath)
  }
  // Then FireUX SCSS system
  if (
    !css.some((s) => String(s).includes('runtime/assets/styles/scss/main.scss'))
  ) {
    css.push(mainScssPath)
  }

  // Configure Nitro to serve public assets from the package
  nuxt.options.nitro ||= {}
  nuxt.options.nitro.publicAssets ||= []
  nuxt.options.nitro.publicAssets.push({
    baseURL: '/',
    dir: resolvePath('./runtime/public'),
    maxAge: 60 * 60 * 24 * 7, // 7 days cache
  })

  // Expose public directory and assets directory for advanced usage
  nuxt.options.alias ||= {}
  nuxt.options.alias['#fireux-core-public'] = resolvePath('./runtime/public')
  nuxt.options.alias['#fireux-core-assets'] = resolvePath('./runtime/assets')
}
```

- src/config/components-config.ts
```ts
import { addComponentsDir } from '@nuxt/kit'

export function configureComponents(resolver: any) {
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    pattern: '**/*.vue', // include nested directories
    // No global prefix; rely on pathPrefix and directory structure
    global: true, // always available
    pathPrefix: true, // include folder structure in names
  })
}
```

- src/config/composables-config.ts
```ts
import { addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: any) {
  // Auto-import composables under runtime/composables (root and nested)
  addImportsDir([
    resolver.resolve('./runtime/composables'),
    resolver.resolve('./runtime/composables/**'),
    // Also export utility helpers for auto-import
    resolver.resolve('./runtime/utils'),
    resolver.resolve('./runtime/utils/**'),
  ])
}
```

- src/config/models-config.ts
```ts
import { addImportsDir } from '@nuxt/kit'

export function configureModels(resolver: any, _nuxt: any) {
  // Allow importing model helpers/types from runtime/models/** (where it makes sense)
  addImportsDir(resolver.resolve('./runtime/models'))
}
```

- src/runtime/utils/fireux-config.ts
```ts
import type { NuxtConfig } from 'nuxt/schema'

type ModuleEntry = string | [string, Record<string, any>]

export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  primaryColor: string
  neutralColor?: string
  modules?: ModuleEntry[]
  includeCore?: boolean // default true
  // Optional per-app overrides for module options
  vuefire?: Record<string, any>
  pwa?: Record<string, any>
}

function dedupeKeepLast(mods: ModuleEntry[] = []): ModuleEntry[] {
  // Keep last occurrence so app-provided modules/options win
  const map = new Map<string, ModuleEntry>()
  for (const m of mods) {
    const id = Array.isArray(m) ? m[0] : m
    map.set(id, m)
  }
  const seen = new Set<string>()
  const ordered: ModuleEntry[] = []
  for (const m of mods) {
    const id = Array.isArray(m) ? m[0] : m
    if (!seen.has(id)) {
      seen.add(id)
      ordered.push(map.get(id)!)
    }
  }
  return ordered
}

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const includeCore = opts.includeCore ?? true

  // Defaults
  const vuefireDefaults = {
    auth: { enabled: true, sessionCookie: true },
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    appCheck: process.env.FIREBASE_RECAPTCHA_V3_KEY
      ? {
          debug: false,
          isTokenAutoRefreshEnabled: true,
          provider: 'ReCaptchaV3',
          key: process.env.FIREBASE_RECAPTCHA_V3_KEY,
        }
      : undefined,
  }

  const pwaDefaults = {
    registerType: 'autoUpdate',
    manifest: {
      name: opts.appName,
      short_name: opts.appShortName,
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: opts.primaryColor,
    },
  }

  const vuefireMerged = { ...vuefireDefaults, ...(opts.vuefire ?? {}) }
  const pwaMerged = { ...pwaDefaults, ...(opts.pwa ?? {}) }

  // Always-on modules (order matters)
  const base: ModuleEntry[] = [
    '@nuxt/ui',
    '@nuxt/icon',
    ['nuxt-vuefire', vuefireMerged],
    ['@vite-pwa/nuxt', pwaMerged],
    ...(includeCore ? (['fireux-core'] as ModuleEntry[]) : []),
  ]

  const modules = dedupeKeepLast([...base, ...(opts.modules ?? [])])

  return {
    // Keep FireUX app structure defaults
    srcDir: 'app',
    imports: { dirs: ['composables/**', 'models/**', 'utils/**'] },

    modules,
    app: { head: { title: opts.appName } },
    runtimeConfig: {
      // server-only
      firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || '',
      public: {
        ecosystem: opts.ecosystem,
        appName: opts.appName,
        appShortName: opts.appShortName,
        primaryColor: opts.primaryColor,
        neutralColor: opts.neutralColor,
        // Expose a plain object for the client plugin (firebase.client.ts)
        // Spread to avoid accidental mutation/metadata
        firebaseConfig: { ...(vuefireMerged.config || {}) },
      },
    },
  }
}
```

## Monorepo TS Config references

### projects/tsconfig.json

```jsonc
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@fireux-core/*": ["../packages/core/fireux-core/src/*"],
      "@fireux-jobs/*": ["../packages/extensions/fireux-jobs/src/*"],
      "@fireux-misebox/*": ["../packages/tenants/fireux-misebox/src/*"],
      "@fireux-cleanbox/*": ["../packages/tenants/fireux-cleanbox/src/*"],
      "@fireux-places/*": ["../packages/extensions/fireux-places/src/*"]
    }
  }
}
```

### tsconfig.base.json

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
      "fireux-misebox/*": ["packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["packages/extensions/fireux-places/src/*"],
      "fireux-jobs/*": ["packages/extensions/fireux-jobs/src/*"]
    }
  }
}
```

### tsconfig.json

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
    { "path": "packages/tenants/fireux-cleanbox" }
  ],
  "compilerOptions": {
    "baseUrl": "."
  }
}
```
