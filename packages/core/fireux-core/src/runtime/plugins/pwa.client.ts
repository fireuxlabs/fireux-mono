import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import type { NuxtApp } from 'nuxt/app'
import { createPwaController } from '../utils/pwa-controller'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const runtime = useRuntimeConfig()
  const pwa = createPwaController({
    appId: runtime.public.fireux.id || 'app',
    baseURL: runtime.app.baseURL,
    production: !import.meta.dev,
  })
  void pwa.start()
  nuxtApp.vueApp.onUnmount(pwa.dispose)
  return { provide: { fireuxPwa: pwa } }
})
