// FILE: packages/core/fireux-core/config/app/vuefire.ts
import type { NuxtConfig } from 'nuxt/schema'

function pickRuntime(nuxt: any) {
  const root = (nuxt?.options ?? nuxt) as any
  const rc = (root.runtimeConfig || {}) as any
  const pub = (rc.public || {}) as any
  return { rc, pub }
}

function hasString(value: unknown): value is string {
  return typeof value === 'string' && !!value.trim()
}

export function configVuefire(nuxt: NuxtConfig | any) {
  const { pub } = pickRuntime(nuxt)

  const eco = pub.firebaseEcosystem?.firebase || {}
  const app = pub.firebaseApp || {}

  const apiKey = hasString(eco.apiKey) ? eco.apiKey.trim() : undefined
  const authDomain = hasString(eco.authDomain) ? eco.authDomain.trim() : undefined
  const projectId = hasString(eco.projectId) ? eco.projectId.trim() : undefined
  const storageBucket = hasString(eco.storageBucket)
    ? eco.storageBucket.trim()
    : undefined
  const messagingSenderId = hasString(eco.messagingSenderId)
    ? eco.messagingSenderId.trim()
    : undefined
  const appId = hasString(app.appId) ? app.appId.trim() : undefined

  // Allow apps to run without Firebase (e.g. local styling/dev) when ecosystem
  // credentials are not provided.
  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return
  }

  const measurementId =
    typeof app.measurementId === 'string' && app.measurementId.trim()
      ? app.measurementId.trim()
      : undefined

  const root = ((nuxt as any)?.options ?? nuxt) as any
  root.vuefire = root.vuefire || {}
  root.vuefire.config = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  }
}