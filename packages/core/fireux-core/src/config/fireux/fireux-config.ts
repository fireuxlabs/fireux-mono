import type { NuxtConfig } from 'nuxt/schema'
import { resolve as pathResolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

type ModuleEntry = string | [string, Record<string, any>]

export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  role: 'global' | 'tenant'
  modules?: ModuleEntry[]
  includeCore?: boolean
  primaryColor?: string
  neutralColor?: string
  vuefire?: Record<string, any>
  pwa?: Record<string, any>
  compatibilityDate?: string
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

const requireEnv = (key: string) => {
  const value = env(key)
  if (!value) {
    throw new Error(`[fireux] Environment variable ${key} is required.`)
  }
  return value
}

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

  const ecosystem = opts.ecosystem.trim()
  if (!ecosystem) {
    throw new Error('[fireux] createFireuxConfig requires an ecosystem name.')
  }

  const appName = opts.appName.trim()
  if (!appName) {
    throw new Error('[fireux] createFireuxConfig requires appName.')
  }

  const appShortName = opts.appShortName.trim()
  if (!appShortName) {
    throw new Error('[fireux] createFireuxConfig requires appShortName.')
  }

  const role = opts.role

  const primaryColor = opts.primaryColor ?? env('APP_PRIMARY_COLOR')
  const neutralColor = opts.neutralColor ?? env('APP_NEUTRAL_COLOR')
  const centralSignupUrl = env('CENTRAL_SIGNUP_URL')
  const appIcon = env('APP_ICON')

  const sa = readServiceAccount()

  const vuefireDefaults: Record<string, any> = {
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

  const appId = requireEnv('APP_ID')
  const globalAppId = ecosystem ? `${ecosystem}-app` : undefined

  // dev-only, minimal Vite fs.allow: just the workspace root
  const devFsAllow =
    process.env.NODE_ENV !== 'production' ? [resolveWorkspaceRoot()] : []

  const config: NuxtConfig = {
    srcDir: 'app',
    imports: { dirs: ['composables/**', 'utils/**'] },

    modules,
    app: { head: { title: appName } },

    runtimeConfig: {
      googlePlacesApiKey: env('GOOGLE_PLACES_API_KEY'),
      firebaseServiceAccount: env('FIREBASE_SERVICE_ACCOUNT'),
      public: {
        ecosystem,
        appName,
        appShortName,
        primaryColor,
        neutralColor,
        centralSignupUrl,
        appIcon,
        firebaseConfig: { ...(vuefireMerged.config || {}) },
        appSettings: {
          appId,
          ecosystem,
          appName,
          appShortName,
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
