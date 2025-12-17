import type { NuxtConfig } from 'nuxt/schema'

import { configRuntime } from './runtime'
import { configPwa } from './pwa'
import { configVuefire } from './vuefire'
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

export function defineFireuxConfig(app: FireuxAppConfig): NuxtConfig {
  const nuxt: NuxtConfig = {}

  // Core invariants
  nuxt.srcDir = 'app'
  nuxt.imports = { dirs: ['composables/**', 'utils/**'] }

  nuxt.modules = [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/content',
    'fireux-core',
    `fireux-${app.ecosystem}`, // ecosystem module is mandatory
  ]

  if (app.modules?.length) nuxt.modules.push(...app.modules)

  configRuntime(nuxt, {
    id: app.id,
    name: app.name,
    shortName: app.shortName,
    description: app.description,
    domain: process.env.APP_DOMAIN as string,
    role: app.role,
    ecosystem: app.ecosystem,
    modules: (nuxt.modules || []) as readonly string[],
  })

  // PWA: DO NOT read colors from env. Use stable defaults until we add a resolver.
  configPwa(nuxt, {
    name: app.name,
    shortName: app.shortName,
    description: app.description,
    themeColor: '#000000',
    backgroundColor: '#ffffff',
    lang: 'en',
  })

  configVuefire(nuxt, {
    firebaseConfig: {
      apiKey: process.env.NUXT_FIREBASE_API_KEY as string,
      authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN as string,
      projectId: process.env.NUXT_FIREBASE_PROJECT_ID as string,
      storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET as string,
      messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID as string,
      appId: process.env.NUXT_FIREBASE_APP_ID as string,
      measurementId: process.env.NUXT_FIREBASE_MEASUREMENT_ID,
    },
  })

  configNitroFirebase(nuxt, {
    serverFunctionName: app.id,
    region: process.env.NITRO_FIREBASE_REGION || 'europe-west1',
  })

  configViteWorkspace(nuxt)

  return nuxt
}
