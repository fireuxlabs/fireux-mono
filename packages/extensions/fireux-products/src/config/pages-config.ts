import type { Resolver } from '@nuxt/kit'
import { ensureRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import type { Nuxt } from 'nuxt/schema'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  ensureRuntimeLayer(resolver, nuxt)
}
