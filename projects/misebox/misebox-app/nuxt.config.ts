import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox', 
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  consoleFamilies: ['kitchen', 'supplier'],
  seo: {
    siteUrl: 'https://misebox.app',
    staticPaths: ['/get-started', '/programme'],
  },
  modules: [
    'fireux-places',
    'fireux-companies',
    'fireux-kitchens',
    'fireux-orders',
    'fireux-suppliers',
    ['fireux-jobs', { workplaces: ['kitchen', 'ship', 'truck'] }],
    'fireux-products',
    'fireux-blogs',
  ],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  css: [...(fireuxConfig.css ?? []), '@/assets/styles/main.css'],
})
