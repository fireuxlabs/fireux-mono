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
