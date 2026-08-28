import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  homePath: '/about',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  designPack: { preset: 'sci-fire' },
  workspaces: ['kitchen'],
  domains: ['kitchens', 'jobs', 'chefs', 'ingredients'],
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
    'fireux-sproochli',
    ['fireux-suppliers', { mode: 'consumer' }],
    ['fireux-jobs', { categories: ['hospitality'] }],
    'fireux-ai',
  ],
})
