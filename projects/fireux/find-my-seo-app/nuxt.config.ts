import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  id: 'find-my-seo-app',
  name: 'Find My SEO',
  shortName: 'FindMySEO',
  databaseId: 'find-my-seo',
  role: 'standalone',
  domains: ['professionals'],
  profiles: ['professional'],
  modules: ['fireux-jobs', 'fireux-products'],
})
