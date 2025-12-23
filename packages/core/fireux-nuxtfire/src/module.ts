// FILE: packages/core/fireux-nuxtfire/src/module.ts
import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

import { addPlugin, createResolver, defineNuxtModule, installModule } from '@nuxt/kit'

function findMonorepoRoot(startDir: string): string {
  let dir = startDir
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function pickFirebaseEcosystemId(nuxt: any): string | undefined {
  const runtime = (nuxt?.options?.runtimeConfig ?? {}) as any
  const pub = (runtime.public ?? {}) as any
  const id = pub?.firebaseEcosystem?.id
  return typeof id === 'string' && id.trim() ? id.trim() : undefined
}

function pickEcoServiceAccountFilePath(nuxt: any): string | undefined {
  const ecoId = pickFirebaseEcosystemId(nuxt)
  if (!ecoId) return

  const startDir =
    (typeof nuxt?.options?.rootDir === 'string' && nuxt.options.rootDir) || process.cwd()
  const root = findMonorepoRoot(startDir)

  // Ecosystem packages are typically under `packages/ecosystem/` and may be named:
  // - fireux-cleanbox (already prefixed)
  // - fireux-fireux   (derived from eco id: fireux)
  const candidates = [ecoId]
  if (!ecoId.startsWith('fireux-')) candidates.push(`fireux-${ecoId}`)

  for (const pkgName of candidates) {
    const p = join(
      root,
      'packages',
      'ecosystem',
      pkgName,
      'src',
      'config',
      'firebase',
      'service-account.json'
    )
    if (existsSync(p)) return p
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasServiceAccountPrivateKey(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false
  const anyPayload = payload as any
  return isNonEmptyString(anyPayload.private_key) || isNonEmptyString(anyPayload.privateKey)
}

function validateServiceAccountJsonString(value: string): boolean {
  try {
    const parsed = JSON.parse(value)
    return hasServiceAccountPrivateKey(parsed)
  } catch {
    return false
  }
}

function tryReadJsonFile(pathLike: string): string | null {
  const candidatePaths = [pathLike]
  if (!isAbsolute(pathLike)) {
    candidatePaths.push(resolve(process.cwd(), pathLike))
  }

  for (const p of candidatePaths) {
    if (!existsSync(p)) continue
    try {
      return readFileSync(p, 'utf8')
    } catch {
      return null
    }
  }

  return null
}

function validateGoogleApplicationCredentials(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  // vuefire supports parsing GOOGLE_APPLICATION_CREDENTIALS as inline JSON.
  if (trimmed.startsWith('{')) {
    return validateServiceAccountJsonString(trimmed)
  }

  // Otherwise treat it as a file path.
  const file = tryReadJsonFile(trimmed)
  if (!file) return false
  return validateServiceAccountJsonString(file)
}

function unsetGoogleApplicationCredentials(reason: string) {
  // Avoid crashing nuxt-vuefire SSR plugin when the env var points to a non
  // service-account JSON (e.g. OAuth client/user credentials without private_key).
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // eslint-disable-next-line no-console
    console.warn('[fireux-nuxtfire] Ignoring GOOGLE_APPLICATION_CREDENTIALS:', reason)
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS
  }
}

function ensureGoogleApplicationCredentialsEnv(nuxt: any): boolean {
  // nuxt-vuefire uses GOOGLE_APPLICATION_CREDENTIALS to decide whether it can
  // enable its SSR/admin plugins. In FireUX, our canonical contract is
  // FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_SERVICE_ACCOUNT_FILE (path).
  const existing = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (typeof existing === 'string' && existing.trim()) {
    if (validateGoogleApplicationCredentials(existing)) return true
    unsetGoogleApplicationCredentials('value is not a Firebase service-account (missing private_key)')
  }

  // First, try to load from the local ecosystem package (dev-friendly).
  // This is intentionally server-only and avoids leaking any credential contents.
  const ecoFile = pickEcoServiceAccountFilePath(nuxt)
  if (ecoFile) {
    if (validateGoogleApplicationCredentials(ecoFile)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = ecoFile
      return true
    }
  }

  const file = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
  if (typeof file === 'string' && file.trim()) {
    const trimmed = file.trim()
    if (validateGoogleApplicationCredentials(trimmed)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = trimmed
      return true
    }
  }

  const inline = process.env.FIREBASE_SERVICE_ACCOUNT
  if (typeof inline === 'string' && inline.trim()) {
    const raw = inline.trim()
    if (raw.startsWith('{')) {
      if (validateGoogleApplicationCredentials(raw)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = raw
        return true
      }
    }

    // Some environments provide the service account JSON base64-encoded.
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf8').trim()
      if (decoded.startsWith('{')) {
        if (validateGoogleApplicationCredentials(decoded)) {
          process.env.GOOGLE_APPLICATION_CREDENTIALS = decoded
          return true
        }
      }
    } catch {
      // ignore
    }
  }

  // Support split-key env format (canonical in parts of FireUX).
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim()
  if (projectId && clientEmail && privateKey) {
    const payload = JSON.stringify({
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    })
    if (validateGoogleApplicationCredentials(payload)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = payload
      return true
    }
  }

  return false
}

type FirebaseEcosystemConfig = {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
}

type FirebaseAppConfig = {
  appId?: string
  measurementId?: string
}

function requireNonEmpty(value: unknown, label: string): string {
  if (typeof value === 'string' && value.trim()) return value.trim()
  throw new Error(`[fireux-nuxtfire] Missing required Firebase config: ${label}`)
}

function pickFirebaseRuntime(nuxt: any) {
  const runtime = (nuxt?.options?.runtimeConfig ?? {}) as any
  const pub = (runtime.public ?? {}) as any

  const eco = (pub.firebaseEcosystem?.firebase ?? {}) as FirebaseEcosystemConfig
  const app = (pub.firebaseApp ?? {}) as FirebaseAppConfig

  return { eco, app }
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-nuxtfire',
    version: '0.1.0',
  },

  async setup(_options: unknown, nuxt: any) {
    const resolver = createResolver(import.meta.url)

    const isDev = !!(nuxt.options as any).dev

    // Ensure nuxt-vuefire can see the service account if FireUX has provided it.
    const hasServiceAccount = ensureGoogleApplicationCredentialsEnv(nuxt)

    const { eco, app } = pickFirebaseRuntime(nuxt)

    const apiKey = requireNonEmpty(eco.apiKey, 'public.firebaseEcosystem.firebase.apiKey')
    const authDomain = requireNonEmpty(
      eco.authDomain,
      'public.firebaseEcosystem.firebase.authDomain'
    )
    const projectId = requireNonEmpty(
      eco.projectId,
      'public.firebaseEcosystem.firebase.projectId'
    )
    const storageBucket = requireNonEmpty(
      eco.storageBucket,
      'public.firebaseEcosystem.firebase.storageBucket'
    )
    const messagingSenderId = requireNonEmpty(
      eco.messagingSenderId,
      'public.firebaseEcosystem.firebase.messagingSenderId'
    )
    const appId = requireNonEmpty(app.appId, 'public.firebaseApp.appId (env: NUXT_FIREBASE_APP_ID)')

    ;(nuxt.options as any).vuefire = (nuxt.options as any).vuefire || {}

    ;(nuxt.options as any).vuefire.config = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      ...(app.measurementId ? { measurementId: app.measurementId } : {}),
    }

    // Ensure VueFire Auth module is installed.
    const existingAuth = ((nuxt.options as any).vuefire.auth ?? {}) as any
    ;(nuxt.options as any).vuefire.auth = {
      ...existingAuth,
      enabled: true,
    }

    // Ensure `nuxt-vuefire` is installed AFTER we set `nuxt.options.vuefire`.
    // This removes ordering anxiety from app configs.
    const hasNuxtVuefireInModules = Array.isArray((nuxt.options as any).modules)
      ? ((nuxt.options as any).modules as any[]).some((m) =>
          Array.isArray(m) ? m[0] === 'nuxt-vuefire' : m === 'nuxt-vuefire'
        )
      : false

    if (!hasNuxtVuefireInModules) {
      // Install after we set `nuxt.options.vuefire`.
      await installModule('nuxt-vuefire')
    }

    // nuxt-vuefire installs its auth SSR plugin whenever auth is enabled.
    // When no service account is present, nuxt-vuefire won't install its own
    // admin plugin, so `$firebaseAdminApp` is missing and SSR 500s.
    //
    // IMPORTANT: addPlugin() prepends by default, so adding this AFTER
    // nuxt-vuefire ensures this plugin runs BEFORE nuxt-vuefire's plugins.
    if ((nuxt.options as any).ssr && !hasServiceAccount) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/firebase-admin-fallback.server.ts'),
        mode: 'server',
      })
    }

    if (isDev) {
      // eslint-disable-next-line no-console
      console.info('[fireux-nuxtfire] vuefire configured: yes, auth enabled: yes', {
        serviceAccount: hasServiceAccount ? 'yes' : 'no',
      })
    }

    // Canonical Firebase Web SDK init (client only).
    addPlugin({
      src: resolver.resolve('./runtime/plugins/firebase.client.ts'),
      mode: 'client',
    })
  },
})
