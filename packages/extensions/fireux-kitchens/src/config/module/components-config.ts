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

  registerComponentsDir(resolver, './runtime/ingredient/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Ingredient',
  })

  for (const capability of ['Menu', 'Prep']) {
    registerComponentsDir(
      resolver,
      `./runtime/kitchen/components/Workspace/${capability}`,
      {
        global: false,
        pathPrefix: true,
        prefix: `KitchenWorkspace${capability}`,
        priority: 20,
      }
    )
  }

  registerComponentsDir(resolver, './runtime/kitchen/components/Workspace', {
    global: false,
    pathPrefix: true,
    prefix: 'WorkspaceKitchen',
    priority: 20,
    ignore: ['Navigation/Index.vue', 'Menu/**', 'Prep/**'],
  })

  for (const [name, path] of [
    ['KitchenWorkspaceStockSuppliers', 'Stock/Suppliers/Index.vue'],
    ['KitchenWorkspaceTeamPeople', 'Team/People/Index.vue'],
    ['KitchenWorkspaceFoodSafetyProcedures', 'FoodSafety/Procedures.vue'],
    ['KitchenWorkspaceFoodSafetyRecords', 'FoodSafety/Records.vue'],
  ]) {
    addComponent({
      name,
      filePath: resolver.resolve(
        './runtime/kitchen/components/Workspace',
        path
      ),
    })
  }

  addComponent({
    name: 'WorkspaceKitchenNavigation',
    filePath: resolver.resolve(
      './runtime/kitchen/components/Workspace/Navigation/Index.vue'
    ),
    global: true,
  })

  registerComponentsDir(resolver, './runtime/kitchen/components', {
    global: false,
    pathPrefix: true,
    prefix: 'PublicKitchen',
    ignore: ['Workspace/**'],
  })

  registerComponentsDir(resolver, './runtime/menu/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Menu',
  })
}
