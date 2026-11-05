import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/business/components/Workspace', {
    global: false, pathPrefix: true, prefix: 'BusinessWorkspace',
  })
  registerComponentsDir(resolver, './runtime/business/components/Business', {
    global: false,
    pathPrefix: true,
    prefix: 'Business',
  })
}
