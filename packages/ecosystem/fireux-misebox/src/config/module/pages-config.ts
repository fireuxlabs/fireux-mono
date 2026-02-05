import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configurePages, filterPagesByGlob } from 'fireux-core/config/module/pages-config'

export const configureModulePages = (resolver: Resolver, nuxt: Nuxt) => {
  configurePages(resolver, nuxt)
  filterPagesByGlob(nuxt, [
    '**/fireux-misebox/src/runtime/pages/companies/**',
  ])
}
