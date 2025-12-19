// FILE: packages/core/fireux-core/config/app/fireux.config.ts
import type { NuxtConfig } from 'nuxt/schema'

import { setRuntime } from './runtime'
import { configVuefire } from './vuefire'

// ⛔️ commented out for this mission (env + runtime wiring only)
// import { configPwa } from './pwa'
// import { configNitroFirebase } from './nitro'
// import { configViteWorkspace } from './vite'

export type FireuxAppConfig = {
  ecosystem: string
  id: string
  name: string
  shortName: string
  description: string
  role: 'global' | 'tenant'
  modules?: string[]
}

export function defineFireuxConfig(app: FireuxAppConfig): NuxtConfig {
  const nuxt: NuxtConfig = {}

  nuxt.srcDir = 'app'
  nuxt.imports = { dirs: ['composables/**', 'utils/**'] }

  nuxt.modules = [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/content',
    'fireux-core',
    `fireux-${app.ecosystem}`,
    ...(app.modules || []),
  ]

  // ─────────────────────────────────────────────
  // 🔎 MISSION: prove env is (or isn't) available here
  // ─────────────────────────────────────────────
  const envAppId = process.env.NUXT_FIREBASE_APP_ID
  const envMeasurementId = process.env.NUXT_FIREBASE_MEASUREMENT_ID
  const envDomain = process.env.APP_DOMAIN
  const envPin = process.env.DEVELOPER_PIN

  console.log('[fireux/fireux.config] env.APP_DOMAIN', envDomain)
  console.log('[fireux/fireux.config] env.NUXT_FIREBASE_APP_ID', envAppId)
  console.log('[fireux/fireux.config] env.NUXT_FIREBASE_MEASUREMENT_ID', envMeasurementId)
  console.log('[fireux/fireux.config] env.DEVELOPER_PIN', envPin)

  // App-level firebase bits (from env)
  const firebaseApp = {
    appId: envAppId,
    measurementId: envMeasurementId,
  }

  // Keep runtime wiring minimal for now (ignore ecosystem entirely)
  setRuntime(nuxt, {
    app: {
      id: app.id,
      name: app.name,
      shortName: app.shortName,
      description: app.description,
      domain: envDomain,
      role: app.role,
      ecosystem: app.ecosystem,
      modules: (nuxt.modules || []) as readonly string[],
    },

    firebaseApp,

    private: {
      developerPin: envPin,
    },
  })

  // ✅ derive vuefire config from runtime shape (single source of truth)  configVuefire(nuxt)


  // ⛔️ commented out for this mission
  // configPwa(nuxt, {
  //   name: app.name,
  //   shortName: app.shortName,
  //   description: app.description,
  //   themeColor: '#000000',
  //   backgroundColor: '#ffffff',
  //   lang: 'en',
  // })
  // configNitroFirebase(nuxt, {
  //   serverFunctionName: app.id,
  //   region: process.env.NITRO_FIREBASE_REGION || 'europe-west1',
  // })
  // configViteWorkspace(nuxt)

  return nuxt
}