import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/supplier/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Supplier',
    ignore: ['Workspace/**', 'dev/**'],
  })

  registerComponentsDir(resolver, './runtime/supplier/components/Workspace', {
    global: false,
    pathPrefix: true,
    prefix: 'WorkspaceSupplier',
  })

  registerComponentsDir(resolver, './runtime/supplier/components/dev', {
    global: false,
    pathPrefix: true,
    prefix: 'DevSuppliers',
  })
}
