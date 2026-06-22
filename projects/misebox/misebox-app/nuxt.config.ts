// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

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
    staticPaths: ['/get-started', '/programme', '/luna-piccante', '/luna-piccante/menu'],
  },
  modules: [
    'fireux-places',
    'fireux-companies',
    'fireux-go-qr',
    'fireux-kitchens',
    'fireux-sproochli',
    'fireux-orders',
    'fireux-suppliers',
    ['fireux-jobs', { workplaces: ['kitchen', 'ship', 'truck'] }],
    'fireux-ai',
  ],
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
})
