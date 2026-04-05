// FILE: packages/core/fireux-core/config/app/runtime.ts
import type { NuxtConfig } from '@nuxt/schema'
import type { FireuxSeoConfig } from './seo'
import type { FireuxMetaContent } from '../../runtime/models/system/meta-content.model'

export type RuntimeAppRole = 'global' | 'tenant' | 'standalone'

export type RuntimeApp = {
  id: string
  name: string
  shortName: string
  /** Optional app thumbnail path/URL (e.g. /img/app/thumbnail.png). */
  appThumbnail?: string
  /** Optional app logo path/URL (preferred over appThumbnail for listings). */
  appLogo?: string
  /** Optional public contact/support email shown in shared UI (e.g. footer). */
  contactEmail?: string
  domain: string
  /** Optional canonical origin used for SEO surfaces (e.g. https://fireux.app). */
  siteUrl?: string
  role: RuntimeAppRole
  ecosystem: string
  modules: readonly string[]
  consoleFamilies?: readonly string[]
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
    databaseId?: string
  }
}

export type RuntimeFirebaseApp = {
  appId: string
  measurementId?: string
}

export type RuntimePrivate = {
  developerPin?: string
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}

export type RuntimeShape = {
  app?: Partial<RuntimeApp>
  firebaseEcosystem?: Partial<RuntimeFirebaseEcosystem>
  firebaseApp?: Partial<RuntimeFirebaseApp>
  private?: Partial<RuntimePrivate>
}

// Supports BOTH:
// - NuxtConfig object (nuxt.config.ts time)  -> nuxt.runtimeConfig
// - Nuxt instance (module setup time)        -> nuxt.options.runtimeConfig
function ensure(nuxt: any) {
  const root = (nuxt?.options ?? nuxt) as any
  const runtime = (root.runtimeConfig ||= {} as any)
  const pub = (runtime.public ||= {} as any)
  return { runtime, pub }
}

export function setRuntime(nuxt: NuxtConfig | any, s: RuntimeShape) {
  const { runtime, pub } = ensure(nuxt)

  if (s.app) pub.fireux = { ...(pub.fireux || {}), ...s.app }
  if (s.firebaseEcosystem)
    pub.firebaseEcosystem = {
      ...(pub.firebaseEcosystem || {}),
      ...s.firebaseEcosystem,
    }
  if (s.firebaseApp)
    pub.firebaseApp = { ...(pub.firebaseApp || {}), ...s.firebaseApp }
  if (s.private) runtime.fireux = { ...(runtime.fireux || {}), ...s.private }
}

export function setRuntimeApp(nuxt: NuxtConfig | any, c: Partial<RuntimeApp>) {
  setRuntime(nuxt, { app: c })
}

export function setRuntimeFirebaseEcosystem(
  nuxt: NuxtConfig | any,
  c: Partial<RuntimeFirebaseEcosystem>
) {
  setRuntime(nuxt, { firebaseEcosystem: c })
}

export function setRuntimeFirebaseApp(
  nuxt: NuxtConfig | any,
  c: Partial<RuntimeFirebaseApp>
) {
  setRuntime(nuxt, { firebaseApp: c })
}

export function setRuntimePrivate(
  nuxt: NuxtConfig | any,
  c: Partial<RuntimePrivate>
) {
  setRuntime(nuxt, { private: c })
}
