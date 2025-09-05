import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
// Use package export; during editor time fallback to source to help TS resolve
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-fireux'],
    ecosystem: 'fireux',
    appName: process.env.APP_NAME ?? 'FireUX Tennant',
    appShortName: process.env.APP_SHORT_NAME ?? 'Tenant',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#3B82F6',
    neutralColor: process.env.APP_NEUTRAL_COLOR ?? '#64748B',
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
