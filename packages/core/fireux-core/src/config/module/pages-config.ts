import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { ensureRuntimeLayer } from './runtime-layer'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  ensureRuntimeLayer(resolver, nuxt)
}
