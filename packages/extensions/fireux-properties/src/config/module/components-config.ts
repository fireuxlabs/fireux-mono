import { type Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/portfolio/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Portfolio',
    priority: 1,
    ignore: ['Workspace/**'],
  })

  registerComponentsDir(resolver, './runtime/property/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Property',
    priority: 1,
    ignore: ['Workspace/**'],
  })
}
