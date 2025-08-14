import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    tenantModule: 'fireux-misebox',
    appName: 'MiseBox',
    appShortName: 'MiseBox',
    primaryColor: '#10b981',
  })
)
