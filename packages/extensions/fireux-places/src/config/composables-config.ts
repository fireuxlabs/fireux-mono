import { addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver, _options?: any) {
  addImportsDir(resolver.resolve('../runtime/composables'))
}
