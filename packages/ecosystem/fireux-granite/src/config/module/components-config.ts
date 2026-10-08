import { addComponent, type Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
  addComponent({
    name: 'WorkspacePortfolioOverview',
    filePath: resolver.resolve(
      './runtime/components/Workspace/Portfolio/Overview/Index.vue'
    ),
    priority: 30,
  })
  const componentsDir = registerComponentsDir(
    resolver,
    './runtime/components',
    {
      global: false,
      pathPrefix: true,
      priority: 1,
    }
  )

  if (!componentsDir) return
  ;(nuxt.options.alias ||= {}) as Record<string, string>
  ;(nuxt.options.alias as Record<string, string>)[
    '#fireux-granite-components'
  ] = componentsDir
}
