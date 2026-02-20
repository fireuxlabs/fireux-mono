import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { ensureRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

export function configurePages(_resolver: Resolver, nuxt: Nuxt) {
  ensureRuntimeLayer(_resolver, nuxt)
}
