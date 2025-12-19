// FILE: packages/core/fireux-core/src/config/app/vuefire.ts
import type { NuxtConfig } from 'nuxt/schema'

export type RuntimeFirebaseEcosystemFirebase = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
}

export type RuntimeFirebaseApp = {
  appId: string
  measurementId?: string
}

export type FireUXFirebaseWebConfig = RuntimeFirebaseEcosystemFirebase &
  RuntimeFirebaseApp

export type FireUXVuefireConfig = {
  ecosystem: RuntimeFirebaseEcosystemFirebase
  app: RuntimeFirebaseApp
}

function reqString(label: string, v: unknown): string {
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`[fireux] Missing firebase config: ${label}`)
  }
  return v.trim()
}

export function configVuefire(nuxt: NuxtConfig, c: FireUXVuefireConfig) {
  // ✅ log BEFORE any throw (this runs during nuxt.config evaluation)
  // Keep it tight: only the props we care about.
  console.log('[fireux/vuefire] input.ecosystem', {
    apiKey: c?.ecosystem?.apiKey,
    authDomain: c?.ecosystem?.authDomain,
    projectId: c?.ecosystem?.projectId,
    storageBucket: c?.ecosystem?.storageBucket,
    messagingSenderId: c?.ecosystem?.messagingSenderId,
  })
  console.log('[fireux/vuefire] input.app', {
    appId: c?.app?.appId,
    measurementId: c?.app?.measurementId,
  })

  // Validate inputs (so failures are *here*, not later)
  const firebase: FireUXFirebaseWebConfig = {
    apiKey: reqString('apiKey', c?.ecosystem?.apiKey),
    authDomain: reqString('authDomain', c?.ecosystem?.authDomain),
    projectId: reqString('projectId', c?.ecosystem?.projectId),
    storageBucket: reqString('storageBucket', c?.ecosystem?.storageBucket),
    messagingSenderId: reqString(
      'messagingSenderId',
      c?.ecosystem?.messagingSenderId
    ),
    appId: reqString('appId', c?.app?.appId),
    measurementId:
      typeof c?.app?.measurementId === 'string'
        ? c.app.measurementId.trim() || undefined
        : undefined,
  }

  // Populate public runtime for debugging + client plugin use
  const rc = (nuxt.runtimeConfig ||= {} as any)
  const pub = (rc.public ||= {} as any)
  pub.vuefire ||= {}
  pub.vuefire.config = firebase

  // Minimal nuxt-vuefire wiring
  nuxt.modules ||= []
  nuxt.modules.push([
    'nuxt-vuefire',
    {
      auth: { enabled: false, sessionCookie: false },
      config: firebase,
    },
  ])
}