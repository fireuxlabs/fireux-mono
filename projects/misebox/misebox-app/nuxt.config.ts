import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox', 
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  role: 'global', 
  modules: [
    'fireux-places',
    'fireux-companies',
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