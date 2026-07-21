// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
// Concurrent edit — 2026-07-21 12:29 CEST — Cleanbox-to-Werkbox registration cutover: make the existing Misebox Jobs workplace default explicit.
// Concurrent edit — 2026-07-21 12:52 CEST — Misebox Jobs workplace adapter: classify new hospitality jobs explicitly.
// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: declare Misebox open self-membership policy.
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  consoles: ['kitchen', 'supplier'],
  domains: ['kitchens', 'suppliers', 'jobs', 'chefs', 'ingredients'],
  profiles: ['chef', 'professional', 'agent', 'customer', 'driver'],
  selfJoinEnabled: true,
  seo: {
    staticPaths: ['/get-started', '/programme', '/luna-piccante', '/luna-piccante/menu'],
  },
  modules: [
    'fireux-places',
    'fireux-companies',
    'fireux-go-qr',
    'fireux-kitchens',
    'fireux-sproochli',
    'fireux-suppliers',
    [
      'fireux-jobs',
      {
        categories: ['hospitality'],
        workplaces: ['kitchen', 'ship', 'truck'],
        defaultWorkplaceType: 'kitchen',
      },
    ],
    'fireux-ai',
  ],
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      googleMapsMapId: process.env.NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '',
    },
  },
})
