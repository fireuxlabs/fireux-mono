// FILE: packages/core/fireux-nuxtfire/src/module.ts
import { addPlugin, createResolver, defineNuxtModule, installModule } from '@nuxt/kit'

type FirebaseEcosystemConfig = {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
}

type FirebaseAppConfig = {
  apiKey?: string
  appId?: string
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

    const { eco, app } = pickFirebaseRuntime(nuxt)

    const apiKey = requireNonEmpty(
      app.apiKey || eco.apiKey,
      'public.firebaseApp.apiKey or public.firebaseEcosystem.firebase.apiKey'
    )
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
    }

    // nuxt-vuefire's SSR plugin reads from runtimeConfig.public.vuefire.config.
    // Populate it here to avoid SSR 500s if nuxt-vuefire doesn't inject it
    // (or if injection order varies across Nuxt versions).
    ;(nuxt.options as any).runtimeConfig = (nuxt.options as any).runtimeConfig || {}
    ;(nuxt.options as any).runtimeConfig.public = (nuxt.options as any).runtimeConfig.public || {}
    ;(nuxt.options as any).runtimeConfig.public.vuefire =
      (nuxt.options as any).runtimeConfig.public.vuefire || {}
    ;(nuxt.options as any).runtimeConfig.public.vuefire.config =
      (nuxt.options as any).vuefire.config

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

    if (hasNuxtVuefireInModules) {
      throw new Error(
        '[fireux-nuxtfire] Remove direct nuxt-vuefire registration; fireux-nuxtfire installs it with safe Firebase Admin credential handling.'
      )
    }

    // nuxt-vuefire uses GOOGLE_APPLICATION_CREDENTIALS only as a boolean
    // signal while registering its SSR plugins, but later assumes the value is
    // a service-account key and may log inline JSON. Give registration a safe,
    // non-secret sentinel, then restore the real ADC environment. FireUX's
    // prepended server plugin owns Admin initialization before VueFire runs.
    const googleApplicationCredentials =
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '{"fireux_managed":true}'
    try {
      await installModule('nuxt-vuefire')
    } finally {
      if (googleApplicationCredentials === undefined) {
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS
      } else {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = googleApplicationCredentials
      }
    }

    // nuxt-vuefire's server auth plugin expects `$firebaseAdminApp`. FireUX
    // owns Admin initialization so ADC and external explicit credentials share
    // one safe path and the configured Firebase project is always supplied.
    //
    // IMPORTANT: addPlugin() prepends by default, so adding this AFTER
    // nuxt-vuefire ensures this plugin runs BEFORE nuxt-vuefire's plugins.
    if ((nuxt.options as any).ssr) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/firebase-admin-fallback.server.ts'),
        mode: 'server',
      })
    }

    addPlugin({
      src: resolver.resolve('./runtime/plugins/firebase-auth-persistence.client.ts'),
      mode: 'client',
    })

    if (isDev) {
      console.info('[fireux-nuxtfire] vuefire configured: yes, auth enabled: yes')
    }

  },
})
