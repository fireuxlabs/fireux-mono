import { defineFireuxApp, type FireuxAppConfig } from 'fireux-app/config'

const app: FireuxAppConfig = {
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'baeren-ringgenberg',
  context:
    'This App represents Hotel Bären Ringgenberg and its hotel, restaurant and bar. It brings together venue information, menus and hospitality content; operational details require owner confirmation.',
  name: 'Hotel Bären Ringgenberg',
  shortName: 'Bären Ringgenberg',
  role: 'tenant',
  seo: {
    siteUrl: 'https://baeren-ringgenberg.web.app',
  },
  workspaces: ['kitchen'],
  domains: ['jobs'],
  profiles: ['agent', 'professional'],
  workspaceConfig: {
    kitchen: {
      canCreate: false,
    },
  },
  modules: [
    'fireux-places',
    'fireux-businesses',
    'fireux-go-qr',
    'fireux-sproochli',
    [
      'fireux-jobs',
      {
        categories: ['hospitality'],
      },
    ],
  ],
}

const appConfig = defineFireuxApp({
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
      ordering: { channels: ['pos', 'kiosk', 'website'] },
    },
  },
}
