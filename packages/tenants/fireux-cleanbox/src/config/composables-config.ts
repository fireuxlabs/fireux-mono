import { addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  const resolvePath = (p: string) => resolver.resolve(p)
  addImportsDir([resolvePath('./runtime/composables/**')])
  // Optionally, add models directory for auto-import (uncomment if needed):
  // addImportsDir(resolvePath('./runtime/models'))
  console.log('🧽 CleanBox composables auto-imported')
}
