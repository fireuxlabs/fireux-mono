// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'sproochli',
  name: 'Sproochli',
  shortName: 'Sproochli',
  databaseId: 'sproochli',
  role: 'standalone',
  consoles: [],
  seo: {
    siteUrl: 'https://sproochli.web.app',
  },
  modules: ['fireux-sproochli', 'fireux-products', 'fireux-blogs', 'fireux-ai'],
})
