import { addComponent, type Resolver } from '@nuxt/kit'
import { registerComponentsDir } from './module-helpers'

export function configureComponents(resolver: Resolver) {
  for (const name of ['FireuxApp', 'FireuxWorkspaceApp']) {
    addComponent({
      name,
      filePath: resolver.resolve(`./runtime/app/components/${name}.vue`),
    })
  }
  // Shared Fire components are registered by the native runtime layer.
  registerComponentsDir(resolver, './runtime/workspace/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Workspace',
  })

  registerComponentsDir(resolver, './runtime/app/components', {
    global: false,
    pathPrefix: true,
    prefix: 'App',
    ignore: ['FireuxApp.vue', 'FireuxWorkspaceApp.vue'],
  })

  registerComponentsDir(resolver, './runtime/app/app-user/components', {
    global: false,
    pathPrefix: true,
    prefix: 'AppUser',
  })

  registerComponentsDir(resolver, './runtime/ecosystem/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Ecosystem',
  })

  registerComponentsDir(resolver, './runtime/user/components', {
    global: false,
    pathPrefix: true,
    prefix: 'User',
  })
}
