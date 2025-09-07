// projects/misebox/niederhorn/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-misebox'], // tenant module(s) for this app
    ecosystem: 'misebox',
    appName: process.env.APP_NAME ?? 'Niederhorn',
    appShortName: process.env.APP_SHORT_NAME ?? 'Niederhorn',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#0EA5E9',
    neutralColor: process.env.APP_NEUTRAL_COLOR ?? '#64748B',
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
