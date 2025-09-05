import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export function configureModels(_resolver: Resolver, _nuxt?: Nuxt) {
  // no-op: models are explicit imports via aliases; enable only if we emit global .d.ts
}
