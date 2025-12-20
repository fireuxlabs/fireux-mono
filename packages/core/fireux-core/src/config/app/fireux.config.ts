// FILE: packages/core/fireux-core/config/app/fireux.config.ts
import type { NuxtConfig } from 'nuxt/schema'

import { setRuntime } from './runtime'
import { configPwa } from './pwa'
import { configNitroFirebase } from './nitro'
import { configViteWorkspace } from './vite'

export type FireuxAppConfig = {
  ecosystem: string
  id: string
  name: string
  shortName: string
  description: string
  role: 'global' | 'tenant'
  modules?: string[]
}

function reqEnv(name: string): string {
  const value = process.env[name]
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[fireux] Missing required env var: ${name}`)
  }
  return value.trim()
}

function optEnv(name: string): string | undefined {
  const value = process.env[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function boolEnv(name: string, fallback = false): boolean {
  const v = optEnv(name)
  if (!v) return fallback
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
}

export function defineFireuxConfig(app: FireuxAppConfig): NuxtConfig {
  const nuxt: NuxtConfig = {}

  nuxt.srcDir = 'app'
  nuxt.imports = { dirs: ['composables/**', 'utils/**'] }

  const enablePwa = boolEnv('FIREUX_ENABLE_PWA', false)
  const enableNitroFirebase = boolEnv('FIREUX_ENABLE_NITRO_FIREBASE', false)
  const enableViteWorkspace = boolEnv('FIREUX_ENABLE_VITE_WORKSPACE', false)
  const enableVuefire = boolEnv('FIREUX_ENABLE_VUEFIRE', true)

  const hasFirebaseEcosystem =
    !!optEnv('NUXT_FIREBASE_API_KEY') &&
    !!optEnv('NUXT_FIREBASE_AUTH_DOMAIN') &&
    !!optEnv('NUXT_FIREBASE_PROJECT_ID') &&
    !!optEnv('NUXT_FIREBASE_STORAGE_BUCKET') &&
    !!optEnv('NUXT_FIREBASE_MESSAGING_SENDER_ID')

  nuxt.modules = [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/content',
    `fireux-${app.ecosystem}`,
    'fireux-core',
    ...(enableVuefire && hasFirebaseEcosystem ? ['nuxt-vuefire'] : []),
    ...(enablePwa ? ['@vite-pwa/nuxt'] : []),
    ...(app.modules || []),
  ]

  nuxt.css = [
    'fireux-core/runtime/assets/styles/main.css',
  ]

  const envDomain = reqEnv('APP_DOMAIN')
  const envAppId = reqEnv('NUXT_FIREBASE_APP_ID')
  const envMeasurementId = optEnv('NUXT_FIREBASE_MEASUREMENT_ID')
  const envPin = optEnv('DEVELOPER_PIN')
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

    firebaseApp: {
      appId: envAppId,
      measurementId: envMeasurementId,
    },

    private: {
      developerPin: envPin,
    },
  })

  if (enablePwa) {
    configPwa(nuxt, {
      name: app.name,
      shortName: app.shortName,
      description: app.description,
      themeColor: '#000000',
      backgroundColor: '#000000',
      lang: 'en',
    })
  }

  if (enableNitroFirebase) {
    configNitroFirebase(nuxt, {
      serverFunctionName: app.id,
      region: process.env.NITRO_FIREBASE_REGION || 'europe-west1',
    })
  }

  if (enableViteWorkspace) {
    configViteWorkspace(nuxt)
  }

  return nuxt
}