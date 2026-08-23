import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/place/components/Company', {
    global: false,
    pathPrefix: true,
    prefix: 'Company',
  })
}
