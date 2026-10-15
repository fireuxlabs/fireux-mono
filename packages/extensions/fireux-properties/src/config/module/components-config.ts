import { addComponent, type Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/portfolio/components/Workspace', {
    global: false,
    pathPrefix: true,
    prefix: 'WorkspacePortfolio',
    priority: 20,
    ignore: ['Navigation.vue'],
  })

  addComponent({
    name: 'WorkspacePortfolioNavigation',
    filePath: resolver.resolve('./runtime/portfolio/components/Workspace/Navigation.vue'),
    global: true,
  })

  registerComponentsDir(resolver, './runtime/portfolio/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Portfolio',
    priority: 1,
    ignore: ['Workspace/**'],
  })


  registerComponentsDir(resolver, './runtime/property/components/Workspace', {
    global: false,
    pathPrefix: true,
    prefix: 'WorkspaceProperty',
    priority: 20,
    ignore: ['Navigation.vue'],
  })

  addComponent({
    name: 'WorkspacePropertyNavigation',
    filePath: resolver.resolve('./runtime/property/components/Workspace/Navigation.vue'),
    global: true,
  })

  registerComponentsDir(resolver, './runtime/property/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Property',
    priority: 1,
    ignore: ['Workspace/**'],
  })
}
