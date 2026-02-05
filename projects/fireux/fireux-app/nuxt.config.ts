import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { DEFAULT_PRODUCT_BILLING_INTERVALS } from 'fireux-core/config/app/products-defaults'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'fireux',
    id: 'fireux-app',
    name: 'FireUX',
    shortName: 'FireUX',
    role: 'global',
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
          billingIntervals: [...DEFAULT_PRODUCT_BILLING_INTERVALS],
        },
      ],
      'fireux-blogs',
    ],
  })
)
