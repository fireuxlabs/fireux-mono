import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'qrdoc',
  name: 'QRdoc',
  shortName: 'QRdoc',
  databaseId: 'qrdoc',
  meta: metaContent,
  role: 'standalone',
  consoles: [],
  seo: {
    siteUrl: 'https://qrdoc.web.app',
  },
  modules: ['fireux-products', 'fireux-blogs'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
  routeRules: {
    ...(fireuxConfig.routeRules ?? {}),
    '/dashboard/admin/products': { redirect: '/admin/products' },
    '/dashboard/admin/products/create': { redirect: '/admin/products/create' },
    '/dashboard/admin/blogs': { redirect: '/admin/blogs' },
    '/dashboard/admin/blogs/create': { redirect: '/admin/blogs/create' },
  },
})
