---
title: FireUX Core App Report
status: draft
created: 2025-10-15
---

# FireUX App Architecture (Core-Focused)

- Core package `fireux-core` provides the Nuxt module that every app layer consumes; tenant-specific shells only import it.
- `createFireuxConfig` builds the full Nuxt config: runtime values, module stack, VueFire/PWA defaults, and dev safeguards.
- Runtime composables (`useFireUXConfig`, `useApp*`) expose the normalized settings and initialization gates used across the app shell and feature layers.
- The app shell component (`FireuxAppShell.vue`) is the only thing project apps render directly; everything else flows from the core runtime.

## Latest Updates (2025-10-15)

- **Runtime config hardened**: `packages/core/fireux-core/src/runtime/composables/FireUXConfig.ts` now fails fast when `appId`, `appName`, `appShortName`, `ecosystem`, or `role` are missing and exposes optional fields (`centralSignupUrl`, `appIcon`, etc.) without defaults.
- **Nuxt factory tightened**: `packages/core/fireux-core/src/config/fireux/fireux-config.ts` requires `role`, enforces `APP_ID`, and forwards optional branding URLs while dropping silent fallbacks.
- **App seeding minimalized**: `packages/core/fireux-core/src/runtime/composables/app/useEnsureApp.ts` seeds Firestore docs using the canonical layout (no implicit defaults, `defaults.brand` only when colors provided).
- **Env check aligned**: `packages/core/fireux-core/src/runtime/server/api/app/env-check.ts` now demands `APP_ID`, reports Firebase admin/Stripe status, and surfaces warnings instead of guessing.
- **Firestore migrated**: `scripts/2025-10-migrate-apps.ts` landed and was executed to reset `apps` collection to `misebox-app` and `niederhorn` records.

## Suggested Follow-Ups

- Re-run onboarding flows that call `useAppEnsure` to confirm fresh environments reseed the expected docs; watch Firestore for drift.
- Update tenant configs (`projects/**/nuxt.config.ts`) if they rely on removed defaults (check for missing `role` definitions or branding overrides).
- Audit downstream composables/components that expected deprecated `AppDoc` fields (e.g. legacy `avatarUrl`, `defaults.domain`) and remove stale references.
- Capture console clean-up work flagged by `pnpm lint --filter fireux-core` (numerous `console.*` warnings remain across runtime/dist bundles).
- When ready, extend the migration script to snapshot results or wire into CI so future schema changes stay reproducible.

## Core Execution Flow Snapshot

- App-level `nuxt.config.ts` calls `createFireuxConfig({ modules: ['fireux-tenant'] })` to merge tenant overrides with core defaults.
- Nuxt loads the `fireux-core` module which registers runtime directories (components, pages, layouts, plugins, assets, server handlers).
- On the client, the shell mounts, pulls runtime config via `useFireUXConfig`, and blocks UX until `useApp()` reports the Firestore doc is seeded.
- `useAppEnsure` can bootstrap the Firestore record and default assets when onboarding runs.

## Source Listings

### `packages/core/fireux-core/src/module.ts`

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'

import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'
import { configureServer } from './config/server-config'
import { configureAssets } from './config/assets-config'
import { configureErrors } from './config/errors-config'

export default defineNuxtModule({
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

    // 5) layouts
    configureLayouts(resolver, nuxt)

    // 6) pages
    configurePages(resolver, nuxt)

    // 7) server (api/middleware)
    configureServer(resolver)

    // 8) assets
    configureAssets(resolver, nuxt)

    // 9) errors
    configureErrors(resolver, nuxt)
  },
})
export { createFireuxConfig } from './config/fireux/fireux-config'
```

### `packages/core/fireux-core/src/config/fireux/fireux-config.ts`

```ts
import type { NuxtConfig } from 'nuxt/schema'
import { resolve as pathResolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

type ModuleEntry = string | [string, Record<string, any>]

export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  modules?: ModuleEntry[]
  includeCore?: boolean // default true
  primaryColor?: string
  neutralColor?: string
  vuefire?: Record<string, any>
  pwa?: Record<string, any>
  compatibilityDate?: string
  role?: string
}

function dedupeKeepLast(mods: ModuleEntry[] = []): ModuleEntry[] {
  const map = new Map<string, ModuleEntry>()
  for (const m of mods) map.set(Array.isArray(m) ? m[0] : m, m)
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

// concise env helper per Sonar (typescript:S6582)
const env = (k: string) => process.env[k]?.trim() || undefined

function readServiceAccount():
  | { projectId: string; clientEmail: string; privateKey: string }
  | undefined {
  const json = env('FIREBASE_SERVICE_ACCOUNT')
  if (json) {
    try {
      const parsed = JSON.parse(json)
      const projectId = parsed.project_id ?? parsed.projectId
      const clientEmail = parsed.client_email ?? parsed.clientEmail
      const rawKey = parsed.private_key ?? parsed.privateKey
      const privateKey =
        typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined
      if (projectId && clientEmail && privateKey)
        return { projectId, clientEmail, privateKey }
    } catch {
      /* ignore and fall through to split envs */
    }
  }
  const projectId = env('FIREBASE_PROJECT_ID')
  const clientEmail = env('FIREBASE_CLIENT_EMAIL')
  const rawKey = env('FIREBASE_PRIVATE_KEY')
  const privateKey =
    typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined
  if (projectId && clientEmail && privateKey)
    return { projectId, clientEmail, privateKey }
  return undefined
}

/**
 * Compute a single, stable workspace root to allow during dev when importing
 * package source via @fs. Safer than process.cwd() guesses.
 */
function resolveWorkspaceRoot() {
  const here = dirname(fileURLToPath(import.meta.url))
  // adjust depth if this file moves
  const repoRoot = pathResolve(here, '../../../')
  return repoRoot
}

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const includeCore = opts.includeCore ?? true

  const ecosystem = opts.ecosystem
  const primaryColor =
    opts.primaryColor ?? env('APP_PRIMARY_COLOR') ?? '#000000'
  const neutralColor = opts.neutralColor ?? env('APP_NEUTRAL_COLOR')

  const sa = readServiceAccount()

  const vuefireDefaults: Record<string, any> = {
    auth: { enabled: true, sessionCookie: false },
    config: {
      apiKey: env('FIREBASE_API_KEY'),
      authDomain: env('FIREBASE_AUTH_DOMAIN'),
      projectId: env('FIREBASE_PROJECT_ID'),
      storageBucket: env('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: env('FIREBASE_MESSAGING_SENDER_ID'),
      appId: env('FIREBASE_APP_ID'),
      measurementId: env('FIREBASE_MEASUREMENT_ID'),
    },
    appCheck: env('FIREBASE_RECAPTCHA_V3_KEY')
      ? {
          debug: false,
          isTokenAutoRefreshEnabled: true,
          provider: 'ReCaptchaV3',
          key: env('FIREBASE_RECAPTCHA_V3_KEY'),
        }
      : undefined,
    ...(sa ? { admin: { serviceAccount: sa } } : {}),
  }

  const pwaDefaults = {
    registerType: 'autoUpdate',
    manifest: {
      name: opts.appName,
      short_name: opts.appShortName,
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: primaryColor,
    },
  }

  const vuefireMerged = { ...vuefireDefaults, ...(opts.vuefire ?? {}) }
  const pwaMerged = { ...pwaDefaults, ...(opts.pwa ?? {}) }

  const base: ModuleEntry[] = [
    '@nuxt/ui',
    '@nuxt/icon',
    ['nuxt-vuefire', vuefireMerged],
    ['@vite-pwa/nuxt', pwaMerged],
    ...(includeCore ? (['fireux-core'] as ModuleEntry[]) : []),
  ]

  const modules = dedupeKeepLast([...base, ...(opts.modules ?? [])])

  const appId = env('APP_ID')
  const role = (opts.role ?? 'tenant').toLowerCase()
  const globalAppId = ecosystem ? `${ecosystem}-app` : undefined

  if (process.env.NODE_ENV !== 'production' && !appId) {
    // eslint-disable-next-line no-console
    console.warn(
      '[fireux] APP_ID is not set. Some app-level composables may not resolve.'
    )
  }

  // dev-only, minimal Vite fs.allow: just the workspace root
  const devFsAllow =
    process.env.NODE_ENV !== 'production' ? [resolveWorkspaceRoot()] : []

  const config: NuxtConfig = {
    srcDir: 'app',
    imports: { dirs: ['composables/**', 'utils/**'] },

    modules,
    app: { head: { title: opts.appName } },

    runtimeConfig: {
      googlePlacesApiKey: env('GOOGLE_PLACES_API_KEY') || '',
      firebaseServiceAccount: env('FIREBASE_SERVICE_ACCOUNT') || '',
      public: {
        ecosystem,
        appName: opts.appName,
        appShortName: opts.appShortName,
        primaryColor,
        neutralColor,
        firebaseConfig: { ...(vuefireMerged.config || {}) },
        appSettings: {
          appId,
          ecosystem,
          appName: opts.appName,
          appShortName: opts.appShortName,
        },
        modules: modules.map((m) => (Array.isArray(m) ? m[0] : m)),
        role,
        globalAppId,
      },
    },

    compatibilityDate: (opts.compatibilityDate ??
      '2025-09-01') as NuxtConfig['compatibilityDate'],

    vite: devFsAllow.length
      ? { server: { fs: { allow: devFsAllow } } }
      : undefined,
  }

  return config
}
```

### `packages/core/fireux-core/src/config/components-config.ts`

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

### `packages/core/fireux-core/src/config/composables-config.ts`

```ts
import { addImportsDir, type Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  addImportsDir(resolver.resolve('./runtime/composables'))
  addImportsDir(resolver.resolve('./runtime/composables/**'))
}
```

### `packages/core/fireux-core/src/config/layouts-config.ts`

```ts
import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register as layout components (CoreDefault/CoreDashboard/CoreDev/CoreDocs/CoreDesign)
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    prefix: 'Core',
    global: true,
    pathPrefix: false,
  })

  // Register layout keys that exist on disk
  // Note: We intentionally do NOT register 'default' here to avoid
  // layer key collisions with app-level app/layouts/default.vue.
  // Apps own their default.vue; core still exposes CoreDefault as a component.
  const keys = [
    'dashboard',
    'dev',
    'design',
    'landing',
    'portfolio',
    'auth',
    'chat',
    'changelog',
    'starter',
  ]
  for (const key of keys) {
    const file = join(layoutsDir, `${key}.vue`)
    if (existsSync(file)) {
      addLayout({ src: file, filename: `fireux-core-${key}.vue` }, key)
    }
  }
}
```

### `packages/core/fireux-core/src/config/pages-config.ts`

```ts
import type { Nuxt } from 'nuxt/schema'
import type { Resolver } from '@nuxt/kit'

// Nuxt 4 public "extends" entry type (string or [src, { config }])
type LayerEntry = string | [string, { config?: Record<string, any> }]

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  // 1) Point to your module's runtime directory (must contain /pages)
  const runtimeDir = resolver.resolve('./runtime')
  if (!runtimeDir) return

  // 2) Normalize extends to an array
  const current = nuxt.options.extends
  if (!current) {
    nuxt.options.extends = []
  } else if (!Array.isArray(current)) {
    nuxt.options.extends = [current]
  }
  const ext = nuxt.options.extends as LayerEntry[]

  // 3) Skip if already present
  const already = ext.some((entry) =>
    Array.isArray(entry) ? entry[0] === runtimeDir : entry === runtimeDir
  )
  if (already) return

  // 4) Push as tuple + srcDir so Nuxt scans runtime/pages, runtime/layouts, etc.
  ext.push([
    runtimeDir,
    {
      config: {
        srcDir: runtimeDir,
        // optional, explicit directories if you deviate from defaults:
        // dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
      },
    },
  ])

  // 5) Also populate Nuxt internals for non-public APIs that still expect _layers.
  const options = nuxt.options as Record<string, any>
  const internalLayers: Array<
    string | { cwd?: string; src?: string; config?: Record<string, any> }
  > = (options._layers ||= [])
  const hasInternal = internalLayers.some((entry) => {
    if (typeof entry === 'string') return entry === runtimeDir
    return entry?.cwd === runtimeDir || entry?.src === runtimeDir
  })
  if (!hasInternal) {
    internalLayers.push({
      cwd: runtimeDir,
      src: runtimeDir,
      config: {
        rootDir: runtimeDir,
        srcDir: runtimeDir,
        dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
      },
    })
  }
}
```

### `packages/core/fireux-core/src/config/assets-config.ts`

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
  nuxt.options.alias['#fireux-core-composables'] = resolvePath(
    './runtime/composables'
  )
}
```

### `packages/core/fireux-core/src/config/server-config.ts`

```ts
import { addServerHandler } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureServer(resolver: any) {
  // Register only actively used server routes to keep the surface minimal
  const base = resolver.resolve('./runtime/server/api')

  // App env-check used by onboarding screens
  const envCheck = `${base}/app/env-check.ts`
  if (existsSync(envCheck)) {
    addServerHandler({ route: '/api/app/env-check', handler: envCheck })
  }

  // Dev-only tracing sink used by inject-trace.client plugin
  const injectTrace = `${base}/inject-trace.post.ts`
  if (existsSync(injectTrace)) {
    addServerHandler({ route: '/api/inject-trace', handler: injectTrace })
  }

  // Generic image proxy used by image storage and avatar displays
  const imageProxy = `${base}/proxy/image.get.ts`
  if (existsSync(imageProxy)) {
    addServerHandler({ route: '/api/proxy/image', handler: imageProxy })
  }

  // Stripe product creation used by Product Create flow
  const stripeCreateProduct = `${base}/stripe/create-product.post.ts`
  if (existsSync(stripeCreateProduct)) {
    addServerHandler({
      route: '/api/stripe/create-product',
      handler: stripeCreateProduct,
    })
  }
}
```

### `packages/core/fireux-core/src/config/plugins-config.ts`

```ts
import { addPlugin } from '@nuxt/kit'

export function configurePlugins(resolver: any) {
  // Client/runtime plugin example; add more as needed
  const firebaseInit = resolver.resolve('./runtime/plugins/firebase.client.ts')
  addPlugin({ src: firebaseInit, mode: 'client' })

  // Dev-only: trace Vue inject() warnings with component file + stack hint
  const injectTraceServer = resolver.resolve(
    './runtime/plugins/inject-trace.server.ts'
  )
  addPlugin({ src: injectTraceServer, mode: 'server' })

  // Client tracer forwards events to server (no client console noise)
  const injectTraceClient = resolver.resolve(
    './runtime/plugins/inject-trace.client.ts'
  )
  addPlugin({ src: injectTraceClient, mode: 'client' })
}
```

### `packages/core/fireux-core/src/config/runtime-config.ts`

```ts
import type { Nuxt } from '@nuxt/schema'

/**
 * Ensure a stable namespace at runtimeConfig.public.fireux[key]
 * Used by fireux-core/module.ts during setup.
 */
export function configureRuntime(
  nuxt: Nuxt,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  // Work with a lenient view of runtimeConfig to avoid strict typing pitfalls
  const rc = nuxt.options.runtimeConfig as any
  // Ensure public exists and satisfies modules that narrow types (e.g., @nuxtjs/mdc)
  rc.public ||= {}
  rc.public.mdc ||= {}
  const pub: Record<string, any> = rc.public

  // Bucket under public.fireux
  if (!pub.fireux) pub.fireux = {}
  const fireux = pub.fireux as Record<string, any>

  // Merge defaults into this namespace (don’t overwrite existing)
  fireux[key] = { ...(fireux[key] || {}), ...defaults }
}
```

### `packages/core/fireux-core/src/config/errors-config.ts`

```ts
import { addTemplate } from '@nuxt/kit'

/**
 * Configure error handling for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureErrors(_resolver: any, _nuxt: any) {
  // Provide a minimal centralized error page following Nuxt 4 defaults
  // Apps can override by creating their own error.vue
  addTemplate({
    filename: 'error.vue',
    getContents: () => `<script setup lang="ts">
// Use a structural type to avoid importing from app-only aliases in server runtime
type Err = { statusCode?: number; statusMessage?: string }

const props = defineProps<{ error?: Err }>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="cell error-page">
    <div class="cell-content">
  <h1 class="cell-title">{{ error?.statusCode || 500 }}</h1>
  <p class="cell-subtitle">{{ error?.statusMessage || 'Something went wrong' }}</p>
      <div class="cell-actions">
        <button @click="handleError">Try again</button>
        <a href="/">Go home</a>
      </div>
    </div>
  </div>
</template>`,
  })
}
```

### `packages/core/fireux-core/src/runtime/components/App/FireuxAppShell.vue`

```vue
<!-- packages/core/fireux-core/src/runtime/components/App/FireuxAppShell.vue -->
<template>
  <UApp>
    <!-- Toast target -->
    <ClientOnly>
      <UToaster />
    </ClientOnly>

    <!-- Tiny dev icon (top-center) to open dev tools route -->
    <ClientOnly>
      <div
        v-if="isDev"
        class="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] select-none"
      >
        <UTooltip text="Open dev tools" :popper="{ placement: 'bottom' }">
          <UButton
            aria-label="Open dev tools"
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-wrench-screwdriver"
            class="opacity-70 hover:opacity-100"
            @click="goToDev()"
          />
        </UTooltip>
      </div>
    </ClientOnly>

    <!-- App content -->
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <!-- Blocker until app is initialized -->
    <UModal
      :open="!isInitialized"
      prevent-close
      title="🚫 Blocked"
      description="This app needs to be initialized."
    >
      <template #body>
        <OrganismsAppOnboarding />
      </template>
    </UModal>

    <!-- Dev tools modal -->
    <UModal v-model:open="devToolsOpen" title="Developer Tools">
      <template #body>
        <AppDebug />
      </template>
    </UModal>
  </UApp>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead, navigateTo } from 'nuxt/app'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useApp } from '../../composables/app/useApp'

// Names from our FireUX config
const { appName, appShortName } = useFireUXConfig()
const appDisplayName = computed(() => appShortName || appName || 'FireUX')
const isDev = process.dev
const devToolsOpen = ref(false)

// Single source of truth: useApp() already exposes isInitialized via useAppComputed(app)
const { isInitialized } = useApp()

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})

function goToDev() {
  navigateTo('/dev')
}
</script>
```

### `packages/core/fireux-core/src/runtime/composables/FireUXConfig.ts`

```ts
import { useRuntimeConfig } from 'nuxt/app'

interface AppSettings {
  projectName: string // Moved to the top to match `.env` order
  appName: string
  appId: string
  nodeEnv: string
  appShortName: string
  appPrimaryColor: string
  appNeutralColor: string
  appIcon: string
  domain: string
}

export function useFireUXConfig() {
  const runtimeConfig = useRuntimeConfig()

  // Ensure we always have an object to read, with reasonable defaults.
  // Deep-merge: runtime appSettings may be partial (core exposes minimal fields),
  // so we merge it over sensible defaults to avoid validation errors.
  const defaultSettings: AppSettings = {
    projectName: (runtimeConfig.public?.ecosystem as string) || 'FireUX',
    appName: 'FireUX',
    appId: 'fireux-app',
    nodeEnv: process.env.NODE_ENV || 'development',
    appShortName: 'FireUX',
    appPrimaryColor: '#111827',
    appNeutralColor: '#9CA3AF',
    appIcon: '/icon.png',
    domain: 'localhost',
  }
  const runtimeAppSettingsRaw =
    (runtimeConfig.public?.appSettings as Partial<AppSettings>) || {}
  // Backfill missing fields from top-level public keys if present
  const runtimeAppSettings: Partial<AppSettings> = {
    ...runtimeAppSettingsRaw,
    appName:
      runtimeAppSettingsRaw.appName ||
      (runtimeConfig.public?.appName as string | undefined),
    appShortName:
      runtimeAppSettingsRaw.appShortName ||
      (runtimeConfig.public?.appShortName as string | undefined),
    appId:
      runtimeAppSettingsRaw.appId ||
      (runtimeConfig.public?.appId as string | undefined),
    projectName:
      runtimeAppSettingsRaw.projectName ||
      (runtimeConfig.public?.ecosystem as string | undefined),
  }
  const appSettings = {
    ...defaultSettings,
    ...runtimeAppSettings,
  } as AppSettings

  const devMode = runtimeConfig.public?.devMode ?? true
  const ecosystem =
    typeof runtimeConfig.public?.ecosystem === 'string'
      ? runtimeConfig.public.ecosystem
      : undefined
  // Ensure modules is always a string array for safe downstream usage
  const modulesRaw = runtimeConfig.public?.modules
  const modules: string[] = Array.isArray(modulesRaw)
    ? modulesRaw.map((m) => String(m))
    : []

  // Role (global | tenant) — normalize for consistent comparisons
  const role = ((runtimeConfig.public?.role as string | undefined) ?? 'tenant')
    .toString()
    .trim()
    .toLowerCase()

  const { projectName, appName, appId, appIcon } = appSettings

  if (!projectName || typeof projectName !== 'string') {
    throw new Error('❌ Project Name must be a valid string.')
  }

  if (!appName || typeof appName !== 'string') {
    throw new Error('❌ App Name must be a valid string.')
  }

  if (!appId || typeof appId !== 'string') {
    throw new Error('❌ App ID must be a valid string.')
  }

  return {
    devMode,
    projectName, // Reordered return values to match `.env` order
    appName,
    appShortName: appSettings.appShortName,
    appId,
    appIcon, // Added appIcon to return values
    ecosystem,
    modules,
    role,
  }
}
```

### `packages/core/fireux-core/src/runtime/composables/app/useApp.ts`

```ts
// ~/composables/app/useApp.ts
import { computed, shallowRef } from 'vue'
import { doc, collection } from 'firebase/firestore'
import { useFirestore, useDocument, useCollection } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppUpdate } from './useAppUpdate'
import { useAppComputed } from './useAppComputed'
import { useAppEnsure } from './useEnsureApp'
import { useAppSubscriptionSetup } from './useAppSubscriptionSetup'
import type { App } from '../../models/core/app.model'
import { getApps } from 'firebase/app'

export function useApp() {
  const { role, appId } = useFireUXConfig()

  // Ensure Firebase is initialized
  if (!getApps().length) {
    throw new Error(
      'Firebase is not initialized. Please initialize Firebase before using this composable.'
    )
  }

  const db = useFirestore()
  const { firestoreFetchCollection } = useFirestoreManager()

  const appDocRef = computed<DocumentReference<App> | null>(() => {
    return appId ? (doc(db, 'apps', appId) as DocumentReference<App>) : null
  })

  const { data: app } = useDocument<App>(appDocRef)

  // Collections as Ref (sync wrapper returns Ref via VueFire stream)
  const apps = firestoreFetchCollection<App>('apps')

  // Users subcollection for any app
  const getAppUsers = (appId: string) => {
    const usersRef = collection(db, 'apps', appId, 'users')
    return useCollection(usersRef)
  }

  // Client-only extras: expose a loader to avoid awaiting inside composable
  const extras = shallowRef<any>(null)
  async function loadClientExtras() {
    if (!import.meta.client) return null
    if (extras.value) return extras.value
    const mod = await import('./useAppOnboarding')
    extras.value = mod.useAppOnboarding()
    return extras.value
  }

  return {
    // Role & App identity
    role,
    appId,
    // Current entity
    app,

    // Collections
    apps,

    // Users subcollection
    getAppUsers,

    // Child functions
    ...useAppUpdate(),
    ...useAppComputed(app),
    ...useAppSubscriptionSetup(),
    ...useAppEnsure(),
    // Onboarding helpers (client-only loader)
    loadClientExtras,
  }
}
```

### `packages/core/fireux-core/src/runtime/composables/app/useAppComputed.ts`

```ts
// ~/composables/app/useAppComputed.ts
import { computed, shallowRef, type Ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import type { App } from '../../models/core/app.model'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const currentUser = import.meta.client
    ? useCurrentUser()
    : (shallowRef<User | null>(null) as ReturnType<typeof useCurrentUser>)
  const rc = useRuntimeConfig()

  // Role is canonical: 'global' | 'tenant'
  const role =
    (rc.public?.role as string | undefined)?.toLowerCase() || 'tenant'

  // Back-compat: expose appTenancy string mirroring role
  const appTenancy = computed(() => role)

  // Human-readable tenancy display
  const tenancyDisplay = computed(() => {
    const eco = (rc.public as any)?.ecosystem || 'ecosystem'
    if (role === 'global') return `Global of ${eco}`
    if (role === 'tenant') return `Tenant of ${eco}`
    return `${role} of ${eco}`
  })

  // Existing computed: loading/initialized
  const isLoading = computed(() => app.value === undefined)

  const isInitialized = computed(() => {
    if (app.value === undefined) return false // loading
    if (app.value === null) return false // no doc yet
    return !!app.value.admin_ids?.length
  })

  // Existing helpers
  function hasAdmins(): boolean {
    return !!app.value?.admin_ids?.length
  }

  function isUserAdmin(userId?: string): boolean {
    const targetUserId = userId ?? currentUser.value?.uid
    if (!targetUserId || !app.value?.admin_ids) return false
    return app.value.admin_ids.includes(targetUserId)
  }

  return {
    // New readout
    appTenancy,
    tenancyDisplay,

    // Existing
    isLoading,
    isInitialized,
    hasAdmins,
    isUserAdmin,
  }
}
```

### `packages/core/fireux-core/src/runtime/composables/app/useEnsureApp.ts`

```ts
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { App } from '../../models/core/app.model'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useImageStorage } from '../firebase/useImageStorage'

/**
 * Composable to ensure an app exists in Firestore
 * - Creates the app if it doesn't exist
 * - Updates the core user as an admin
 */
export function useAppEnsure() {
  /**
   * Ensures an app exists for the current configuration
   * @param coreUser Optional core user object to use instead of fetching the current user
   * @returns The app ID if successful
   */
  async function ensureApp(coreUser?: any) {
    console.log('🚀 [ensureApp] Function invoked.')

    // Ensure this only runs on the client side
    if (!import.meta.client) {
      console.log('🚫 [ensureApp] Skipping on server side')
      return null
    }

    try {
      // Step 1: Get user data (either provided or from auth)
      const { setDocument } = useFirestoreManager()
      let uid: string

      if (coreUser?.id) {
        // Use the provided core user
        uid = coreUser.id
        console.log(`✅ [ensureApp] Using provided core user: ${uid}`)
      } else {
        // Get the current authenticated user
        const { waitForCurrentUser } = useFirestoreManager()
        const currentUser = await waitForCurrentUser()

        if (!currentUser?.uid) {
          throw new Error('No authenticated user found')
        }

        uid = currentUser.uid
        console.log(`✅ [ensureApp] Using authenticated user: ${uid}`)
      }

      // Step 2: Get app configuration
      const { appId, appName, ecosystem, modules, role } = useFireUXConfig()
      const db = useFirestore()

      console.log(
        `🔍 [ensureApp] Detected modules: ${
          Array.isArray(modules) ? modules.join(', ') : ''
        }`
      )
      console.log(`🔍 [ensureApp] Detected ecosystem: ${ecosystem ?? 'none'}`)

      // Step 3: Check if app already exists
      const appDocRef = doc(db, 'apps', appId)
      const appSnapshot = await getDoc(appDocRef)

      if (appSnapshot.exists()) {
        const appData = appSnapshot.data() as App
        const createdAt =
          typeof appData.created_at === 'string'
            ? appData.created_at
            : 'unknown date'
        console.log(
          `✅ [ensureApp] App '${appId}' already exists. Created on ${createdAt}.`
        )
        return appId
      }

      // Step 4: Prepare default avatar in Storage (best-effort)
      const avatarUrl = await prepareDefaultAppAvatar(appId)

      // Step 5: Create the app if it doesn't exist
      const appData: Partial<App> = {
        id: appId,
        app_name: appName,
        admin_ids: [uid],
        creator_id: uid,
        // Reflect current role: tenant apps mark is_tenant=true; global/platform mark false
        is_tenant: String(role || '').toLowerCase() === 'tenant',
        ...(ecosystem ? { ecosystem } : {}), // Add ecosystem if detected from modules
        ...(avatarUrl ? { avatarUrl } : {}),
        created_at: new Date().toISOString(),
      }

      // Write the app document without automatic stamping (explicit system fields already set)
      await setDocument('apps', appId, appData, { raw: true })
      console.log(
        `🎉 [ensureApp] App '${appId}' created successfully with ecosystem: ${
          ecosystem ?? 'none'
        }`
      )

      // Step 6: Update core user with admin role
      if (coreUser?.adminOf?.includes(appId)) {
        console.log(
          `✅ [ensureApp] Core user already has admin role for app '${appId}'.`
        )
      } else {
        const coreUserRef = doc(db, 'core-users', uid)
        await updateDoc(coreUserRef, {
          adminOf: arrayUnion(appId),
        })
        console.log(
          `✅ [ensureApp] Core user updated with admin role for app '${appId}'.`
        )
      }

      return appId
    } catch (error) {
      console.error('❌ [ensureApp] Error occurred:', error)
      throw error
    }
  }

  /** Best-effort default app avatar upload. Returns a URL or undefined on failure. */
  async function prepareDefaultAppAvatar(
    appId: string
  ): Promise<string | undefined> {
    try {
      const { uploadImage, getDefaultImageUrl } = useImageStorage()
      const url = await uploadImage(
        `apps/${appId}/avatar.jpg`,
        getDefaultImageUrl()
      )
      if (url) console.log('🖼️ [ensureApp] App avatar uploaded to Storage')
      return url || undefined
    } catch (e) {
      console.warn('⚠️ [ensureApp] Failed to upload default app avatar:', e)
      return undefined
    }
  }

  return { ensureApp }
}
```

## Notes & Follow-ups

- Sensitive configuration (Firebase secrets, etc.) still flow through environment variables; they stay out of this report by design.
- Tenant modules (`packages/ecosystem/*`) attach additional runtime assets but rely on the same `createFireuxConfig` contract illustrated above.
- If more runtime listings are required (e.g., specific layouts or plugins), call them out and they can be appended here.
