import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
// Prefer package export; JITI can sometimes fail to resolve subpath exports in monorepos during dev
// Import from source path as a workspace fallback
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    ecosystem: 'fireux',
    appName: process.env.APP_NAME ?? 'FireUX',
    appShortName: process.env.APP_SHORT_NAME ?? 'FireUX',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#EAB308',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  }),
})

export default config
