<!--
source: config-report.md (repo root)
imported: 2025-12-08
note: moved from repo root during doc cleanup
-->

# FireUX Config Report
Authority: Tier3 (Tooling/history)
Updated: 2026-03-02

## packages/core/fireux-core/src/config/fireux/fireux-config.ts

```typescript
import type { NuxtConfig } from 'nuxt/schema'
import { resolveFireuxNuxtSetup } from './tenant-context'
import type { TenantConfig } from './tenant-config'

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const setup = resolveFireuxNuxtSetup(opts)

  return {
    srcDir: 'app',
    imports: { dirs: ['composables/**', 'utils/**'] },
    modules: setup.modules,
    app: { head: { title: setup.appName } },
    runtimeConfig: setup.runtimeConfig,
    compatibilityDate: setup.compatibilityDate,
    vite: setup.vite,
    nitro: setup.nitro,
  }
}
```

## packages/core/fireux-core/src/config/fireux/tenant-config.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/tenant-basics.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/tenant-theme.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/tenant-integrations.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/tenant-modules.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/tenant-runtime.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/tenant-vite.ts

```typescript
import type { NuxtConfig } from 'nuxt/schema'
import { resolveWorkspaceRoot } from './env'

export function resolveTenantVite(
  devMode: boolean
): NuxtConfig['vite'] | undefined {
  if (!devMode) return undefined

  return { server: { fs: { allow: [resolveWorkspaceRoot()] } } }
}
```

## packages/core/fireux-core/src/config/fireux/tenant-context.ts

```typescript
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
  modules: ModuleEntry[]
  runtimeConfig: NonNullable<NuxtConfig['runtimeConfig']>
  compatibilityDate: NuxtConfig['compatibilityDate']
  vite?: NuxtConfig['vite']
  nitro: NuxtConfig['nitro']
}

const DEFAULT_COMPATIBILITY_DATE = '2025-12-01'

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
```

## packages/core/fireux-core/src/config/fireux/nitro-config.ts

```typescript
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
    const defaults = { gen: 2, nodeVersion: '22' }
    nitro.firebase = { ...defaults, ...(nitro.firebase ?? {}) }
    nitro.externals = mergeNitroExternals(
      nitro.externals,
      firebaseNitroExternalPackages
    )
  }

  return nitro
}
```

## packages/core/fireux-core/src/config/fireux/module-utils.ts

```typescript
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

  const additionSet = new Set(additions)

  if (externals === false) {
    return false
  }

  if (externals === undefined || externals === true) {
    return { external: Array.from(additionSet) }
  }

  if (Array.isArray(externals)) {
    for (const item of externals) additionSet.add(item)
    return Array.from(additionSet)
  }

  const next = { ...externals }
  const current = Array.isArray(next.external)
    ? next.external
    : next.external
    ? [next.external]
    : []

  for (const item of current) additionSet.add(item)

  next.external = Array.from(additionSet)

  return next
}
```

## packages/core/fireux-core/src/config/fireux/runtime-config.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/env.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/service-account.ts

```typescript
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
```

## packages/core/fireux-core/src/config/fireux/vuefire-config.ts

```typescript
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
    auth: { sessionCookie: false },
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
```

## packages/core/fireux-core/src/config/fireux/pwa-config.ts

```typescript
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
```
