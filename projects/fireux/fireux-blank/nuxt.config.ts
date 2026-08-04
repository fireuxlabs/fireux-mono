import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  id: 'fireux-blank',
  name: 'FireUX Blank',
  shortName: 'Blank',
  databaseId: 'fireux',
  role: 'standalone',
  consoles: ['blank'],
  seo: {
    noindexPaths: ['/console', '/console/**'],
  },
})
