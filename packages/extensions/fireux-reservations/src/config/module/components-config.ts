import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/property/components/Console', {
    global: true,
    pathPrefix: true,
    prefix: 'ConsoleProperty',
    priority: 1,
  })
}
