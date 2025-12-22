// FILE: packages/core/fireux-nuxtfire/src/module.ts
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

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

function ensureGoogleApplicationCredentialsEnv(nuxt: any): boolean {
  // nuxt-vuefire uses GOOGLE_APPLICATION_CREDENTIALS to decide whether it can
  // enable its SSR/admin plugins. In FireUX, our canonical contract is
  // FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_SERVICE_ACCOUNT_FILE (path).
  const existing = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (typeof existing === 'string' && existing.trim()) return true

  // First, try to load from the local ecosystem package (dev-friendly).
  // This is intentionally server-only and avoids leaking any credential contents.
  const ecoFile = pickEcoServiceAccountFilePath(nuxt)
  if (ecoFile) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = ecoFile
    return true
  }

  const file = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
  if (typeof file === 'string' && file.trim()) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = file.trim()
    return true
  }

  const inline = process.env.FIREBASE_SERVICE_ACCOUNT
  if (typeof inline === 'string' && inline.trim()) {
    const raw = inline.trim()
    if (raw.startsWith('{')) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = raw
      return true
    }

    // Some environments provide the service account JSON base64-encoded.
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf8').trim()
      if (decoded.startsWith('{')) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = decoded
        return true
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
    process.env.GOOGLE_APPLICATION_CREDENTIALS = JSON.stringify({
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    })
    return true
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

    const apiKey = eco.apiKey
    const authDomain = eco.authDomain
    const projectId = eco.projectId

    // Allow apps to run without Firebase (styling/dev). When enabled, these are
    // the minimum keys needed for Firebase Auth.
    if (!apiKey || !authDomain || !projectId) {
      if (isDev) {
        // eslint-disable-next-line no-console
        console.info('[fireux-nuxtfire] vuefire configured: no (missing firebaseEcosystem.firebase)')
      }
      return
    }

    ;(nuxt.options as any).vuefire = (nuxt.options as any).vuefire || {}

    ;(nuxt.options as any).vuefire.config = {
      apiKey,
      authDomain,
      projectId,
      ...(eco.storageBucket ? { storageBucket: eco.storageBucket } : {}),
      ...(eco.messagingSenderId ? { messagingSenderId: eco.messagingSenderId } : {}),
      ...(app.appId ? { appId: app.appId } : {}),
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
