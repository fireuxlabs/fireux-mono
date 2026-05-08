import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components/organisms/Console/Portfolio', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsolePortfolio',
  })

  registerComponentsDir(resolver, './runtime/components/organisms/Portfolio', {
    global: true,
    pathPrefix: true,
    prefix: 'Portfolio',
    priority: 1,
  })

  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Portfolio',
    'Portfolio',
    { global: true }
  )
}
