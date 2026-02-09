import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: true,
    pathPrefix: true,
  })
  registerComponentsDir(resolver, './runtime/components/organisms/Product', {
    global: true,
    pathPrefix: true,
    prefix: 'Product',
  })
  registerComponentAliases(resolver, './runtime/components/organisms/Product', 'Product', {
    global: true,
  })
}
