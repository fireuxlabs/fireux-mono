import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    tenantModule: 'fireux-cleanbox',
    appName: 'CleanBox',
    appShortName: 'CleanBox',
    primaryColor: '#3b82f6',
  })
)
