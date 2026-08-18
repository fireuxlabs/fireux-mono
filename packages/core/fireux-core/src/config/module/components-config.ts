import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from './module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
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

  registerComponentsDir(resolver, './runtime/project/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Project',
    ignore: ['Console/**'],
  })

  registerComponentsDir(resolver, './runtime/project/components/Console', {
    global: false,
    pathPrefix: true,
    prefix: 'ConsoleProject',
  })

  registerComponentsDir(resolver, './runtime/user/components', {
    global: false,
    pathPrefix: true,
    prefix: 'User',
  })

  registerComponentsDir(resolver, './runtime/components/molecules', {
    global: false,
    pathPrefix: false,
  })
}
