import { defineFireuxConfig, type FireuxAppConfig } from 'fireux-core/config/app/fireux.config'

const app: FireuxAppConfig = {
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  homePath: '/about',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  workspaces: ['kitchen'],
  domains: ['kitchens', 'jobs', 'chefs', 'ingredients'],
  profiles: ['chef', 'professional', 'agent', 'customer', 'driver'],
  selfJoinEnabled: true,
  seo: {
    staticPaths: [
      '/product',
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
}

export default {
  ...defineFireuxConfig(app),
  extends: [
    ...(app.workspaces?.includes('kitchen')
      ? ['fireux-kitchens/layer', 'fireux-misebox/layer']
      : []),
    'fireux-core/layer',
    'fireux-blogs/layer',
    'fireux-places/layer',
    'fireux-companies/layer',
    'fireux-jobs/layer',
    'fireux-ai/layer',
  ],
}
