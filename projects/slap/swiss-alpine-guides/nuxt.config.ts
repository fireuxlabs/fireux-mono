import { defineFireuxApp } from 'fireux-app/config'
import { tourPages } from './app/content/tour-pages'
import { activities } from './app/content/activities'
import { informationPages } from './app/content/site-information'

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
    'A full-site review prototype for Swiss Alpine Guides summer and winter activities, courses, rentals, vouchers and manual enquiries. No live availability, payment or automatic booking confirmation.',
  seo: {
    siteUrl: 'https://prototype-swiss-alpine-guides.web.app',
    disallowPaths: ['/'],
    noindexPaths: ['/operator', '/operator/**', '/', '/**'],
    staticPaths: ['/', '/activities', '/summer', '/winter', '/courses', '/contact', ...activities.map(item => item.path), ...Object.values(informationPages).map(page => page.path), ...tourPages.map(page => page.path)],
  },
})
