import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
} from 'firebase/app'

// Minimal Firebase app initializer.
// VueFire handles auth; do not initialize or touch auth here.
export default defineNuxtPlugin(() => {
  const {
    public: { firebaseConfig },
  } = useRuntimeConfig()

  // HMR-safe: only initialize if no app exists; otherwise ensure default app is accessible
  const devLog = (...args: any[]) => {
    if (import.meta.dev) console.log('[fireux-core/firebase]', ...args)
  }

  const start = performance.now()
  if (import.meta.dev) {
    const { projectId, appId } = (firebaseConfig || {}) as any
    devLog('plugin start', {
      existingApps: getApps().length,
      projectId,
      appId,
      hasConfig: !!firebaseConfig,
    })
  }

  if (!getApps().length) {
    try {
      initializeApp(firebaseConfig as FirebaseOptions)
      devLog('initialized new Firebase app')
    } catch (e) {
      devLog('initializeApp failed', e)
      throw e
    }
  } else {
    try {
      const app = getApp()
      devLog('re-using existing Firebase app', { name: app.name })
    } catch (e) {
      devLog('getApp failed unexpectedly', e)
    }
  }

  // Expose for in-browser debugging (non-production only)
  if (import.meta.dev && typeof window !== 'undefined') {
    try {
      // @ts-ignore Debug handle
      window.__fireuxFirebaseApp = getApp()
      devLog('attached app to window.__fireuxFirebaseApp')
    } catch (e) {
      devLog('failed attaching app to window', e)
    }
  }

  devLog('plugin end', { ms: Math.round(performance.now() - start) })
})
