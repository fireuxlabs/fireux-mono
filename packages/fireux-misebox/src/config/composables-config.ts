/**
 * Composables Configuration for FireUX Misebox
 *
 * Auto-imports all Chef and Supplier composables
 */
import { Resolver, addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add all composables with wildcard scanning
  addImportsDir([
    resolvePath('./runtime/composables'),
    resolvePath('./runtime/composables/**'),
  ])

  // Add models directory for auto-import
  addImportsDir(resolver.resolve('./runtime/models'))
}
