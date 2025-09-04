import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    ecosystem: 'cleanbox',
    appName: process.env.APP_NAME ?? 'Richies',
    appShortName: process.env.APP_SHORT_NAME ?? 'Richies',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#000000',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
