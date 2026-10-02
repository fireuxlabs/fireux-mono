import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  requireNativeRuntimeLayer(resolver, nuxt)
}
