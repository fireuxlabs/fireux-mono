// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-app',
  name: 'FireUX',
  shortName: 'FireUX',
  brand: { owner: 'core' },
  role: 'global',
  pricing: {
    consoleName: 'Project Console',
    free: ['Use the Project Console', 'Review Apps and Ecosystems', 'Review Project users and access', 'Use public FireUX resources'],
    pro: ['Manage Apps connected to the Project', 'Manage Project users, roles, and access', 'Review App and Ecosystem status', 'Configure the Project yourself'],
  },
  designPack: { preset: 'sci-fire' },
  consoles: ['project'],
  modules: [
    [
      'fireux-products',
      {
        productKinds: [
          'saas_app',
          'industry_app',
          'white_label_app',
          'ecosystem_white_label',
          'template',
          'modules_pass',
          'service',
        ],
      },
    ],
  ],
})
