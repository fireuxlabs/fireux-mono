import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  role: 'global',
  modules: [
    [
      'fireux-places',
      {
        types: ['kitchen', 'company'],
        googleAutocompleteTypeFilters: {
          kitchen: ['restaurant', 'cafe', 'food_truck'],
        },
      },
    ],
    'fireux-kitchens',
    'fireux-jobs',
    'fireux-products',
    'fireux-blogs',
  ],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  content: {
    _localDatabase: {
      type: 'sqlite',
      filename: '/tmp/fireux-misebox-content-local.sqlite',
    },
    database: {
      type: 'sqlite',
      filename: '/tmp/fireux-misebox-content.sqlite',
    },
  },
  css: [...(fireuxConfig.css ?? []), '@/assets/styles/main.css'],
})
