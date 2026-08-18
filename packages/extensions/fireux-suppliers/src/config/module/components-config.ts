import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: true,
    pathPrefix: true,
  })

  registerComponentsDir(resolver, './runtime/supplier/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Supplier',
    ignore: ['Console/**', 'dev/**'],
  })

  registerComponentsDir(resolver, './runtime/supplier/components/Console', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsoleSupplier',
  })

  registerComponentsDir(resolver, './runtime/supplier/components/dev', {
    global: true,
    pathPrefix: true,
    prefix: 'DevSuppliers',
  })
}
