import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  role: 'global',
  modules: [
    ['fireux-places', { types: ['kitchen', 'company'] }],
    'fireux-kitchens',
    'fireux-jobs',
    'fireux-products',
    'fireux-blogs',
  ],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  css: [...(fireuxConfig.css ?? []), '@/assets/styles/main.css'],
})
