import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: true,
    pathPrefix: true,
  })

  registerComponentsDir(resolver, './runtime/place/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Place',
    ignore: ['dev/**'],
  })

  registerComponentsDir(resolver, './runtime/place/components/dev', {
    global: true,
    pathPrefix: true,
    prefix: 'DevPlace',
  })
}
