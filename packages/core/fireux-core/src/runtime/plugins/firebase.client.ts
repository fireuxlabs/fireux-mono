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

  // Basic completeness check so developers immediately see if they forgot to paste values.
  function ensureConfigCompleteness(cfg: any) {
    if (!cfg) return
    const required = ['apiKey', 'authDomain', 'projectId', 'appId']
    const missing = required.filter(k => !cfg[k] || String(cfg[k]).trim() === '')
    if (missing.length) {
      devLog('CONFIG INCOMPLETE', {
        missing,
        message:
          'One or more required Firebase config fields are empty. Paste the full web app snippet into your FIREBASE_* env vars.',
      })
    }
  }

  // Lightweight coherence validation to catch mixed project credentials
  function validateConfig(cfg: any) {
    if (!cfg) return
  const { projectId, authDomain, storageBucket } = cfg
    const problems: string[] = []
    if (projectId && authDomain && !authDomain.startsWith(projectId)) {
      problems.push(
        `authDomain (${authDomain}) does not start with projectId (${projectId})`
      )
    }
    if (projectId && storageBucket && !storageBucket.startsWith(projectId)) {
      problems.push(
        `storageBucket (${storageBucket}) does not start with projectId (${projectId})`
      )
    }
    if (problems.length) {
      devLog('CONFIG MISMATCH DETECTED', { problems })
      // Provide a focused hint for common copy/paste mixups
      devLog(
        'Hint: Ensure ALL FIREBASE_* vars come from the SAME copied web app snippet in Firebase console.'
      )
    }

    // Extra heuristic: apiKey reuse across differing projectId patterns.
    // If apiKey present but authDomain or storageBucket refer to a *different* prefix, warn.
    // (Developers sometimes paste a new projectId but forget to swap apiKey/appId.)
  const apiKey = cfg.apiKey
    if (apiKey && projectId && authDomain && !authDomain.includes(projectId)) {
      devLog('POSSIBLE_CREDENTIAL_DRIFT', {
        message:
          'authDomain does not include projectId. This often indicates a mixed credential set (apiKey/appId from another project).',
        projectId,
        authDomain,
      })
    }
  const appId = cfg.appId
    if (appId && projectId && /[a-z0-9-]+/.test(projectId)) {
      // appId structure: 1:<senderId>:web:<hash>. Cannot easily encode projectId, so just surface for visual pairing.
      devLog('firebaseAppIdInfo', { appIdFragment: appId.split(':').slice(0, 3).join(':'), fullAppId: appId })
    }
  }
  if (import.meta.dev) {
    ensureConfigCompleteness(firebaseConfig)
    validateConfig(firebaseConfig)
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
