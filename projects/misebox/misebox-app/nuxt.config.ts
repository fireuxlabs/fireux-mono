import {
  defineFireuxEcosystem,
  type FireuxAppConfig,
} from 'fireux-ecosystem/config'

const app: FireuxAppConfig = {
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
    'fireux-places',
    'fireux-businesses',
    'fireux-go-qr',
    'fireux-sproochli',
    ['fireux-suppliers', { mode: 'consumer' }],
    ['fireux-jobs', { categories: ['hospitality'] }],
  ],
}

const appConfig = defineFireuxEcosystem({
  ...app,
  extends: [
    ...(app.workspaces?.includes('kitchen')
      ? ['fireux-kitchens/layer', 'fireux-misebox/layer']
      : []),
    'fireux-core/layer',
    'fireux-places/layer',
    'fireux-businesses/layer',
    'fireux-jobs/layer',
  ],
})

export default {
  ...appConfig,
  runtimeConfig: {
    ...appConfig.runtimeConfig,
    public: {
      ...appConfig.runtimeConfig?.public,
      packageComponents: {},
      ordering: { channels: ['pos', 'kiosk', 'website'] },
    },
  },
}
