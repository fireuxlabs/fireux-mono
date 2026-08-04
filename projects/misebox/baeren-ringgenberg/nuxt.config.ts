import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
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
    'fireux-products',
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
