// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'
import { goQrNuxtOverrides } from './app/config/provider.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'go-qr',
  name: 'Go QR',
  shortName: 'Go QR',
  databaseId: 'go-qr',
  role: 'standalone',
  seo: {
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
})

export default withFireuxNuxtConfig(fireuxConfig, goQrNuxtOverrides)
