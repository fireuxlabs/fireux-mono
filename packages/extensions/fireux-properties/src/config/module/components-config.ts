import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: true,
    pathPrefix: true,
    priority: 1,
  })

  registerComponentsDir(resolver, './runtime/portfolio/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Portfolio',
    priority: 1,
    ignore: ['Console/**', 'dev/**'],
  })

  registerComponentsDir(resolver, './runtime/portfolio/components/Console', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsolePortfolio',
    priority: 1,
  })

  registerComponentsDir(resolver, './runtime/portfolio/components/dev', {
    global: true,
    pathPrefix: true,
    prefix: 'DevPortfolio',
    priority: 1,
  })

  registerComponentsDir(resolver, './runtime/property/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Property',
    priority: 1,
    ignore: ['Console/**'],
  })

  registerComponentsDir(resolver, './runtime/property/components/Console', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsoleProperty',
    priority: 1,
  })
}
