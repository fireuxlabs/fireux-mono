import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAlias,
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
  registerComponentAlias(
    resolver,
    './runtime/components/organisms/Console/Supplier/Index.vue',
    'ConsoleSupplier',
    { global: true }
  )

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
