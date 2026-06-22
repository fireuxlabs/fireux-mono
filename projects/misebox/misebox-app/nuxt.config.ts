// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const devConsoleConfig =
  process.env.NODE_ENV === 'development'
    ? {
        kitchen: {
          devTargetIds: [
            'ChIJ93_ggY-jj0cRTCyLcfBuK2w', // Luna Piccante
            'ChIJE-GP3-Kjj0cRzAv0WviwcsY', // Hotel Bären Ringgenberg
            'ChIJ08WSgYSjj0cRD6oE3RwUFk0', // La Tap Berne
          ],
        },
      }
    : undefined

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  consoles: ['kitchen', 'supplier'],
  ...(devConsoleConfig ? { consoleConfig: devConsoleConfig } : {}),
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
