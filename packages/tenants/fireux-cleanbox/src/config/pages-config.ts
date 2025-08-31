import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  // Layered pages discovery
  // Note: idempotent push; Nuxt will resolve pages from this runtime dir
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(nuxt as any).options._layers ||= []
  ;(nuxt as any).options._layers.push({
    cwd: resolver.resolve('./runtime'),
    config: { srcDir: resolver.resolve('./runtime') },
  })
}
