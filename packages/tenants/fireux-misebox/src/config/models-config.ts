import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export function configureModels(_resolver: Resolver, _nuxt?: Nuxt) {
  // No tenant-local type generation; models are runtime-only here.
}
