import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAlias,
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components/organisms/Console/Portfolio', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsolePortfolio',
  })
  registerComponentAlias(
    resolver,
    './runtime/components/organisms/Console/Portfolio/Index.vue',
    'ConsolePortfolio',
    { global: true }
  )

  registerComponentsDir(resolver, './runtime/components/organisms/Console/Properties', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsoleProperties',
  })
  registerComponentAlias(
    resolver,
    './runtime/components/organisms/Console/Properties/Index.vue',
    'ConsoleProperties',
    { global: true }
  )

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
