// FILE: packages/core/fireux-core/config/app/vuefire.ts
import type { NuxtConfig } from 'nuxt/schema'

function pickRuntime(nuxt: any) {
  const root = (nuxt?.options ?? nuxt) as any
  const rc = (root.runtimeConfig || {}) as any
  const pub = (rc.public || {}) as any
  return { rc, pub, root }
}

function hasString(value: unknown): value is string {
  return typeof value === 'string' && !!value.trim()
}

function firstString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (hasString(value)) return value.trim()
  }
  return undefined
}

export function configVuefire(nuxt: NuxtConfig | any) {
  const { pub, root } = pickRuntime(nuxt)

  const eco = pub.firebaseEcosystem?.firebase || {}
  const app = pub.firebaseApp || {}

  // Prefer runtime-injected ecosystem config (from ecosystem modules) but fall back to
  // env vars so this can run during Nuxt config assembly (before modules execute).
  const apiKey = firstString(eco.apiKey, process.env.NUXT_FIREBASE_API_KEY)
  const authDomain = firstString(eco.authDomain, process.env.NUXT_FIREBASE_AUTH_DOMAIN)
  const projectId = firstString(eco.projectId, process.env.NUXT_FIREBASE_PROJECT_ID)

  // Optional (keep auth working even if not provided)
  const storageBucket = firstString(eco.storageBucket, process.env.NUXT_FIREBASE_STORAGE_BUCKET)
  const messagingSenderId = firstString(
    eco.messagingSenderId,
    process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID
  )
  const appId = firstString(app.appId, process.env.NUXT_FIREBASE_APP_ID)

  // Allow apps to run without Firebase (e.g. local styling/dev).
  // For auth, apiKey + authDomain + projectId are sufficient.
  if (!apiKey || !authDomain || !projectId) return

  const measurementId = firstString(app.measurementId, process.env.NUXT_FIREBASE_MEASUREMENT_ID)

  root.vuefire = root.vuefire || {}

  // ✅ Enable Auth module so useCurrentUser() works.
  // In Nuxt VueFire, auth should be an object (or true in some versions),
  // but using the object form is safest + extendable.
  root.vuefire.auth = {
    enabled: true,

    // ✅ Cookies are used for SSR auth state handoff.
    // If you want to disable SSR cookies later, set enabled:false.
    sessionCookie: true,
  }

  root.vuefire.config = {
    apiKey,
    authDomain,
    projectId,
    ...(storageBucket ? { storageBucket } : {}),
    ...(messagingSenderId ? { messagingSenderId } : {}),
    ...(appId ? { appId } : {}),
    ...(measurementId ? { measurementId } : {}),
  }
}