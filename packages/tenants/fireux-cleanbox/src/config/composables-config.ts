import { addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  // Import base directory for simple paths
  addImportsDir(resolver.resolve('./runtime/composables'))
  addImportsDir(resolver.resolve('./runtime/composables/**'))
  // Removed model auto-import for consistency
}
