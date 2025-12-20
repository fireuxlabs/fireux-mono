// FILE: packages/core/fireux-core/src/runtime/plugins/firebase.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { getApps, initializeApp } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const rc = useRuntimeConfig() as any

  const ecosystem = rc.public?.firebaseEcosystem?.firebase
  const firebaseApp = rc.public?.firebaseApp

  const apiKey = ecosystem?.apiKey
  const appId = firebaseApp?.appId

  // If we can't build a valid config, do nothing.
  if (!apiKey || !appId) return

  // Already initialised
  if (getApps().length) return

  initializeApp({
    apiKey: ecosystem.apiKey,
    authDomain: ecosystem.authDomain,
    projectId: ecosystem.projectId,
    storageBucket: ecosystem.storageBucket,
    messagingSenderId: ecosystem.messagingSenderId,
    appId: firebaseApp.appId,
    measurementId: firebaseApp.measurementId,
  })

  // Optional: confirm it ran (dev only)
  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.log('[fireux] firebase web app initialised', { appId })
  }
})