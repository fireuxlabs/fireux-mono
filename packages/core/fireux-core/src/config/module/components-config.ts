import type { Resolver } from '@nuxt/kit'
import {
  registerComponentAliases,
  registerComponentsDir,
} from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
  })

  registerComponentsDir(resolver, './runtime/components/molecules', {
    global: false,
    pathPrefix: false,
  })

  registerComponentAliases(resolver, './runtime/components/organisms/App', 'App', {
    global: true,
  })
  registerComponentAliases(resolver, './runtime/components/organisms/Auth', 'Auth', {
    global: true,
  })
  registerComponentAliases(resolver, './runtime/components/organisms/Ecosystem', 'Ecosystem', {
    global: true,
  })
  registerComponentAliases(resolver, './runtime/components/organisms/Project', 'Project', {
    global: true,
  })
  registerComponentAliases(resolver, './runtime/components/organisms/User', 'User', {
    global: true,
  })
}
