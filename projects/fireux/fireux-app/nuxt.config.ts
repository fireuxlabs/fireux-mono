import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'fireux-app',
  name: 'FireUX',
  shortName: 'FireUX',
  meta: metaContent,
  role: 'global',
  consoleFamilies: ['projects'],
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

export default defineNuxtConfig(fireuxConfig)
