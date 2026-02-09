import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'cleanbox',
    id: 'cleanbox-app',
    name: 'Cleanbox',
    shortName: 'Cleanbox',
    role: 'global',
    modules: ['fireux-jobs', 'fireux-products', 'fireux-blogs'],
  })
)
