import { addComponent, type Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/user/components/Chef', {
    global: false,
    pathPrefix: true,
    prefix: 'Chef',
  })

  registerComponentsDir(resolver, './runtime/user/components/Customer', {
    global: false,
    pathPrefix: true,
    prefix: 'Customer',
  })

  registerComponentsDir(resolver, './runtime/user/components/Delivery', {
    global: false,
    pathPrefix: true,
    prefix: 'Delivery',
  })

  registerComponentsDir(resolver, './runtime/user/components/Driver', {
    global: false,
    pathPrefix: true,
    prefix: 'Driver',
  })

  registerComponentsDir(resolver, './runtime/user/components/Diagnostics/Chef', {
    global: false,
    pathPrefix: true,
    prefix: 'DiagnosticsChef',
  })

  registerComponentsDir(resolver, './runtime/ingredient/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Ingredient',
    ignore: ['Diagnostics/**'],
  })

  registerComponentsDir(resolver, './runtime/ingredient/components/Diagnostics', {
    global: false,
    pathPrefix: true,
    prefix: 'DiagnosticsIngredient',
  })

  registerComponentsDir(resolver, './runtime/kitchen/components/Workspace', {
    global: false,
    pathPrefix: true,
    prefix: 'WorkspaceKitchen',
    priority: 20,
    ignore: ['Navigation.vue'],
  })

  addComponent({
    name: 'WorkspaceKitchenNavigation',
    filePath: resolver.resolve(
      './runtime/kitchen/components/Workspace/Navigation.vue'
    ),
    global: true,
  })

  registerComponentsDir(resolver, './runtime/kitchen/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Kitchen',
    ignore: ['Workspace/**', 'Diagnostics/**'],
  })


  registerComponentsDir(resolver, './runtime/menu/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Menu',
  })
}
