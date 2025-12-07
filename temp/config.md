# FireUX Core Config Inventory

## `packages/core/fireux-core/src/config/base/assets-config.ts`

"""ts
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

"""

## `packages/core/fireux-core/src/config/base/components-config.ts`

"""ts
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

"""

## `packages/core/fireux-core/src/config/base/composables-config.ts`

"""ts
import { addImportsDir, type Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  addImportsDir(resolver.resolve('./runtime/composables'))
  addImportsDir(resolver.resolve('./runtime/composables/**'))
}

"""

## `packages/core/fireux-core/src/config/base/deploy-ignore-config.ts`

"""ts
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Nuxt } from 'nuxt/schema'

const IGNORE_FILENAME = 'fireux-deploy-ignore'
const DEFAULT_RULES = ['dev']
const ALLOW_DEV_ENV = 'FIREUX_DEPLOY_WITH_DEV'
const RULES_ENV = 'FIREUX_DEPLOY_IGNORE'
const APPLIED_FLAG = '__fireuxDeployIgnoreApplied'

export function configureDeployIgnore(nuxt: Nuxt) {
  const options = nuxt.options as Record<string, any>
  if (options[APPLIED_FLAG]) return
  if (nuxt.options.dev) return
  if (process.env[ALLOW_DEV_ENV] === '1') return

  const rules = resolveIgnoreRules(nuxt)
  if (!rules.length) return

  const rawIgnore: Array<string | RegExp> = Array.isArray(nuxt.options.ignore)
    ? (nuxt.options.ignore as Array<string | RegExp>)
    : []

  const currentIgnore = rawIgnore.map((pattern) =>
    typeof pattern === 'string' ? pattern : pattern.source
  )

  const ignorePatterns = new Set<string>(currentIgnore)
  for (const rule of rules) {
    for (const pattern of toGlobPatterns(rule)) {
      ignorePatterns.add(pattern)
    }
  }

  nuxt.options.ignore = Array.from(ignorePatterns)
  options[APPLIED_FLAG] = true
}

function resolveIgnoreRules(nuxt: Nuxt): string[] {
  const collected = new Set<string>()
  for (const source of [...readRulesFromFile(nuxt), ...readRulesFromEnv()]) {
    const normalized = normalizeRule(source)
    if (normalized) {
      collected.add(normalized)
    }
  }

  if (!collected.size) {
    for (const fallback of DEFAULT_RULES) {
      collected.add(fallback)
    }
  }

  return Array.from(collected)
}

function readRulesFromFile(nuxt: Nuxt): string[] {
  const filePath = join(nuxt.options.rootDir, IGNORE_FILENAME)
  if (!existsSync(filePath)) return []

  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.split('#')[0]?.trim() ?? '')
    .filter(Boolean)
}

function readRulesFromEnv(): string[] {
  const raw = process.env[RULES_ENV]
  if (!raw) return []

  return raw
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function normalizeRule(rule: string): string {
  return rule
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

function toGlobPatterns(rule: string): string[] {
  const normalized = normalizeRule(rule)
  if (!normalized) return []
  return [`**/${normalized}`, `**/${normalized}/**`]
}

"""

## `packages/core/fireux-core/src/config/base/errors-config.ts`

"""ts
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

"""

## `packages/core/fireux-core/src/config/base/layouts-config.ts`

"""ts
import { addComponentsDir } from '@nuxt/kit'
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
}

"""

## `packages/core/fireux-core/src/config/base/models-config.ts`

"""ts
// Models are not auto-imported. Keep explicit imports for clarity.
export function configureModels(_resolver: any, _nuxt: any) {
  // no-op
}

"""

## `packages/core/fireux-core/src/config/base/pages-config.ts`

"""ts
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

"""

## `packages/core/fireux-core/src/config/base/plugins-config.ts`

"""ts
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

"""

## `packages/core/fireux-core/src/config/base/runtime-config.ts`

"""ts
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

"""

## `packages/core/fireux-core/src/config/base/server-config.ts`

"""ts
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

"""

## `packages/core/fireux-core/src/config/base/tenant-layer.ts`

"""ts
import { addComponentsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'node:fs'

export interface TenantComponentOptions {
  prefix?: string
  global?: boolean
  pathPrefix?: boolean
  directory?: string
}

export function configureTenantComponents(
  resolver: Resolver,
  options: TenantComponentOptions = {}
) {
  const dir = resolver.resolve(options.directory ?? './runtime/components')
  if (!existsSync(dir)) return

  addComponentsDir({
    path: dir,
    prefix: options.prefix,
    global: options.global ?? false,
    pathPrefix: options.pathPrefix ?? false,
  })
}

export interface TenantLayoutOptions {
  prefix?: string
  pattern?: string
  global?: boolean
  directory?: string
}

export function configureTenantLayouts(
  resolver: Resolver,
  _nuxt: Nuxt | undefined,
  options: TenantLayoutOptions = {}
) {
  const dir = resolver.resolve(options.directory ?? './runtime/layouts')
  if (!existsSync(dir)) return

  addComponentsDir({
    path: dir,
    pattern: options.pattern ?? '*.vue',
    prefix: options.prefix,
    global: options.global ?? true,
    pathPrefix: false,
  })
}

export interface TenantAssetOptions {
  alias?: string
  baseURL?: string
  maxAge?: number
  directory?: string
}

export function configureTenantAssets(
  resolver: Resolver,
  nuxt: Nuxt,
  options: TenantAssetOptions = {}
) {
  const publicDir = resolver.resolve(options.directory ?? './runtime/public')
  if (!existsSync(publicDir)) return

  const opts = nuxt.options as any
  opts.nitro ||= {}
  opts.nitro.publicAssets ||= []
  opts.nitro.publicAssets.push({
    baseURL: options.baseURL ?? '/',
    dir: publicDir,
    maxAge: options.maxAge ?? 60 * 60 * 24 * 7,
  })

  if (options.alias) {
    opts.alias ||= {}
    opts.alias[options.alias] = publicDir
  }
}

"""

## `packages/core/fireux-core/src/config/fireux/env.ts`

"""ts
import { resolve as pathResolve, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// concise env helper per Sonar (typescript:S6582)
export const env = (key: string) => process.env[key]?.trim() || undefined

export const requireEnv = (key: string) => {
  const value = env(key)
  if (!value) {
    throw new Error(`[fireux] Environment variable ${key} is required.`)
  }
  return value
}

export function resolveWorkspaceRoot(): string {
  const explicit = env('FIREUX_WORKSPACE_ROOT')
  if (explicit) {
    return pathResolve(explicit)
  }

  let current = dirname(fileURLToPath(import.meta.url))

  for (let i = 0; i < 10; i += 1) {
    const hasWorkspace = existsSync(pathResolve(current, 'pnpm-workspace.yaml'))
    const hasGit = existsSync(pathResolve(current, '.git'))
    if (hasWorkspace || hasGit) {
      return current
    }

    const parent = pathResolve(current, '..')
    if (parent === current) break
    current = parent
  }

  return current
}

"""

## `packages/core/fireux-core/src/config/fireux/firebase-env.ts`

"""ts
import { existsSync } from 'node:fs'
import { resolve as pathResolve } from 'node:path'
import type { FirebaseProjectConfig } from '../schemas/firebase-project'
import { getFirebaseProjectConfig } from './firebase-projects'
import { resolveWorkspaceRoot } from './env'

const BASE_ENV_MAP: Record<string, keyof FirebaseProjectConfig> = {
  FIREBASE_API_KEY: 'apiKey',
  FIREBASE_AUTH_DOMAIN: 'authDomain',
  FIREBASE_PROJECT_ID: 'projectId',
  FIREBASE_STORAGE_BUCKET: 'storageBucket',
  FIREBASE_MESSAGING_SENDER_ID: 'messagingSenderId',
  FIREBASE_APP_ID: 'appId',
  FIREBASE_MEASUREMENT_ID: 'measurementId',
  FIREBASE_REGISTRY_DATABASE_ID: 'registryDatabaseId',
}

const DEFAULT_RUNTIME_PREFIXES = ['NUXT_FIREBASE', 'NUXT_PUBLIC_FIREBASE']

function setEnvIfMissing(key: string, value?: string) {
  if (!value) return
  if (process.env[key] && process.env[key]!.length > 0) return
  process.env[key] = value
}

function applyEnvMappings(
  project: FirebaseProjectConfig,
  runtimePrefixes: string[]
) {
  for (const [envKey, projectKey] of Object.entries(BASE_ENV_MAP)) {
    setEnvIfMissing(envKey, project[projectKey])
  }

  for (const prefix of runtimePrefixes) {
    for (const envKey of Object.keys(BASE_ENV_MAP) as Array<
      keyof typeof BASE_ENV_MAP
    >) {
      const nextKey = envKey.replace('FIREBASE', prefix)
      const projectKey = BASE_ENV_MAP[envKey]
      setEnvIfMissing(nextKey, project[projectKey])
    }
  }
}

export interface PrimeFirebaseEnvOptions {
  overrides?: Partial<FirebaseProjectConfig>
  runtimePrefixes?: string[]
  serviceAccountPath?: string
}

export function primeFirebaseEnv(
  baseProject: FirebaseProjectConfig,
  options?: PrimeFirebaseEnvOptions
): FirebaseProjectConfig {
  const project = {
    ...baseProject,
    ...(options?.overrides ?? {}),
  }

  applyEnvMappings(
    project,
    options?.runtimePrefixes ?? DEFAULT_RUNTIME_PREFIXES
  )

  if (
    options?.serviceAccountPath &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = options.serviceAccountPath
  }

  return project
}

export function primeEcosystemFirebaseEnv(
  ecosystem: string
): FirebaseProjectConfig | undefined {
  const project = getFirebaseProjectConfig(ecosystem)
  if (!project) return undefined

  const workspaceRoot = resolveWorkspaceRoot()
  const candidate = pathResolve(
    workspaceRoot,
    'packages/ecosystem',
    `fireux-${ecosystem}`,
    'config',
    'service-account.json'
  )
  const serviceAccountPath = existsSync(candidate) ? candidate : undefined

  return primeFirebaseEnv(project, { serviceAccountPath })
}

"""

## `packages/core/fireux-core/src/config/fireux/firebase-projects.ts`

"""ts
import type { FirebaseProjectConfig } from '../schemas/firebase-project'

export const FIREUX_FIREBASE_PROJECT: FirebaseProjectConfig = {
  apiKey: 'AIzaSyBXQzbWwcOCMyBEVn1plDVJAofmalenLM4',
  authDomain: 'fireux-2005.firebaseapp.com',
  projectId: 'fireux-2005',
  storageBucket: 'fireux-2005.firebasestorage.app',
  messagingSenderId: '549102750204',
  appId: '1:549102750204:web:f136fca73d3c9101b8ca79',
  measurementId: 'G-4R6XV8JJEP',
  registryDatabaseId: 'registry',
}

export const CLEANBOX_FIREBASE_PROJECT: FirebaseProjectConfig = {
  apiKey: 'AIzaSyBr8HyfrjHGdWA6EAbBddpLL-c4qddMh4A',
  authDomain: 'cleanbox-f15bc.firebaseapp.com',
  projectId: 'cleanbox-f15bc',
  storageBucket: 'cleanbox-f15bc.firebasestorage.app',
  messagingSenderId: '1083929507377',
  appId: '1:1083929507377:web:d3ad38cdc238645e658710',
  measurementId: 'G-HVCD78T7LW',
}

export const MISEBOX_FIREBASE_PROJECT: FirebaseProjectConfig = {
  apiKey: 'AIzaSyBkWm7VONGZRx74pg2vFbnFyDKjruEwg6M',
  authDomain: 'misebox-78f9c.firebaseapp.com',
  projectId: 'misebox-78f9c',
  storageBucket: 'misebox-78f9c.appspot.com',
  messagingSenderId: '102749723716',
  appId: '1:102749723716:web:8c9d57e9a768f9cd017011',
}

export const FIREBASE_PROJECTS: Record<string, FirebaseProjectConfig> = {
  fireux: FIREUX_FIREBASE_PROJECT,
  cleanbox: CLEANBOX_FIREBASE_PROJECT,
  misebox: MISEBOX_FIREBASE_PROJECT,
}

export function getFirebaseProjectConfig(
  ecosystem: string
): FirebaseProjectConfig | undefined {
  return FIREBASE_PROJECTS[ecosystem]
}

"""

## `packages/core/fireux-core/src/config/fireux/fireux-config.ts`

"""ts
import type { NuxtConfig } from 'nuxt/schema'
import { primeEcosystemFirebaseEnv } from './firebase-env'
import { resolveFireuxNuxtSetup } from './tenant-context'
import type { TenantConfig } from './tenant-config'

const DEFAULT_THEME_COLOR = '#0f172a'

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  primeEcosystemFirebaseEnv(opts.ecosystem)
  const setup = resolveFireuxNuxtSetup(opts)
  const themeColor = setup.themeColor || DEFAULT_THEME_COLOR

  return {
    srcDir: 'app',
    imports: { dirs: ['composables/**', 'utils/**'] },
    modules: setup.modules,
    app: {
      head: {
        title: setup.appName,
        meta: [
          { name: 'theme-color', content: themeColor },
          { name: 'apple-mobile-web-app-capable', content: 'yes' },
          {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black-translucent',
          },
          { name: 'mobile-web-app-capable', content: 'yes' },
        ],
        link: [
          { rel: 'manifest', href: '/manifest.webmanifest' },
          { rel: 'icon', href: '/favicon.ico' },
          {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: '/img/app/pwa/icon-192.png',
          },
        ],
      },
    },
    runtimeConfig: setup.runtimeConfig,
    compatibilityDate: setup.compatibilityDate,
    vite: setup.vite,
    nitro: setup.nitro,
  }
}

"""

## `packages/core/fireux-core/src/config/fireux/module-utils.ts`

"""ts
import type { NuxtConfig } from 'nuxt/schema'

export type ModuleEntry = string | [string, Record<string, any>]

type NitroOptions = NonNullable<NuxtConfig['nitro']>

export function dedupeKeepLast(mods: ModuleEntry[] = []): ModuleEntry[] {
  const map = new Map<string, ModuleEntry>()
  for (const entry of mods)
    map.set(Array.isArray(entry) ? entry[0] : entry, entry)
  const seen = new Set<string>()
  const ordered: ModuleEntry[] = []
  for (const entry of mods) {
    const id = Array.isArray(entry) ? entry[0] : entry
    if (!seen.has(id)) {
      seen.add(id)
      ordered.push(map.get(id)!)
    }
  }
  return ordered
}

export function mergeNitroExternals(
  externals: NitroOptions['externals'],
  additions: string[]
): NitroOptions['externals'] {
  if (!additions.length) return externals

  const next: Record<string, any> = Array.isArray(externals)
    ? { external: externals }
    : { ...(externals ?? {}) }

  const current = Array.isArray(next.external)
    ? next.external
    : next.external
    ? [next.external]
    : []

  const merged = new Set<any>([...current, ...additions])

  next.external = Array.from(merged)

  return next as NitroOptions['externals']
}

"""

## `packages/core/fireux-core/src/config/fireux/nitro-config.ts`

"""ts
import type { NuxtConfig } from 'nuxt/schema'
import { env } from './env'
import { mergeNitroExternals } from './module-utils'

const firebaseNitroExternalPackages = [
  'firebase-admin',
  'firebase-functions',
  '@google-cloud/firestore',
  '@google-cloud/storage',
]

type NitroOptions = NonNullable<NuxtConfig['nitro']>

export function createNitroConfig(
  baseNitro: NuxtConfig['nitro'] | undefined
): NitroOptions {
  const nitro = { ...(baseNitro ?? {}) } as NitroOptions
  const preset = (nitro.preset ??
    env('FIREUX_NITRO_PRESET') ??
    'firebase') as NitroOptions['preset']

  nitro.preset = preset

  if (preset === 'firebase') {
    const defaults = { gen: 2, nodeVersion: '22' } as Record<string, any>
    nitro.firebase = {
      ...defaults,
      ...(nitro.firebase ?? {}),
    } as NitroOptions['firebase']
    nitro.externals = mergeNitroExternals(
      nitro.externals,
      firebaseNitroExternalPackages
    )
  }

  return nitro
}

"""

## `packages/core/fireux-core/src/config/fireux/pwa-config.ts`

"""ts
export interface PwaConfigOptions {
  appName: string
  appShortName: string
  themeColor?: string
  overrides?: Record<string, any>
}

const DEFAULT_BACKGROUND = '#ffffff'
const DEFAULT_THEME = '#0f172a'

export function createPwaConfig(
  options: PwaConfigOptions
): Record<string, any> {
  const { appName, appShortName, themeColor, overrides } = options
  const resolvedTheme = themeColor ?? DEFAULT_THEME

  const base = {
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    workbox: { navigateFallback: '/' },
    manifest: {
      name: appName,
      short_name: appShortName || appName,
      description: `${appName} progressive web app`,
      scope: '/',
      start_url: '/',
      display: 'standalone',
      background_color: DEFAULT_BACKGROUND,
      theme_color: resolvedTheme,
      lang: 'en',
      icons: [
        {
          src: '/img/app/pwa/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/img/app/pwa/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  }

  return mergePwaOptions(base, overrides)
}

function mergePwaOptions(
  base: Record<string, any>,
  overrides?: Record<string, any>
): Record<string, any> {
  if (!overrides) {
    return base
  }

  return deepMerge(base, overrides)
}

function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = { ...target }

  for (const [key, value] of Object.entries(source)) {
    const current = result[key]

    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = deepMerge(current, value)
    } else {
      result[key] = value
    }
  }

  return result
}

const isPlainObject = (value: unknown): value is Record<string, any> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))

"""

## `packages/core/fireux-core/src/config/fireux/runtime-config.ts`

"""ts
import type { ModuleEntry } from './module-utils'
import { env } from './env'

export interface RuntimeConfigOptions {
  ecosystem: string
  appId: string
  appName: string
  appShortName: string
  role: 'global' | 'tenant'
  modules: ModuleEntry[]
  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string
  centralSignupUrl?: string
  appIcon?: string
  developerPin?: string
  firebaseConfig: Record<string, any>
  serviceAccountJson?: string
  globalAppId?: string
  devMode: boolean
}

export function createRuntimeConfig(options: RuntimeConfigOptions) {
  const {
    ecosystem,
    appId,
    appName,
    appShortName,
    role,
    modules,
    primaryColor,
    neutralColor,
    secondaryColor,
    centralSignupUrl,
    appIcon,
    developerPin,
    firebaseConfig,
    serviceAccountJson,
    globalAppId,
    devMode,
  } = options

  return {
    googlePlacesApiKey: env('GOOGLE_PLACES_API_KEY'),
    firebaseServiceAccount:
      serviceAccountJson ?? env('FIREBASE_SERVICE_ACCOUNT'),
    public: {
      devMode,
      ecosystem,
      appId,
      appName,
      appShortName,
      primaryColor,
      neutralColor,
      secondaryColor,
      centralSignupUrl,
      appIcon,
      developerPin,
      firebaseConfig: { ...firebaseConfig },
      appSettings: {
        appId,
        ecosystem,
        appName,
        appShortName,
      },
      modules: modules.map((entry) =>
        Array.isArray(entry) ? entry[0] : entry
      ),
      role,
      globalAppId,
    },
  }
}

"""

## `packages/core/fireux-core/src/config/fireux/service-account.ts`

"""ts
import { resolve as pathResolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { env, resolveWorkspaceRoot } from './env'

export type ServiceAccountPayload = {
  credentials: {
    projectId: string
    clientEmail: string
    privateKey: string
  }
  json: string
}

function toServiceAccountPayload(
  input: Record<string, unknown>
): ServiceAccountPayload | undefined {
  const projectId = input.project_id ?? input.projectId
  const clientEmail = input.client_email ?? input.clientEmail
  const rawKey = input.private_key ?? input.privateKey

  if (typeof projectId !== 'string' || !projectId.trim()) return undefined
  if (typeof clientEmail !== 'string' || !clientEmail.trim()) return undefined
  if (typeof rawKey !== 'string' || !rawKey.trim()) return undefined

  let normalizedKey = rawKey
  if (rawKey.includes('\\n')) {
    normalizedKey = rawKey.replace(/\\n/g, '\n')
  }

  const escapedKey = normalizedKey.replace(/\n/g, String.raw`\n`)

  const json = JSON.stringify(
    {
      project_id: projectId,
      client_email: clientEmail,
      private_key: escapedKey,
    },
    null,
    2
  )

  return {
    credentials: {
      projectId,
      clientEmail,
      privateKey: normalizedKey,
    },
    json,
  }
}

function readServiceAccountFromFile(
  path: string
): ServiceAccountPayload | undefined {
  try {
    const raw = readFileSync(path, 'utf-8')
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return toServiceAccountPayload(parsed)
  } catch {
    return undefined
  }
}

function readServiceAccountFromInline(): ServiceAccountPayload | undefined {
  const inlineJson = env('FIREBASE_SERVICE_ACCOUNT')
  if (!inlineJson) return undefined
  try {
    const parsed = JSON.parse(inlineJson) as Record<string, unknown>
    return toServiceAccountPayload(parsed)
  } catch {
    return undefined
  }
}

function readServiceAccountFromSplitEnv(): ServiceAccountPayload | undefined {
  const projectId = env('FIREBASE_PROJECT_ID')
  const clientEmail = env('FIREBASE_CLIENT_EMAIL')
  const rawKey = env('FIREBASE_PRIVATE_KEY')
  if (!projectId || !clientEmail || !rawKey) return undefined

  return toServiceAccountPayload({
    project_id: projectId,
    client_email: clientEmail,
    private_key: rawKey,
  })
}

function serviceAccountCandidatePaths(ecosystem: string): string[] {
  const fileEnv = env('FIREBASE_SERVICE_ACCOUNT_FILE')
  const gcloudCredentials = env('GOOGLE_APPLICATION_CREDENTIALS')
  const workspaceRoot = resolveWorkspaceRoot()
  const cwd = process.cwd()
  const paths = new Set<string>()

  const addPath = (candidate: string) => {
    if (!candidate) return
    if (/^\s*$/.test(candidate)) return

    if (candidate.startsWith('file://')) {
      try {
        const url = new URL(candidate)
        paths.add(fileURLToPath(url))
        return
      } catch {
        return
      }
    }

    if (pathResolve(candidate) === candidate && candidate.startsWith('/')) {
      paths.add(candidate)
      return
    }

    paths.add(pathResolve(cwd, candidate))
    paths.add(pathResolve(workspaceRoot, candidate))
  }

  addPath(fileEnv ?? '')
  addPath(gcloudCredentials ?? '')

  const relativeCandidates = [
    `packages/ecosystem/${ecosystem}-${ecosystem}/config/service-account.json`,
    `packages/ecosystem/fireux-${ecosystem}/config/service-account.json`,
    `packages/ecosystem/${ecosystem}/config/service-account.json`,
  ]

  for (const relative of relativeCandidates) {
    paths.add(pathResolve(workspaceRoot, relative))
  }

  return Array.from(paths)
}

function readServiceAccountFromFiles(
  ecosystem: string
): ServiceAccountPayload | undefined {
  for (const candidate of serviceAccountCandidatePaths(ecosystem)) {
    if (!existsSync(candidate)) continue
    const payload = readServiceAccountFromFile(candidate)
    if (payload) return payload
  }
  return undefined
}

export function readServiceAccount(
  ecosystem: string
): ServiceAccountPayload | undefined {
  return (
    readServiceAccountFromInline() ??
    readServiceAccountFromSplitEnv() ??
    readServiceAccountFromFiles(ecosystem)
  )
}

"""

## `packages/core/fireux-core/src/config/fireux/tenant-basics.ts`

"""ts
import type { TenantConfig } from './tenant-config'

export interface TenantBasics {
  ecosystem: string
  appName: string
  appShortName: string
  role: 'global' | 'tenant'
  includeCore: boolean
}

export function resolveTenantBasics(opts: TenantConfig): TenantBasics {
  return {
    ecosystem: requireTenantField('ecosystem', opts.ecosystem),
    appName: requireTenantField('appName', opts.appName),
    appShortName: requireTenantField('appShortName', opts.appShortName),
    role: opts.role,
    includeCore: opts.includeCore ?? true,
  }
}

function requireTenantField(name: string, value: string | undefined): string {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    throw new Error(`[fireux] createFireuxConfig requires ${name}.`)
  }
  return trimmed
}

"""

## `packages/core/fireux-core/src/config/fireux/tenant-config.ts`

"""ts
import type { NuxtConfig } from 'nuxt/schema'
export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  role: 'global' | 'tenant'
  modules?: string[]
  includeCore?: boolean
  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string
  vuefire?: Record<string, any>
  pwa?: Record<string, any>
  compatibilityDate?: string
  nitro?: NuxtConfig['nitro']
}

"""

## `packages/core/fireux-core/src/config/fireux/tenant-context.ts`

"""ts
import type { NuxtConfig } from 'nuxt/schema'
import { createNitroConfig } from './nitro-config'
import type { TenantConfig } from './tenant-config'
import type { ModuleEntry } from './module-utils'
import { resolveTenantBasics } from './tenant-basics'
import { resolveTenantTheme } from './tenant-theme'
import { resolveTenantIntegrations } from './tenant-integrations'
import { resolveTenantModules } from './tenant-modules'
import { resolveTenantRuntime } from './tenant-runtime'
import { resolveTenantVite } from './tenant-vite'

interface FireuxNuxtSetup {
  appName: string
  themeColor?: string
  modules: ModuleEntry[]
  runtimeConfig: NonNullable<NuxtConfig['runtimeConfig']>
  compatibilityDate: NuxtConfig['compatibilityDate']
  vite?: NuxtConfig['vite']
  nitro: NuxtConfig['nitro']
}

const DEFAULT_COMPATIBILITY_DATE = '2025-09-01'

export function resolveFireuxNuxtSetup(opts: TenantConfig): FireuxNuxtSetup {
  const basics = resolveTenantBasics(opts)
  const theme = resolveTenantTheme(opts)
  const integrations = resolveTenantIntegrations(basics, theme, opts)
  const modules = resolveTenantModules(
    basics.includeCore,
    opts.modules,
    integrations
  )
  const devMode = process.env.NODE_ENV !== 'production'
  const runtimeConfig = resolveTenantRuntime({
    basics,
    theme,
    modules,
    firebaseConfig: integrations.firebaseConfig,
    serviceAccountJson: integrations.serviceAccount?.json,
    devMode,
  })
  const nitro = createNitroConfig(opts.nitro)
  const vite = resolveTenantVite(devMode)

  return {
    appName: basics.appName,
    themeColor: theme.primaryColor,
    modules,
    runtimeConfig,
    compatibilityDate: resolveCompatibilityDate(opts.compatibilityDate),
    vite,
    nitro,
  }
}

function resolveCompatibilityDate(
  explicit?: string
): NuxtConfig['compatibilityDate'] {
  return (explicit ??
    DEFAULT_COMPATIBILITY_DATE) as NuxtConfig['compatibilityDate']
}

"""

## `packages/core/fireux-core/src/config/fireux/tenant-integrations.ts`

"""ts
import {
  readServiceAccount,
  type ServiceAccountPayload,
} from './service-account'
import { createVuefireConfig } from './vuefire-config'
import { createPwaConfig } from './pwa-config'
import type { TenantConfig } from './tenant-config'
import type { TenantBasics } from './tenant-basics'
import type { TenantTheme } from './tenant-theme'

export interface TenantIntegrations {
  serviceAccount?: ServiceAccountPayload
  vuefireConfig: Record<string, any>
  pwaConfig: Record<string, any>
  firebaseConfig: Record<string, any>
}

export function resolveTenantIntegrations(
  basics: TenantBasics,
  theme: TenantTheme,
  opts: TenantConfig
): TenantIntegrations {
  const serviceAccount = readServiceAccount(basics.ecosystem)

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && serviceAccount?.json) {
    // Surface the service account early so nuxt-vuefire treats SSR as configured
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccount.json
  }

  const vuefireConfig = createVuefireConfig({
    overrides: opts.vuefire,
    serviceAccount: serviceAccount?.credentials,
  })

  const pwaConfig = createPwaConfig({
    appName: basics.appName,
    appShortName: basics.appShortName,
    themeColor: theme.primaryColor,
    overrides: opts.pwa,
  })

  return {
    serviceAccount,
    vuefireConfig,
    pwaConfig,
    firebaseConfig: vuefireConfig.config ?? {},
  }
}

"""

## `packages/core/fireux-core/src/config/fireux/tenant-modules.ts`

"""ts
import { dedupeKeepLast, type ModuleEntry } from './module-utils'
import type { TenantIntegrations } from './tenant-integrations'

export function resolveTenantModules(
  includeCore: boolean,
  moduleIds: string[] | undefined,
  integrations: TenantIntegrations
): ModuleEntry[] {
  const base: ModuleEntry[] = [
    '@nuxt/ui',
    '@nuxt/icon',
    ['nuxt-vuefire', integrations.vuefireConfig],
    ['@vite-pwa/nuxt', integrations.pwaConfig],
    ...(includeCore ? (['fireux-core'] as ModuleEntry[]) : []),
  ]

  const extras = sanitizeModuleIds(moduleIds)

  return dedupeKeepLast([...base, ...extras])
}

function sanitizeModuleIds(ids?: string[]): string[] {
  if (!ids?.length) return []
  return ids.map((id) => id?.trim()).filter((id): id is string => Boolean(id))
}

"""

## `packages/core/fireux-core/src/config/fireux/tenant-runtime.ts`

"""ts
import type { NuxtConfig } from 'nuxt/schema'
import { requireEnv } from './env'
import { createRuntimeConfig } from './runtime-config'
import type { ModuleEntry } from './module-utils'
import type { TenantBasics } from './tenant-basics'
import type { TenantTheme } from './tenant-theme'

export interface TenantRuntimeInput {
  basics: TenantBasics
  theme: TenantTheme
  modules: ModuleEntry[]
  firebaseConfig: Record<string, any>
  serviceAccountJson?: string
  devMode: boolean
}

export function resolveTenantRuntime(
  input: TenantRuntimeInput
): NonNullable<NuxtConfig['runtimeConfig']> {
  const {
    basics,
    theme,
    modules,
    firebaseConfig,
    serviceAccountJson,
    devMode,
  } = input
  const appId = requireEnv('APP_ID')
  const globalAppId = basics.ecosystem ? `${basics.ecosystem}-app` : undefined

  return createRuntimeConfig({
    ecosystem: basics.ecosystem,
    appId,
    appName: basics.appName,
    appShortName: basics.appShortName,
    role: basics.role,
    modules,
    primaryColor: theme.primaryColor,
    neutralColor: theme.neutralColor,
    secondaryColor: theme.secondaryColor,
    centralSignupUrl: theme.centralSignupUrl,
    appIcon: theme.appIcon,
    developerPin: theme.developerPin,
    firebaseConfig,
    serviceAccountJson,
    globalAppId,
    devMode,
  })
}

"""

## `packages/core/fireux-core/src/config/fireux/tenant-theme.ts`

"""ts
import { env } from './env'
import type { TenantConfig } from './tenant-config'

export interface TenantTheme {
  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string
  centralSignupUrl?: string
  appIcon?: string
  developerPin?: string
}

export function resolveTenantTheme(opts: TenantConfig): TenantTheme {
  return {
    primaryColor: opts.primaryColor ?? env('APP_PRIMARY_COLOR'),
    neutralColor: opts.neutralColor ?? env('APP_NEUTRAL_COLOR'),
    secondaryColor: opts.secondaryColor ?? env('APP_SECONDARY_COLOR'),
    centralSignupUrl: env('CENTRAL_SIGNUP_URL'),
    appIcon: env('APP_ICON'),
    developerPin: env('PIN'),
  }
}

"""

## `packages/core/fireux-core/src/config/fireux/tenant-vite.ts`

"""ts
import type { NuxtConfig } from 'nuxt/schema'
import { resolveWorkspaceRoot } from './env'

export function resolveTenantVite(
  devMode: boolean
): NuxtConfig['vite'] | undefined {
  if (!devMode) return undefined

  return { server: { fs: { allow: [resolveWorkspaceRoot()] } } }
}

"""

## `packages/core/fireux-core/src/config/fireux/vuefire-config.ts`

"""ts
import { env } from './env'
import type { ServiceAccountPayload } from './service-account'

export interface VuefireConfigOptions {
  overrides?: Record<string, any>
  serviceAccount?: ServiceAccountPayload['credentials']
}

export function createVuefireConfig(
  options: VuefireConfigOptions
): Record<string, any> {
  const { overrides, serviceAccount } = options
  const appCheckKey = env('FIREBASE_RECAPTCHA_V3_KEY')

  const base: Record<string, any> = {
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
    appCheck: appCheckKey
      ? {
          debug: false,
          isTokenAutoRefreshEnabled: true,
          provider: 'ReCaptchaV3',
          key: appCheckKey,
        }
      : undefined,
    ...(serviceAccount ? { admin: { serviceAccount } } : {}),
  }

  return { ...base, ...(overrides ?? {}) }
}

"""

## `packages/core/fireux-core/src/config/schemas/firebase-project.ts`

"""ts
export interface FirebaseProjectConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
  registryDatabaseId?: string
}

"""

## `packages/core/fireux-core/src/config/validation/config-validation.ts`

"""ts
// FireUX Configuration Validation Utility
// This utility helps validate tenant configurations and provides helpful error messages

export interface ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// Use a distinct name to avoid clashes with factory's TenantConfig
export interface ValidationTenantConfig {
  appName: string
  appShortName: string
  primaryColor: string
  neutralColor?: string
  secondaryColor?: string
  tenantModule: string
  environmentVariables: Record<string, string>
}

/**
 * Validates a complete tenant configuration
 */
export function validateTenantConfig(
  config: ValidationTenantConfig
): ConfigValidationResult {
  const result: ConfigValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  }

  // Validate app configuration
  validateAppConfig(config, result)

  // Validate environment variables
  validateEnvironmentVariables(config.environmentVariables, result)

  // Validate color configuration
  validateColorConfig(config.primaryColor, result)
  if (config.neutralColor) {
    validateColorConfig(config.neutralColor, result, 'Neutral color', false)
  }
  if (config.secondaryColor) {
    validateColorConfig(config.secondaryColor, result, 'Secondary color', false)
  }

  // Validate module configuration
  validateModuleConfig(config.tenantModule, result)

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Validates app-level configuration
 */
function validateAppConfig(
  config: ValidationTenantConfig,
  result: ConfigValidationResult
) {
  if (!config.appName || config.appName.trim().length === 0) {
    result.errors.push('APP_NAME is required')
  }

  if (!config.appShortName || config.appShortName.trim().length === 0) {
    result.errors.push('APP_SHORT_NAME is required')
  } else if (config.appShortName.length > 4) {
    result.warnings.push(
      'APP_SHORT_NAME should be 4 characters or less for optimal display'
    )
  }

  if (config.appName && config.appName.length > 50) {
    result.warnings.push(
      'APP_NAME is quite long - consider shortening for better UX'
    )
  }
}

/**
 * Validates environment variables
 */
function validateEnvironmentVariables(
  envVars: Record<string, string>,
  result: ConfigValidationResult
) {
  const requiredVars = [
    'NUXT_FIREBASE_API_KEY',
    'NUXT_FIREBASE_AUTH_DOMAIN',
    'NUXT_FIREBASE_PROJECT_ID',
    'NUXT_FIREBASE_STORAGE_BUCKET',
    'NUXT_FIREBASE_MESSAGING_SENDER_ID',
    'NUXT_FIREBASE_APP_ID',
  ]

  const optionalVars = [
    'NUXT_FIREBASE_MEASUREMENT_ID',
    'NUXT_FIREBASE_RECAPTCHA_V3_KEY',
  ]

  // Check required server-side variables
  requiredVars.forEach((varName) => {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      result.errors.push(`Missing required environment variable: ${varName}`)
    }
  })

  // Optional variables for advanced features
  optionalVars.forEach((varName) => {
    if (!envVars[varName]) {
      result.warnings.push(`Optional env not set: ${varName}`)
    }
  })

  // Check for service account
  if (!envVars['FIREBASE_SERVICE_ACCOUNT']) {
    result.warnings.push(
      'FIREBASE_SERVICE_ACCOUNT not set - Firebase admin features may not work'
    )
    result.suggestions.push(
      'Set FIREBASE_SERVICE_ACCOUNT to the JSON content or mount config/service-account.json and read it in server code'
    )
  }

  // Validate Firebase project ID format
  const projectId = envVars['NUXT_FIREBASE_PROJECT_ID']
  if (projectId && !/^[a-z0-9-]+$/.test(projectId)) {
    result.warnings.push(
      'FIREBASE_PROJECT_ID should only contain lowercase letters, numbers, and hyphens'
    )
  }
}

/**
 * Validates color configuration
 */
function validateColorConfig(
  color: string,
  result: ConfigValidationResult,
  label = 'Primary color',
  required = true
) {
  const validNuxtColors = [
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
    'slate',
    'gray',
    'zinc',
    'neutral',
    'stone',
  ]

  if (!color || color.trim() === '') {
    if (required) {
      result.errors.push(`${label} is required`)
    }
    return
  }

  if (!validNuxtColors.includes(color)) {
    result.warnings.push(`${label} "${color}" is not a standard NuxtUI color`)
    result.suggestions.push(
      `Consider using one of: ${validNuxtColors.slice(0, 10).join(', ')}, etc.`
    )
  }
}

/**
 * Validates module configuration
 */
function validateModuleConfig(
  tenantModule: string,
  result: ConfigValidationResult
) {
  const validModules = ['fireux-misebox', 'fireux-cleanbox', 'fireux-places']

  if (!tenantModule || tenantModule.trim() === '') {
    result.errors.push('Tenant module is required')
  } else if (
    !validModules.includes(tenantModule) &&
    !tenantModule.startsWith('fireux-')
  ) {
    result.warnings.push(
      `Module "${tenantModule}" is not a known FireUX module`
    )
    result.suggestions.push(
      'Ensure your custom module follows the fireux-* naming convention'
    )
  }
}

/**
 * Gets NuxtUI color hex values
 */
export const NUXT_UI_COLORS = {
  red: 'EF4444',
  orange: 'F97316',
  amber: 'F59E0B',
  yellow: 'EAB308',
  lime: '84CC16',
  green: '22C55E',
  emerald: '10B981',
  teal: '14B8A6',
  cyan: '06B6D4',
  sky: '0EA5E9',
  blue: '3B82F6',
  indigo: '6366F1',
  violet: '8B5CF6',
  purple: 'A855F7',
  fuchsia: 'D946EF',
  pink: 'EC4899',
  rose: 'F43F5E',
  slate: '64748B',
  gray: '6B7280',
  zinc: '71717A',
  neutral: '737373',
  stone: '78716C',
}

/**
 * Converts NuxtUI color name to hex
 */
export function getColorHex(colorName: string): string {
  return NUXT_UI_COLORS[colorName as keyof typeof NUXT_UI_COLORS] || '000000'
}

/**
 * Generates standard nuxt.config.ts template
 */
export function generateNuxtConfig(config: ValidationTenantConfig): string {
  return `import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app',
  imports: {
    dirs: ['composables/**', 'models/**', 'utils/**'],
  },
  
  // Explicitly configure SSR for consistency
  ssr: true,
  
  modules: [
  'fireux-core',
    '${config.tenantModule}',
    '@nuxt/ui',
  '@nuxt/icon',
    'nuxt-vuefire',
  '@vite-pwa/nuxt',
  ],
  
  nitro: {},
  
  vuefire: {
    auth: {
      enabled: true,
      sessionCookie: true,
    },
    config: {
      apiKey: process.env.NUXT_FIREBASE_API_KEY || '',
      authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NUXT_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NUXT_FIREBASE_APP_ID || '',
      measurementId: process.env.NUXT_FIREBASE_MEASUREMENT_ID || '',
    },
    appCheck: process.env.NUXT_FIREBASE_RECAPTCHA_V3_KEY ? {
      provider: 'ReCaptchaV3',
      key: process.env.NUXT_FIREBASE_RECAPTCHA_V3_KEY,
      isTokenAutoRefreshEnabled: true,
    } : undefined,
    admin: {
      serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
    },
  },
})`
}

/**
 * Generates standard .env template
 */
export function generateEnvFile(config: ValidationTenantConfig): string {
  const colorHex = getColorHex(config.primaryColor)

  return `# Firebase Configuration (Server-side)
NUXT_FIREBASE_API_KEY=your_api_key_here
NUXT_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_FIREBASE_PROJECT_ID=your_project_id
NUXT_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NUXT_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NUXT_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NUXT_FIREBASE_RECAPTCHA_V3_KEY=
FIREBASE_SERVICE_ACCOUNT=

# App Configuration
PROJECT_NAME=${config.appName}
DOMAIN=http://localhost:3010
PIN=1234
APP_ID=${config.appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}
APP_NAME=${config.appName}
APP_SHORT_NAME=${config.appShortName}
APP_PRIMARY_COLOR=${colorHex}
APP_NEUTRAL_COLOR=64748B
APP_ICON=your_icon_name
AUTHOR_NAME=Your Team Name

# Optional API Keys
OPENAI_API_KEY_NAME=OPENAI_API_KEY
OPENAI_API_KEY=

# Optional Stripe Configuration
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=`
}

/**
 * Generates app.config.ts template
 */
export function generateAppConfig(config: ValidationTenantConfig): string {
  return `export default defineAppConfig({
  ui: {
    colors: {
      primary: '${config.primaryColor}',
      neutral: '${config.neutralColor ?? 'zinc'}',
    },
  },
})`
}

/**
 * Comprehensive configuration validation for runtime
 */
export function validateRuntimeConfig(): ConfigValidationResult {
  const result: ConfigValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    result.warnings.push(
      'Runtime validation should be performed in browser context'
    )
    return result
  }

  // Validate client-side Firebase config
  const requiredClientVars = [
    'NUXT_PUBLIC_FIREBASE_API_KEY',
    'NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NUXT_PUBLIC_FIREBASE_PROJECT_ID',
  ]

  requiredClientVars.forEach((varName) => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      try {
        // Use proper type assertion for Nuxt's global object
        const nuxtApp = (window as any).$nuxt
        const configKey = varName
          .replace('NUXT_PUBLIC_', '')
          .toLowerCase()
          .replace(/_/g, '')
        const value = nuxtApp?.$config?.public?.[configKey]

        if (!value) {
          result.errors.push(`Missing runtime config: ${varName}`)
        }
      } catch (error) {
        // Log error details for debugging
        console.warn('Config validation error:', error)
        result.warnings.push(`Could not validate client config for: ${varName}`)
      }
    }
  })

  result.isValid = result.errors.length === 0
  return result
}

"""

