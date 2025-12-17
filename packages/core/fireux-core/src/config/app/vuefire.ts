import type { NuxtConfig } from 'nuxt/schema'

export type FireUXVuefireConfig = {
  firebaseConfig: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    measurementId?: string
  }
}

export function configVuefire(nuxt: NuxtConfig, c: FireUXVuefireConfig) {
  const isSsr = nuxt.ssr !== false
  const hasServiceAccount =
    typeof process.env.GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
    process.env.GOOGLE_APPLICATION_CREDENTIALS.trim().length > 0

  // nuxt-vuefire's SSR auth plugin requires a Firebase Admin app.
  // Without GOOGLE_APPLICATION_CREDENTIALS (or emulators), it will crash during SSR.
  const enableAuth = !isSsr || hasServiceAccount

  const runtimeConfig = (nuxt.runtimeConfig ||= {} as any)
  const pub = (runtimeConfig.public ||= {} as any)
  pub.firebaseConfig = c.firebaseConfig

  nuxt.modules ||= []
  nuxt.modules.push([
    'nuxt-vuefire',
    {
      auth: { enabled: enableAuth, sessionCookie: false },
      config: c.firebaseConfig,
    },
  ])
}
