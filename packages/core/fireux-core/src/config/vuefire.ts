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
  const runtimeConfig = (nuxt.runtimeConfig ||= {} as any)
  const pub = (runtimeConfig.public ||= {} as any)
  pub.firebaseConfig = c.firebaseConfig

  nuxt.modules ||= []
  nuxt.modules.push([
    'nuxt-vuefire',
    {
      auth: { enabled: true, sessionCookie: false },
      config: c.firebaseConfig,
    },
  ])
}
