import { addComponent, type Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/supplier/components/Workspace', {
    global: false,
    pathPrefix: true,
    prefix: 'WorkspaceSupplier',
    priority: 20,
    ignore: ['Navigation.vue'],
  })

  addComponent({
    name: 'WorkspaceSupplierNavigation',
    filePath: resolver.resolve('./runtime/supplier/components/Workspace/Navigation.vue'),
    global: true,
  })

  registerComponentsDir(resolver, './runtime/supplier/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Supplier',
    ignore: ['Workspace/**', 'Diagnostics/**'],
  })

  registerComponentsDir(resolver, './runtime/supplier/components/Diagnostics', {
    global: false,
    pathPrefix: true,
    prefix: 'DiagnosticsSuppliers',
  })
}
