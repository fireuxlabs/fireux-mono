import { addComponentsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string } = {}
) {
  // Consistent with core/jobs: domain-prefixed, non-global, no path prefix
  addComponentsDir({
  path: resolver.resolve('./runtime/components'),
    prefix: options.prefix ?? 'Mise',
    global: false,
    pathPrefix: false,
  })
}
