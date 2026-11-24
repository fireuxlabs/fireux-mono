import { type Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/project/components/Public', {
    global: false,
    pathPrefix: true,
    prefix: 'PublicProject',
  })

  registerComponentsDir(resolver, './runtime/project/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Project',
    ignore: ['Public/**', 'Workspace/**'],
  })
}
