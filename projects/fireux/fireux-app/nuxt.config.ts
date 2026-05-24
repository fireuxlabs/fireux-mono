import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { metaContent } from './app/content/meta'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'fireux-app',
  name: 'FireUX',
  shortName: 'FireUX',
  meta: metaContent,
  role: 'global',
  consoles: ['project'],
  domains: ['apps', 'ecosystems', 'projects', 'modules'],
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
    'fireux-blogs',
  ],
})
