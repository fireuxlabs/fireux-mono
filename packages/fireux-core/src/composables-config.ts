import { addImportsDir, addImports } from '@nuxt/kit'

/**
 * Configure composables for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 */
export function configureComposables(resolver: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add composables directory for auto-import
  addImportsDir([resolvePath('./runtime/composables')])

  // Explicitly add specific composables that might not be auto-detected
  addImports([
    {
      name: 'useCreateProductState',
      from: resolvePath(
        './runtime/composables/firestore/objects/Product/useCreateProductState'
      ),
    },
    {
      name: 'useCreatePricesState',
      from: resolvePath(
        './runtime/composables/firestore/objects/Product/Prices/useCreatePricesState'
      ),
    },
    {
      name: 'useProductCreate',
      from: resolvePath(
        './runtime/composables/firestore/objects/Product/useProductCreate'
      ),
    },
    // Ensure Vue composables are available
    {
      name: 'computed',
      from: 'vue',
    },
    {
      name: 'ref',
      from: 'vue',
    },
    {
      name: 'reactive',
      from: 'vue',
    },
    {
      name: 'watch',
      from: 'vue',
    },
    {
      name: 'watchEffect',
      from: 'vue',
    },
    {
      name: 'onMounted',
      from: 'vue',
    },
    {
      name: 'onUnmounted',
      from: 'vue',
    },
  ])

  // Add type imports for the module
  addImports([
    {
      name: 'FirebaseProduct',
      from: resolvePath('./runtime/models/product.model'),
      type: true,
    },
  ])
}
