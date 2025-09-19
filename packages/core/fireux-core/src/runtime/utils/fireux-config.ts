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

  // Simple tenancy role (e.g. 'tenant' | 'global' | custom). Defaults to 'tenant'.
  role?: string
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

// Try to read a Firebase admin service account from either:
// - FIREBASE_SERVICE_ACCOUNT (JSON string), or
// - individual fields (PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY)
function readServiceAccount():
  | { projectId: string; clientEmail: string; privateKey: string }
  | undefined {
  // 1) JSON blob path
  const json = env('FIREBASE_SERVICE_ACCOUNT')
  if (json) {
    try {
      const parsed = JSON.parse(json)
      // Normalize common field names
      const projectId = parsed.project_id ?? parsed.projectId
      const clientEmail = parsed.client_email ?? parsed.clientEmail
      // Private key often needs \n unescape
      const rawKey = parsed.private_key ?? parsed.privateKey
      const privateKey =
        typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined
      if (projectId && clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey }
      }
    } catch {
      // fall through to split envs
    }
  }

  // 2) Split envs
  const projectId = env('FIREBASE_PROJECT_ID')
  const clientEmail = env('FIREBASE_CLIENT_EMAIL')
  const rawKey = env('FIREBASE_PRIVATE_KEY')
  const privateKey =
    typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey }
  }
  return undefined
}

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const includeCore = opts.includeCore ?? true

  // Colors come from env unless explicitly overridden
  const primaryColor =
    opts.primaryColor ?? env('APP_PRIMARY_COLOR') ?? '#000000'
  const neutralColor = opts.neutralColor ?? env('APP_NEUTRAL_COLOR')

  // Admin creds (optional, only set if fully present)
  const sa = readServiceAccount()

  // Defaults
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
    // 👉 Add admin only when properly configured to avoid noisy warnings
    ...(sa
      ? {
          admin: {
            serviceAccount: sa,
          },
        }
      : {}),
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
          appName: opts.appName,
          appShortName: opts.appShortName,
        },
        // Expose resolved modules list for runtime inspection
        modules: modules.map((m) => (Array.isArray(m) ? m[0] : m)),
        // Simple tenancy role (default 'tenant') exposed to client
        role: opts.role ?? 'tenant',
      },
    },
    compatibilityDate: (opts.compatibilityDate ??
      '2025-09-01') as unknown as NuxtConfig['compatibilityDate'],
  }

  return config
}
