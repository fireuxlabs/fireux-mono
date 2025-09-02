import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import type { FirebaseOptions } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const {
    public: { firebaseConfig },
  } = useRuntimeConfig()

  if (import.meta.dev) {
    const cfg = (firebaseConfig || {}) as Partial<FirebaseOptions>
    const redacted = cfg.apiKey
      ? String(cfg.apiKey).slice(0, 6) + '…'
      : undefined
    // eslint-disable-next-line no-console
    console.log('[fireux-core/firebase] config', {
      projectId: cfg.projectId,
      apiKey: redacted,
    })
  }

  let app
  try {
    app = getApps().length
      ? getApp()
      : initializeApp(firebaseConfig as FirebaseOptions)
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.log('[fireux-core/firebase] app ready', { name: app.name })
    }
  } catch (e) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error('[fireux-core/firebase] initializeApp failed', e)
    }
    throw e
  }
  const auth = getAuth(app)

  if (import.meta.client) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth)
        } catch {
          /* noop in dev */
        }
      }
    })
  }
})
