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
  // Add layout components
  addComponentsDir({
    path: resolver.resolve('./runtime/components/layouts'),
    pathPrefix: false,
    prefix: 'Misebox',
    global: true,
  })

  // Add Chef components with Chef prefix to avoid naming conflicts
  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/profiles/Chef'),
    pathPrefix: true,
    prefix: 'MiseChef',
    global: true,
  })

  // Add Supplier components with Supplier prefix to avoid naming conflicts
  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/profiles/Supplier'),
    pathPrefix: true,
    prefix: 'MiseSupplier',
    global: true,
  })
}
