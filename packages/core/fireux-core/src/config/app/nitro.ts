// packages/core/fireux-core/src/config/nitro.ts
import type { NuxtConfig } from 'nuxt/schema'

export type FireUXNitroConfig = {
  serverFunctionName: string
  region: string
}

export function configNitroFirebase(nuxt: NuxtConfig, c: FireUXNitroConfig) {
  // TS-safe local handles (NuxtConfig's type won't reliably narrow on mutation)
  const nitro = ((nuxt.nitro ||= {}) as any)

  const isDev =
    process.env.NODE_ENV === 'development' || process.env.NUXT_DEV === 'true'

  if (isDev) {
    nitro.preset = 'node-server'
  } else {
    nitro.preset = 'firebase'

    // Firebase preset options are not fully represented in Nuxt's TS union,
    // so we intentionally set this via `any` to match runtime behaviour.
    nitro.firebase = {
      gen: 2,
      nodeVersion: '22',
      serverFunctionName: c.serverFunctionName,
      region: c.region,
    }
  }

  nitro.externals ||= {}
  nitro.externals.external ||= []

  nitro.externals.external.push(
    'firebase-admin',
    'firebase-functions',
    '@google-cloud/firestore',
    '@google-cloud/storage'
  )
}
