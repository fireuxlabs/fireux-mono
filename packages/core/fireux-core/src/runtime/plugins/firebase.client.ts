// FILE: packages/core/fireux-core/src/runtime/plugins/firebase.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { initializeApp, getApps } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const rc = useRuntimeConfig()
  const pub: any = rc.public || {}

  const eco = pub.firebaseEcosystem
  const app = pub.firebaseApp

  if (!eco?.firebase || !app?.appId) return

  const config = {
    apiKey: eco.firebase.apiKey,
    authDomain: eco.firebase.authDomain,
    projectId: eco.firebase.projectId,
    storageBucket: eco.firebase.storageBucket,
    messagingSenderId: eco.firebase.messagingSenderId,
    appId: app.appId,
    measurementId: app.measurementId,
  }

  if (!getApps().length) initializeApp(config)
})