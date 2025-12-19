// FILE: packages/core/fireux-core/src/config/app/runtime.ts
import type { NuxtConfig } from 'nuxt/schema'

export type RuntimeApp = {
  id: string
  name: string
  shortName: string
  description: string
  domain: string
  role: 'global' | 'tenant'
  ecosystem: string
  modules: readonly string[]
}

export type RuntimeFirebaseEcosystem = {
  id: string
  name: string
  description: string
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
  }
}

export type RuntimeFirebaseApp = {
  appId: string
  measurementId?: string
}

export type RuntimePrivate = {
  developerPin?: string
}

export type RuntimeShape = {
  app?: Partial<RuntimeApp>
  firebaseEcosystem?: Partial<RuntimeFirebaseEcosystem>
  firebaseApp?: Partial<RuntimeFirebaseApp>
  private?: Partial<RuntimePrivate>
}

/**
 * This is the ecosystem-owned config shape living at:
 * packages/ecosystem/<eco>/src/config/firebase/ecosystem.config.ts
 *
 * Core must NOT import from ecosystem packages directly.
 * Ecosystems import their own config and pass it into setRuntimeFromEcosystemConfig().
 */
export type EcosystemFirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
}

export type FireuxEcosystemConfig = {
  id: string
  name: string
  description: string
  firebase: EcosystemFirebaseConfig
}

function ensure(nuxt: NuxtConfig) {
  const runtime = (nuxt.runtimeConfig ||= {} as any)
  const pub = (runtime.public ||= {} as any)
  return { runtime, pub }
}

export function setRuntime(nuxt: NuxtConfig, s: RuntimeShape) {
  const { runtime, pub } = ensure(nuxt)

  if (s.app) pub.fireux = { ...(pub.fireux || {}), ...s.app }

  if (s.firebaseEcosystem) {
    pub.firebaseEcosystem = {
      ...(pub.firebaseEcosystem || {}),
      ...s.firebaseEcosystem,
    }
  }

  if (s.firebaseApp) {
    pub.firebaseApp = { ...(pub.firebaseApp || {}), ...s.firebaseApp }
  }

  if (s.private) {
    runtime.fireux = { ...(runtime.fireux || {}), ...s.private }
  }
}

export function setRuntimeApp(nuxt: NuxtConfig, c: Partial<RuntimeApp>) {
  setRuntime(nuxt, { app: c })
}

export function setRuntimeFirebaseEcosystem(
  nuxt: NuxtConfig,
  c: Partial<RuntimeFirebaseEcosystem>
) {
  setRuntime(nuxt, { firebaseEcosystem: c })
}

export function setRuntimeFirebaseApp(
  nuxt: NuxtConfig,
  c: Partial<RuntimeFirebaseApp>
) {
  setRuntime(nuxt, { firebaseApp: c })
}

export function setRuntimePrivate(nuxt: NuxtConfig, c: Partial<RuntimePrivate>) {
  setRuntime(nuxt, { private: c })
}

/**
 * Ecosystem helper:
 * Pass the ecosystem config from:
 * packages/ecosystem/<eco>/src/config/firebase/ecosystem.config.ts
 */
export function setRuntimeFromEcosystemConfig(
  nuxt: NuxtConfig,
  eco: FireuxEcosystemConfig
) {
  setRuntimeFirebaseEcosystem(nuxt, {
    id: eco.id,
    name: eco.name,
    description: eco.description,
    firebase: {
      apiKey: eco.firebase.apiKey,
      authDomain: eco.firebase.authDomain,
      projectId: eco.firebase.projectId,
      storageBucket: eco.firebase.storageBucket,
      messagingSenderId: eco.firebase.messagingSenderId,
    },
  })
}