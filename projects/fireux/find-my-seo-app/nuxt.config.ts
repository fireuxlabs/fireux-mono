import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'find-my-seo-app',
  name: 'Find My SEO',
  shortName: 'FindMySEO',
  databaseId: 'find-my-seo',
  meta: metaContent,
  role: 'standalone',
  consoles: [],
  profiles: ['professional'],
  seo: {
    siteUrl: 'https://find-my-seo.web.app',
  },
  modules: ['fireux-jobs', 'fireux-products'],
})

function keepFindMySeoJobsRoute(file: string) {
  if (!file.includes('packages/extensions/fireux-jobs/src/runtime/pages/')) return true

  return file.endsWith(
    'packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue'
  )
}

function filterFindMySeoPages(pages: any[]) {
  for (let index = pages.length - 1; index >= 0; index -= 1) {
    const page = pages[index]
    if (Array.isArray(page?.children)) {
      filterFindMySeoPages(page.children)
    }

    const file = typeof page?.file === 'string' ? page.file : ''
    if (file && !keepFindMySeoJobsRoute(file)) {
      pages.splice(index, 1)
    }
  }
}

export default defineNuxtConfig({
  ...fireuxConfig,
  hooks: {
    ...(fireuxConfig.hooks ?? {}),
    'pages:extend'(pages) {
      filterFindMySeoPages(pages)
    },
  },
})
