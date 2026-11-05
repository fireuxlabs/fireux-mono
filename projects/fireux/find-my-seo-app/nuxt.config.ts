import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-jobs/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'find-my-seo-app',
  context:
    'Find My SEO helps businesses discover and compare SEO professionals for specific problems. Relevant background includes specialism, sector experience and supporting evidence.',
  name: 'Find My SEO',
  shortName: 'FindMySEO',
  databaseId: 'find-my-seo',
  role: 'standalone',
  domains: ['professionals'],
  profiles: ['professional'],
  modules: ['fireux-jobs'],
})
