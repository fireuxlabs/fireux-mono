// FILE: packages/core/fireux-nuxtfire/src/runtime/plugins/firebase.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { getApps, initializeApp } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const rc = useRuntimeConfig() as any

  const ecosystem = rc.public?.firebaseEcosystem?.firebase
  const firebaseApp = rc.public?.firebaseApp

  const apiKey = ecosystem?.apiKey
  const authDomain = ecosystem?.authDomain
  const projectId = ecosystem?.projectId
  const appId = firebaseApp?.appId

  // For auth, apiKey + authDomain + projectId are sufficient.
  if (!apiKey || !authDomain || !projectId) return

  // Already initialised.
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

  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.log('[fireux-nuxtfire] firebase web app initialised', { appId })
  }
})
