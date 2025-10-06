# FireUX Core Config Report

This report captures the full source for each configuration utility located in `packages/core/fireux-core/src/config`.

## `packages/core/fireux-core/src/config/assets-config.ts`

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

## `packages/core/fireux-core/src/config/components-config.ts`

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

## `packages/core/fireux-core/src/config/composables-config.ts`

```ts
import { addImportsDir, type Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  addImportsDir(resolver.resolve('./runtime/composables'))
  addImportsDir(resolver.resolve('./runtime/composables/**'))
}
```

## `packages/core/fireux-core/src/config/errors-config.ts`

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

## `packages/core/fireux-core/src/config/layouts-config.ts`

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
    'docs',
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

## `packages/core/fireux-core/src/config/models-config.ts`

```ts
// Models are not auto-imported. Keep explicit imports for clarity.
export function configureModels(_resolver: any, _nuxt: any) {
  // no-op
}
```

## `packages/core/fireux-core/src/config/pages-config.ts`

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
}
```

## `packages/core/fireux-core/src/config/plugins-config.ts`

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

## `packages/core/fireux-core/src/config/runtime-config.ts`

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

## `packages/core/fireux-core/src/config/server-config.ts`

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

## `packages/core/fireux-core/src/config/fireux/config-validation.ts`

```ts
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
  primaryColor: string,
  result: ConfigValidationResult
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

  if (!primaryColor || primaryColor.trim() === '') {
    result.errors.push('Primary color is required')
  } else if (!validNuxtColors.includes(primaryColor)) {
    result.warnings.push(
      `Primary color "${primaryColor}" is not a standard NuxtUI color`
    )
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
      neutral: 'zinc',
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
```

## `packages/core/fireux-core/src/config/fireux/fireux-config.ts`

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
        ecosystem: opts.ecosystem,
        appName: opts.appName,
        appShortName: opts.appShortName,
        primaryColor,
        neutralColor,
        firebaseConfig: { ...(vuefireMerged.config || {}) },
        appSettings: {
          appId,
          ecosystem: opts.ecosystem,
          appName: opts.appName,
          appShortName: opts.appShortName,
        },
        modules: modules.map((m) => (Array.isArray(m) ? m[0] : m)),
        role: opts.role ?? 'tenant',
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
