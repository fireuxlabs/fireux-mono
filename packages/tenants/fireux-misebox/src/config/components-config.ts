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
  // Add Chef profile components with MiseChef prefix
  addComponentsDir({
    path: resolver.resolve(
      './runtime/components/organisms/profiles/Chef/Cards'
    ),
    pathPrefix: false,
    prefix: 'MiseChef',
    global: true,
  })

  // Add Supplier profile components with MiseSupplier prefix
  addComponentsDir({
    path: resolver.resolve(
      './runtime/components/organisms/profiles/Supplier/Cards'
    ),
    pathPrefix: false,
    prefix: 'MiseSupplier',
    global: true,
  })

  // Add Chef management components
  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/profiles/Chef'),
    pathPrefix: false,
    prefix: 'MiseChef',
    global: true,
    pattern: '*.vue', // Only direct files, not Cards folder
  })

  // Add Supplier management components
  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/profiles/Supplier'),
    pathPrefix: false,
    prefix: 'MiseSupplier',
    global: true,
    pattern: '*.vue', // Only direct files, not Cards folder
  })
}
