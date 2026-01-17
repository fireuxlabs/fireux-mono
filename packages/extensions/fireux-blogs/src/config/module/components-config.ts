import type { Resolver } from '@nuxt/kit'
import {
    registerComponentAliases,
    registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components/organisms/entities/Blog', {
    global: true,
    pathPrefix: true,
    prefix: 'Blog',
  })

  registerComponentAliases(
    resolver,
    './runtime/components/organisms/entities/Blog',
    'Blog'
  )
}