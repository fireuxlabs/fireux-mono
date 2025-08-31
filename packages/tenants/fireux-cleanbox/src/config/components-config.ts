import { addComponentsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string } = {}
) {
  addComponentsDir({
    path: resolver.resolve('../runtime/components'),
    prefix: options.prefix ?? 'Cleanbox',
    global: false,
    pathPrefix: false,
  })
}
