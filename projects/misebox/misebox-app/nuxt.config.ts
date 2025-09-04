import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    // Match Niederhorn setup: tenant module(s) for this app
    modules: ['fireux-misebox'],
    ecosystem: 'misebox',
    appName: process.env.APP_NAME ?? 'Misebox',
    appShortName: process.env.APP_SHORT_NAME ?? 'Misebox',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#8B5CF6',
    neutralColor: process.env.APP_NEUTRAL_COLOR ?? '#64748B',
    // Client-only auth for now
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  // Align with other apps
  compatibilityDate: '2025-09-01',
})

export default config
