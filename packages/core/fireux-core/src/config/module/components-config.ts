import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from './module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
  })

  registerComponentsDir(resolver, './runtime/components/molecules', {
    global: false,
    pathPrefix: false,
  })
}
