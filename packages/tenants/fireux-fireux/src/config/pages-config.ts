import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  // Layered pages discovery; idempotent
  ;(nuxt as any).options._layers ||= []
  ;(nuxt as any).options._layers.push({
    cwd: resolver.resolve('./runtime'),
    config: { srcDir: resolver.resolve('./runtime') },
  })
}
