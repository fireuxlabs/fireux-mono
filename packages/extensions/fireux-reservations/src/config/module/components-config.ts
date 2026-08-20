import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/property/components/Workspace', {
    global: true,
    pathPrefix: true,
    prefix: 'WorkspaceProperty',
    priority: 1,
  })
}
