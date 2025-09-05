import { addComponentsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string } = {}
) {
  addComponentsDir({
  path: resolver.resolve('./runtime/components'),
    // Default to short, brand-safe prefix
    prefix: options.prefix ?? 'Clean',
    global: false,
    pathPrefix: false,
  })
}
