/**
 * Composables Configuration for FireUX Misebox
 *
 * Auto-imports all Chef and Supplier composables
 */
import { Resolver, addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  // Add composables directory for auto-import
  addImportsDir(resolver.resolve('./runtime/composables'))

  // Add models directory for auto-import
  addImportsDir(resolver.resolve('./runtime/models'))
}
