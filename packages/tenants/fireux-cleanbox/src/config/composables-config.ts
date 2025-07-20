import { addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  addImportsDir(resolver.resolve('./runtime/composables'))
  
  console.log('🧽 CleanBox composables auto-imported')
}
