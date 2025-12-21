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

    const hasServiceAccount =
      typeof process.env.GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
      process.env.GOOGLE_APPLICATION_CREDENTIALS.length > 0

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
      console.info('[fireux-nuxtfire] vuefire configured: yes, auth enabled: yes')
    }

    // Canonical Firebase Web SDK init (client only).
    addPlugin({
      src: resolver.resolve('./runtime/plugins/firebase.client.ts'),
      mode: 'client',
    })
  },
})
