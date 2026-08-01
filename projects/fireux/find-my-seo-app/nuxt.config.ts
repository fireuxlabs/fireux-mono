// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'
import { findMySeoNuxtOverrides } from './app/config/pages.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  id: 'find-my-seo-app',
  name: 'Find My SEO',
  shortName: 'FindMySEO',
  brand: { owner: 'app', status: 'provisional' },
  databaseId: 'find-my-seo',
  role: 'standalone',
  domains: ['professionals'],
  profiles: ['professional'],
  modules: ['fireux-jobs'],
})

export default withFireuxNuxtConfig(fireuxConfig, findMySeoNuxtOverrides)
