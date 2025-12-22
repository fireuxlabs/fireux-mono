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

export function defineFireuxConfig(app: FireuxAppConfig): NuxtConfig {
  const nuxt: NuxtConfig = {}

  // Align Nitro defaults with our current baseline.
  // Prevents runtime fallback warnings during dev.
  ;(nuxt as any).compatibilityDate = '2025-12-22'
  ;(nuxt.nitro as any) = {
    ...((nuxt.nitro as any) || {}),
    compatibilityDate: '2025-12-22',
  }

  nuxt.srcDir = 'app'
  nuxt.imports = { dirs: ['composables/**', 'utils/**'] }

  nuxt.modules = [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/content',
    `fireux-${app.ecosystem}`,
    // VueFire/Firebase wiring lives in fireux-nuxtfire.
    'fireux-nuxtfire',
    'fireux-core',
    '@vite-pwa/nuxt',
    ...(app.modules || []),
  ]

  // Prefer Node's built-in SQLite (Node >= 22.5) to avoid native addon deps.
  // Nuxt Content will otherwise default to better-sqlite3 in Node.
  ;(nuxt as any).content = {
    ...((nuxt as any).content || {}),
    experimental: {
      ...(((nuxt as any).content || {}).experimental || {}),
      sqliteConnector: 'native',
    },
  }

  nuxt.css = [
    'fireux-core/runtime/assets/styles/main.css',
    'fireux-core/runtime/assets/styles/main.scss',
  ]

  const envDomain = reqEnv('APP_DOMAIN')
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

    private: {
      developerPin: envPin,
    },
  })

  configPwa(nuxt, {
    name: app.name,
    shortName: app.shortName,
    description: app.description,
    themeColor: '#000000',
    backgroundColor: '#000000',
    lang: 'en',
  })

  configNitroFirebase(nuxt, {
    serverFunctionName: app.id,
    region: process.env.NITRO_FIREBASE_REGION || 'europe-west1',
  })

  configViteWorkspace(nuxt)

  return nuxt
}