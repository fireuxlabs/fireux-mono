// FILE: packages/core/fireux-core/src/runtime/plugins/firebase.server.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { getApps, initializeApp } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig() as any

  const ecosystem = config.public?.firebaseEcosystem?.firebase
  const firebaseApp = config.public?.firebaseApp

  if (!ecosystem?.apiKey) return
  if (!firebaseApp?.appId) return
  if (getApps().length) return

  // SSR needs DEFAULT app too (measurementId is harmless to include or omit)
  initializeApp({
    ...ecosystem,
    appId: firebaseApp.appId,
    measurementId: firebaseApp.measurementId,
  })
})