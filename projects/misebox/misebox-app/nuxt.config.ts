import type { NuxtPage } from '@nuxt/schema'
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
  homePath: '/',
  contactEmail: 'misebox@misebox.app',
  role: 'global',
  workspaces: ['kitchen'],
  workspaceConfig: {
    kitchen: {
      origin:
        process.env.NODE_ENV === 'production'
          ? 'https://workspace.misebox.app'
          : 'http://workspace.localhost:3001',
    },
  },
  domains: ['kitchens', 'jobs', 'chefs', 'ingredients'],
  profiles: ['chef', 'professional', 'agent', 'customer', 'driver'],
  seo: {
    staticPaths: [
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
    'fireux-ai',
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
    'fireux-ai/layer',
  ],
})

export default {
  ...appConfig,
  hooks: {
    ...appConfig.hooks,
    'pages:extend'(pages: NuxtPage[]) {
      // This Main App has one host-specific root. Keep domain capability children.
      for (let index = pages.length - 1; index >= 0; index -= 1) {
        if (['/workspace', '/workspace/kitchen'].includes(pages[index].path)) {
          pages.splice(index, 1)
        }
      }
    },
  },

  runtimeConfig: {
    ...appConfig.runtimeConfig,
    public: {
      ...appConfig.runtimeConfig?.public,
      packageComponents: {},
      ordering: { channels: ['pos', 'kiosk', 'website'] },
    },
  },
}
