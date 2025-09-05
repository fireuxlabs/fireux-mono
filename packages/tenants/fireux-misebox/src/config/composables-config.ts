/**
 * Composables Configuration for FireUX Misebox
 *
 * Auto-imports Chef and Supplier composables from specific directories
 */
import { addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  addImportsDir(resolver.resolve('./runtime/composables/**'))
  addImportsDir(resolver.resolve('./runtime/models'))
}
