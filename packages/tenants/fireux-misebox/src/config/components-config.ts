/**
 * Components Configuration for FireUX Misebox
 *
 * Auto-imports all Chef and Supplier components with proper naming to avoid conflicts
 */
import { Resolver, addComponentsDir } from '@nuxt/kit'

export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string }
) {
  // Add Chef profile components with MiseProfiles prefix to include full path
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    pathPrefix: true,
    prefix: 'Mise',
    global: true,
  })
}