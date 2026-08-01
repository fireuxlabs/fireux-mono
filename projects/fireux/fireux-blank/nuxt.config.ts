// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  id: 'fireux-blank',
  name: 'FireUX Blank',
  shortName: 'Blank',
  brand: { owner: 'app', status: 'provisional' },
  databaseId: 'fireux',
  role: 'standalone',
  consoles: ['blank'],
  seo: {
    noindexPaths: [
      '/console',
      '/console/**',
    ],
  },
})
