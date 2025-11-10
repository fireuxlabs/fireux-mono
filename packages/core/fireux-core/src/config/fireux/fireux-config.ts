import type { NuxtConfig } from 'nuxt/schema'
import { resolve as pathResolve, dirname } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
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

type ServiceAccountPayload = {
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

  paths.add(
    pathResolve(
      workspaceRoot,
      `packages/tenants/${ecosystem}-${ecosystem}/config/service-account.json`
    )
  )
  paths.add(
    pathResolve(
      workspaceRoot,
      `packages/tenants/fireux-${ecosystem}/config/service-account.json`
    )
  )
  paths.add(
    pathResolve(
      workspaceRoot,
      `packages/tenants/${ecosystem}/config/service-account.json`
    )
  )

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

function readServiceAccount(
  ecosystem: string
): ServiceAccountPayload | undefined {
  return (
    readServiceAccountFromInline() ??
    readServiceAccountFromSplitEnv() ??
    readServiceAccountFromFiles(ecosystem)
  )
}

/**
 * Compute a single, stable workspace root to allow during dev when importing
 * package source via @fs. Safer than process.cwd() guesses.
 */
function resolveWorkspaceRoot() {
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
  const developerPin = env('PIN')

  const serviceAccount = readServiceAccount(ecosystem)
  const sa = serviceAccount?.credentials

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
      firebaseServiceAccount:
        serviceAccount?.json ?? env('FIREBASE_SERVICE_ACCOUNT'),
      public: {
        // flat fields used by FireUX runtime
        devMode: process.env.NODE_ENV !== 'production',
        ecosystem,
        appId,
        appName,
        appShortName,
        primaryColor,
        neutralColor,
        centralSignupUrl,
        appIcon,
        developerPin,
        firebaseConfig: { ...vuefireMerged.config },
        // legacy compatibility for older tenants
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
