import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'interlaken-essen',
  name: 'Interlaken Essen',
  shortName: 'Interlaken Essen',
  role: 'tenant',
  consoles: [],
  modules: [],
  seo: {
    siteUrl: 'https://interlaken-essen.misebox.app',
  },
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
})
