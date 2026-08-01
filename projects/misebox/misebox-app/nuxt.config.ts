// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
// Concurrent edit — 2026-07-21 12:29 CEST — Cleanbox-to-Werkbox registration cutover: make the existing Misebox Jobs workplace default explicit.
// Concurrent edit — 2026-07-21 12:52 CEST — Misebox Jobs workplace adapter: classify new hospitality jobs explicitly.
// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: declare Misebox open self-membership policy.
// Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: prerender the public Misebox demonstration family.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: make categories the only app-configured Job delta.
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  brand: { owner: 'app', status: 'provisional' },
  contactEmail: 'misebox@misebox.app',
  serverFunctionServiceAccount:
    'misebox-ssr@misebox-78f9c.iam.gserviceaccount.com',
  role: 'global',
  designPack: { preset: 'sci-fire' },
  consoles: ['kitchen', 'supplier'],
  domains: ['kitchens', 'suppliers', 'jobs', 'chefs', 'ingredients'],
  profiles: ['chef', 'professional', 'agent', 'customer', 'driver'],
  selfJoinEnabled: true,
  navHiddenKeys: ['products', 'blog'],
  navOverrides: {
    kitchens: {
      order: 10,
      layouts: ['default', 'landing'],
      position: 'top',
    },
    operations: {
      order: 20,
      position: 'top',
    },
    demo: {
      label: 'Product Demo',
      order: 30,
      position: 'top',
    },
    jobs: {
      label: 'Misebox Jobs',
      order: 40,
      position: 'bottom',
      layouts: ['default', 'landing'],
    },
    professionals: {
      label: 'Hospitality professionals',
      order: 41,
      position: 'bottom',
      layouts: ['default'],
    },
  },
  seo: {
    staticPaths: [
      '/get-started',
      '/programme',
      '/demo',
      '/demo/menu',
      '/demo/kiosk',
      '/demo/service',
    ],
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
        sourceAppDoorways: {
          'interlaken-essen': {
            label: 'Apply with Interlaken Essen',
            url: 'https://interlaken-essen.misebox.app',
          },
        },
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
