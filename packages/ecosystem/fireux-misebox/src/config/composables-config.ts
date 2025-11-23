/**
 * Composables Configuration for FireUX Misebox
 *
 * Auto-imports Chef and Supplier composables from specific directories
 */
import { addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  // Import base directory for simple paths
  addImportsDir(resolver.resolve('./runtime/composables'))
  addImportsDir(resolver.resolve('./runtime/composables/**'))
  // Removed auto-import for models to treat them as separate
}
