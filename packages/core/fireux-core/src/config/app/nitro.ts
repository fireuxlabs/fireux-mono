// packages/core/fireux-core/src/config/nitro.ts
import type { NuxtConfig } from '@nuxt/schema'

export type FireUXNitroConfig = {
  serverFunctionName: string
  region: string
  serviceAccount?: string
  secrets?: string[]
}

export function configNitroFirebase(nuxt: NuxtConfig, c: FireUXNitroConfig) {
  // TS-safe local handles (NuxtConfig's type won't reliably narrow on mutation)
  const nuxtWithNitro = nuxt as NuxtConfig & { nitro?: Record<string, any> }
  const nitro = ((nuxtWithNitro.nitro ||= {}) as any)

  // FireUX deploys on Node 22. Override Nitro's ES2019 transform default so
  // modern dependency output (including bigint literals) is preserved.
  nitro.esbuild ||= {}
  nitro.esbuild.options ||= {}
  nitro.esbuild.options.target = 'es2022'

  const isDev =
    process.env.NODE_ENV === 'development' || process.env.NUXT_DEV === 'true'

  if (isDev) {
    nitro.preset = 'node-server'
  } else {
    nitro.preset = 'firebase'

    // Google's Functions Framework reserves /robots.txt and returns 404 before
    // invoking an HTTP function. Project the Core handler into Hosting output;
    // Apps still declare policy through SEO config, never a second static file.
    nitro.prerender ||= {}
    nitro.prerender.routes = Array.from(
      new Set([...(nitro.prerender.routes || []), '/robots.txt'])
    )
    nitro.prerender.failOnError ??= true

    // Firebase preset options are not fully represented in Nuxt's TS union,
    // so we intentionally set this via `any` to match runtime behaviour.
    nitro.firebase = {
      gen: 2,
      nodeVersion: '22',
      serverFunctionName: c.serverFunctionName,
      region: c.region,
      // The Firebase preset reads deployment region from httpsOptions at runtime.
      httpsOptions: {
        region: c.region,
        ...(c.serviceAccount ? { serviceAccount: c.serviceAccount } : {}),
        ...(c.secrets?.length ? { secrets: c.secrets } : {}),
      },
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
