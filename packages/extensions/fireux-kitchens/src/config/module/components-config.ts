import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/user/components/Chef', {
    global: true,
    pathPrefix: true,
    prefix: 'Chef',
  })

  registerComponentsDir(resolver, './runtime/user/components/Customer', {
    global: true,
    pathPrefix: true,
    prefix: 'Customer',
  })

  registerComponentsDir(resolver, './runtime/user/components/Delivery', {
    global: true,
    pathPrefix: true,
    prefix: 'Delivery',
  })

  registerComponentsDir(resolver, './runtime/user/components/Driver', {
    global: true,
    pathPrefix: true,
    prefix: 'Driver',
  })

  registerComponentsDir(resolver, './runtime/user/components/dev/Chef', {
    global: true,
    pathPrefix: true,
    prefix: 'DevChef',
  })

  registerComponentsDir(resolver, './runtime/ingredient/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Ingredient',
    ignore: ['dev/**'],
  })

  registerComponentsDir(resolver, './runtime/ingredient/components/dev', {
    global: true,
    pathPrefix: true,
    prefix: 'DevIngredient',
  })

  registerComponentsDir(resolver, './runtime/kitchen/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Kitchen',
    ignore: ['Console/**', 'dev/**'],
  })

  registerComponentsDir(resolver, './runtime/kitchen/components/Console', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsoleKitchen',
  })

  registerComponentsDir(resolver, './runtime/kitchen/components/dev', {
    global: true,
    pathPrefix: true,
    prefix: 'DevKitchen',
  })

  registerComponentsDir(resolver, './runtime/menu/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Menu',
  })
}
