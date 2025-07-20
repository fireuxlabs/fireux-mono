/**
 * Composables Configuration for FireUX Misebox
 *
 * Auto-imports Chef and Supplier composables from specific directories
 */
import { Resolver, addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add all composable directories for auto-import
  addImportsDir([
    resolvePath('./runtime/composables/**'),
  ])

  // Add models directory for auto-import
  addImportsDir(resolver.resolve('./runtime/models'))
}
