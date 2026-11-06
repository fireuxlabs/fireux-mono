import { addComponent, type Resolver } from '@nuxt/kit'

export function configureComponents(resolver: Resolver) {
  addComponent({
    name: 'WorkspacePortfolioOverview',
    filePath: resolver.resolve(
      './runtime/workspace/components/Portfolio/Overview/Index.vue'
    ),
    priority: 30,
  })
}
