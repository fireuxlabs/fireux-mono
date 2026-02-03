import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configurePages } from 'fireux-core/config/module/pages-config'

export const configureModulePages = (resolver: Resolver, nuxt: Nuxt) => {
  configurePages(resolver, nuxt)

  nuxt.hook('pages:extend', (pages: any[]) => {
    for (let i = pages.length - 1; i >= 0; i -= 1) {
      const page = pages[i]
      const file = typeof page?.file === 'string' ? page.file : ''
      if (file.includes('/fireux-misebox/src/runtime/pages/companies')) {
        pages.splice(i, 1)
      }
    }
  })
}
