import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components/organisms/entities/Place', {
    global: true,
    pathPrefix: true,
    prefix: 'Place',
  })

  registerComponentAliases(
    resolver,
    './runtime/components/organisms/entities/Place',
    'Place'
  )
}