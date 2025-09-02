import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app'

// Minimal Firebase app initializer.
// VueFire handles auth; do not initialize or touch auth here.
export default defineNuxtPlugin(() => {
  const { public: { firebaseConfig } } = useRuntimeConfig()

  // HMR-safe: only initialize if no app exists; otherwise ensure default app is accessible
  if (!getApps().length) {
    try {
      initializeApp(firebaseConfig as FirebaseOptions)
    } catch (e) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error('[fireux-core/firebase] initializeApp failed', e)
      }
      throw e
    }
  } else {
    try {
      getApp()
    } catch (e) {
      // Should not happen, but keep a safe guard in dev
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.warn('[fireux-core/firebase] getApp failed unexpectedly', e)
      }
    }
  }
})
