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
    ignore: ['Workspace/**', 'dev/**'],
  })

  registerComponentsDir(resolver, './runtime/portfolio/components/Workspace', {
    global: true,
    pathPrefix: true,
    prefix: 'WorkspacePortfolio',
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
    ignore: ['Workspace/**'],
  })

  registerComponentsDir(resolver, './runtime/property/components/Workspace', {
    global: true,
    pathPrefix: true,
    prefix: 'WorkspaceProperty',
    priority: 1,
  })
}
