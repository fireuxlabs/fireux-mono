// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'go-qr',
  name: 'Go QR',
  shortName: 'Go QR',
  databaseId: 'go-qr',
  role: 'standalone',
  consoles: [],
  seo: {
    siteUrl: 'https://go-qr.web.app',
    staticPaths: [
      '/pricing',
      '/terms',
      '/privacy',
      '/help',
    ],
    noindexPaths: [
      '/console',
      '/console/**',
      '/admin',
      '/admin/**',
    ],
  },
  modules: ['fireux-products', 'fireux-blogs'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  runtimeConfig: {
    ...(fireuxConfig.runtimeConfig ?? {}),
    public: {
      ...((fireuxConfig.runtimeConfig as any)?.public ?? {}),
      goQrProviderBaseUrl:
        process.env.NUXT_PUBLIC_GO_QR_PROVIDER_BASE_URL ||
        process.env.GO_QR_PROVIDER_BASE_URL ||
        '',
    },
  },
})
