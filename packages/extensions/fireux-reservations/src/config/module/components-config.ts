import { addComponent, type Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  addComponent({
    name: 'WorkspacePropertyOverview',
    filePath: resolver.resolve(
      './runtime/property/components/Workspace/Overview/Index.vue'
    ),
    priority: 30,
  })
  registerComponentsDir(resolver, './runtime/property/components/Workspace', {
    global: true,
    pathPrefix: true,
    prefix: 'WorkspaceProperty',
    priority: 1,
  })
}
