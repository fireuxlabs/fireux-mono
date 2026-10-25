import { type Resolver } from '@nuxt/kit'
import { registerComponentsDir } from './module-helpers'

export function configureComponents(resolver: Resolver) {
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
