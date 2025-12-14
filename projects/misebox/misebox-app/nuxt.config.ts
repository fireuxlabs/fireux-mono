import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/defineFireuxConfig'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'misebox',
    id: 'misebox-app',
    name: 'Misebox',
    shortName: 'Misebox',
    description: 'Workhub for Misebox creative operations and collaborators.',
    role: 'global',
    modules: [
      'fireux-jobs',
      'fireux-products',
      'fireux-blogs',
    ],
  })
)
