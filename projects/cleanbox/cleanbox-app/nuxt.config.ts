import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    ecosystem: 'cleanbox',
    appName: process.env.APP_NAME ?? 'Cleanbox',
    appShortName: process.env.APP_SHORT_NAME ?? 'Cleanbox',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#000000',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  }),
})

export default config
