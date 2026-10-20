import { defineFireuxConfig, type FireuxAppConfig } from 'fireux-core/config/app/fireux.config'

const app: FireuxAppConfig = {
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'baeren-ringgenberg',
  context: "This App represents Hotel Bären Ringgenberg and its hotel, restaurant and bar. It brings together venue information, menus and hospitality content; operational details require owner confirmation.",
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
    'fireux-products',
    'fireux-places',
    'fireux-companies',
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

const appConfig = defineFireuxConfig(app)

export default {
  ...appConfig,
  runtimeConfig: {
    ...appConfig.runtimeConfig,
    public: {
      ...appConfig.runtimeConfig?.public,
      ordering: { channels: ['pos', 'kiosk', 'website'] },
    },
  },
  extends: [
    ...(app.workspaces?.includes('kitchen')
      ? ['fireux-kitchens/layer', 'fireux-misebox/layer']
      : []),
    'fireux-core/layer',
    'fireux-blogs/layer',
    'fireux-products/layer',
    'fireux-places/layer',
    'fireux-companies/layer',
    'fireux-jobs/layer',
  ],
}
