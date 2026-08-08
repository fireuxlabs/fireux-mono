import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'friiites',
  name: 'Friiites',
  shortName: 'Friiites',
  role: 'tenant',
  seo: {
    siteUrl: 'https://friiites.web.app',
  },
  consoles: ['kitchen'],
  consoleConfig: {
    kitchen: {
      canCreate: false,
    },
  },
  navHiddenKeys: ['kitchens', 'places'],
  modules: [
    'fireux-places',
    'fireux-go-qr',
    'fireux-kitchens',
    'fireux-sproochli',
  ],
})
