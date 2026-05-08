import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
  })

  registerComponentsDir(resolver, './runtime/components/organisms/Console/Supplier', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsoleSupplier',
  })

  registerComponentsDir(resolver, './runtime/components/organisms/Supplier', {
    global: true,
    pathPrefix: true,
    prefix: 'Supplier',
  })

  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Supplier',
    'Supplier',
    { global: true }
  )
}
