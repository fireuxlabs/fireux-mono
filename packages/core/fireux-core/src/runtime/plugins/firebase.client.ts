// FILE: packages/core/fireux-core/src/runtime/plugins/firebase.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { getApps, initializeApp } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const rc = useRuntimeConfig() as any

  const ecosystem = rc.public?.firebaseEcosystem?.firebase
  const firebaseApp = rc.public?.firebaseApp

  const apiKey = ecosystem?.apiKey
  const authDomain = ecosystem?.authDomain
  const projectId = ecosystem?.projectId
  const appId = firebaseApp?.appId

  // If we can't build a valid config, do nothing.
  // For auth, apiKey + authDomain + projectId are sufficient.
  if (!apiKey || !authDomain || !projectId) return

  // Already initialised
  if (getApps().length) return

  initializeApp({
    apiKey,
    authDomain,
    projectId,
    ...(ecosystem?.storageBucket ? { storageBucket: ecosystem.storageBucket } : {}),
    ...(ecosystem?.messagingSenderId
      ? { messagingSenderId: ecosystem.messagingSenderId }
      : {}),
    ...(appId ? { appId } : {}),
    ...(firebaseApp?.measurementId ? { measurementId: firebaseApp.measurementId } : {}),
  })

  // Optional: confirm it ran (dev only)
  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.log('[fireux] firebase web app initialised', { appId })
  }
})