import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components/organisms/Order', {
    global: true,
    pathPrefix: true,
    prefix: 'Order',
  })
  registerComponentAliases(resolver, './runtime/components/organisms/Order', 'Order', {
    global: true,
  })
}
