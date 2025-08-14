import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    tenantModule: 'fireux-cleanbox',
    appName: 'Richies Reinigung',
    appShortName: 'Rich',
    primaryColor: '#3b82f6',
  })
)
