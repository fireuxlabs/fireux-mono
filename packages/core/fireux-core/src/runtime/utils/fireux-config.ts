import type { NuxtConfig } from 'nuxt/schema'

type ModuleEntry = string | [string, Record<string, any>]

export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  modules?: ModuleEntry[]
  includeCore?: boolean // default true

  // Optional overrides (read from env by default)
  primaryColor?: string
  neutralColor?: string
  vuefire?: Record<string, any>
  pwa?: Record<string, any>
  compatibilityDate?: string
}

function dedupeKeepLast(mods: ModuleEntry[] = []): ModuleEntry[] {
  // Keep last occurrence so app-provided modules/options win
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

// Treat empty-string envs as undefined
const env = (k: string) => {
  const v = process.env[k]
  return v?.trim()?.length ? v : undefined
}

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const includeCore = opts.includeCore ?? true

  // Colors come from env unless explicitly overridden
  const primaryColor =
    opts.primaryColor ?? env('APP_PRIMARY_COLOR') ?? '#000000'
  const neutralColor = opts.neutralColor ?? env('APP_NEUTRAL_COLOR')

  // Defaults
  const vuefireDefaults = {
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
  }

  const pwaDefaults = {
    registerType: 'autoUpdate',
    // Enable PWA assets/types generation (components/composables like PwaAppleImage, #pwa)
    pwaAssets: {
      source: 'public/pwa.svg',
    },
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

  // Always-on modules (order matters)
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

  const config: NuxtConfig = {
    // FireUX app structure defaults
    srcDir: 'app',
    // composables only; models stay explicit-import-only
    imports: { dirs: ['composables/**', 'utils/**'] },
    // Ensure TS can resolve Nuxt virtual aliases like #imports and #build during typecheck
    typescript: {
      tsConfig: {
        compilerOptions: {
          // baseUrl is required for "paths" mappings in generated .nuxt/tsconfig to take effect
          baseUrl: '.',
        },
      },
    },

    modules,
    app: { head: { title: opts.appName } },
    runtimeConfig: {
      // server-only (JSON string accepted; OR rely on GOOGLE_APPLICATION_CREDENTIALS path env)
      firebaseServiceAccount: env('FIREBASE_SERVICE_ACCOUNT') || '',
      public: {
        ecosystem: opts.ecosystem,
        appName: opts.appName,
        appShortName: opts.appShortName,
        primaryColor,
        neutralColor,
        // expose to client plugin
        firebaseConfig: { ...(vuefireMerged.config || {}) },
        // minimal app settings
        appSettings: {
          appId, // may be undefined; that's okay
          ecosystem: opts.ecosystem,
        },
      },
    },
    compatibilityDate: (opts.compatibilityDate ??
      '2025-09-01') as unknown as NuxtConfig['compatibilityDate'],
  }

  return config
}
