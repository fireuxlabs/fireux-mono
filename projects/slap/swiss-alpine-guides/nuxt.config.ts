import { defineFireuxApp } from 'fireux-app/config'
import { tourPages } from './app/content/tour-pages'

export default defineFireuxApp({
  id: 'swiss-alpine-guides',
  ecosystem: 'slap',
  ecosystemId: 'slap',
  projectId: 'slap',
  name: 'Swiss Alpine Guides',
  shortName: 'Alpine Guides',
  role: 'tenant',
  extends: ['fireux-slap/layer'],
  context:
    'A review prototype for heli-skiing and heliboarding tour discovery and manual enquiries. No live availability, payment or automatic booking confirmation.',
  seo: {
    siteUrl: 'https://prototype-swiss-alpine-guides.web.app',
    disallowPaths: ['/'],
    noindexPaths: ['/operator', '/operator/**', '/', '/**'],
    staticPaths: ['/', ...tourPages.map(page => page.path)],
  },
})
