// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  consoles: ['kitchen', 'supplier'],
  domains: ['kitchens', 'suppliers', 'jobs', 'chefs', 'ingredients'],
  profiles: ['chef', 'professional', 'agent'],
  seo: {
    siteUrl: 'https://misebox.app',
    staticPaths: ['/get-started', '/programme', '/luna-piccante', '/luna-piccante/menu'],
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
    'fireux-ai',
  ],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  css: [...(fireuxConfig.css ?? []), '@/assets/styles/main.css'],
})
