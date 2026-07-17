import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configurePages } from 'fireux-core/config/module/pages-config'

export const configureModulePages = (resolver: Resolver, nuxt: Nuxt) => {
  configurePages(resolver, nuxt)
}
