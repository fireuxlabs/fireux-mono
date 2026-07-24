import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
  registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
    priority: 1,
  })
}
