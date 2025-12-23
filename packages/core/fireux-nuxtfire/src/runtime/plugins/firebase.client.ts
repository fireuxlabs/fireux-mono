// FILE: packages/core/fireux-nuxtfire/src/runtime/plugins/firebase.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { getApps, initializeApp } from 'firebase/app'

function requireNonEmpty(value: unknown, label: string): string {
  if (typeof value === 'string' && value.trim()) return value.trim()
  throw new Error(`[fireux-nuxtfire] Missing required Firebase runtime config: ${label}`)
}

export default defineNuxtPlugin(() => {
  const rc = useRuntimeConfig() as any

  const ecosystem = rc.public?.firebaseEcosystem?.firebase
  const firebaseApp = rc.public?.firebaseApp

  const apiKey = requireNonEmpty(
    ecosystem?.apiKey,
    'public.firebaseEcosystem.firebase.apiKey'
  )
  const authDomain = requireNonEmpty(
    ecosystem?.authDomain,
    'public.firebaseEcosystem.firebase.authDomain'
  )
  const projectId = requireNonEmpty(
    ecosystem?.projectId,
    'public.firebaseEcosystem.firebase.projectId'
  )
  const storageBucket = requireNonEmpty(
    ecosystem?.storageBucket,
    'public.firebaseEcosystem.firebase.storageBucket'
  )
  const messagingSenderId = requireNonEmpty(
    ecosystem?.messagingSenderId,
    'public.firebaseEcosystem.firebase.messagingSenderId'
  )
  const appId = requireNonEmpty(
    firebaseApp?.appId,
    'public.firebaseApp.appId (env: NUXT_FIREBASE_APP_ID)'
  )

  // Already initialised.
  if (getApps().length) return

  initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(firebaseApp?.measurementId ? { measurementId: firebaseApp.measurementId } : {}),
  })

  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.log('[fireux-nuxtfire] firebase web app initialised', { appId })
  }
})
