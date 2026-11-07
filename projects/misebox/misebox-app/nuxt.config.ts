import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

export default defineFireuxEcosystem({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'misebox-app',
  context:
    'Misebox connects public Kitchen and Menu discovery with a Kitchen Workspace for operators. Venue information, menu content and operational configuration have separate owners.',
  name: 'Misebox',
  shortName: 'Misebox',
  homePath: '/home',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  workspaces: ['kitchen'],
  domains: ['kitchens', 'jobs', 'chefs', 'ingredients'],
  profiles: ['chef', 'professional', 'agent', 'customer', 'driver'],
  seo: {
    noindexPaths: ['/'],
    staticPaths: [
      '/home',
      '/product',
      '/get-started',
      '/programme',
      '/demo',
      '/demo/menu',
    ],
  },
  modules: [
    ['fireux-core', { componentCatalogue: true }],
    [
      'fireux-kitchens',
      { ordering: { channels: ['pos', 'kiosk', 'website'] } },
    ],
    'fireux-places',
    'fireux-businesses',
    'fireux-go-qr',
    'fireux-sproochli',
    ['fireux-suppliers', { mode: 'consumer' }],
    ['fireux-jobs', { categories: ['hospitality'] }],
  ],
  extends: [
    'fireux-misebox/kitchen-layer',
    'fireux-core/layer',
    'fireux-places/layer',
    'fireux-businesses/layer',
    'fireux-jobs/layer',
  ],
})
