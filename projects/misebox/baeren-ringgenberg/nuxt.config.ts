// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
// Concurrent edit — 2026-07-21 12:29 CEST — Cleanbox-to-Werkbox registration cutover: make the existing Bären Jobs workplace default explicit.
// Concurrent edit — 2026-07-21 12:52 CEST — Misebox Jobs workplace adapter: classify new hospitality jobs explicitly.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: make categories the only app-configured Job delta.
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'baeren-ringgenberg',
  name: 'Hotel Bären Ringgenberg',
  shortName: 'Bären Ringgenberg',
  role: 'tenant',
  seo: {
    siteUrl: 'https://baeren-ringgenberg.web.app',
  },
  consoles: ['kitchen'],
  consoleConfig: {
    kitchen: {
      canCreate: false,
    },
  },
  navHiddenKeys: ['kitchens', 'places', 'companies', 'agents', 'professionals'],
  modules: [
    'fireux-places',
    'fireux-companies',
    'fireux-go-qr',
    'fireux-kitchens',
    'fireux-sproochli',
    [
      'fireux-jobs',
      {
        categories: ['hospitality'],
      },
    ],
  ],
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
})
