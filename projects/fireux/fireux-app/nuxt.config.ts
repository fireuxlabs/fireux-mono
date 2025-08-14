import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    tenantModule: 'fireux-jobs', // fireux-app uses jobs module
    appName: 'FireUX',
    appShortName: 'FireUX',
    primaryColor: '#eab308',
  })
)
