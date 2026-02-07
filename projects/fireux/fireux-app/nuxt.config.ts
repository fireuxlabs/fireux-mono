import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
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
      },
    ],
    'fireux-blogs',
  ],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  experimental: {
    ...(fireuxConfig.experimental || {}),
    // Avoid stale dev client requests to /_nuxt/builds/meta/dev.json.
    appManifest: process.env.NODE_ENV === 'production',
  },
  pwa: {
    ...(fireuxConfig.pwa || {}),
    // Ensure service worker is not active during local dev.
    devOptions: {
      ...(fireuxConfig.pwa?.devOptions || {}),
      enabled: false,
    },
  },
})
