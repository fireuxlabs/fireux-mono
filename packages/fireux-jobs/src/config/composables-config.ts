import { addImportsDir } from '@nuxt/kit'

/**
 * Configure composables for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 */
export function configureComposables(resolver: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add all composables with wildcard scanning
  addImportsDir([
    resolvePath('./runtime/composables'),
    resolvePath('./runtime/composables/**'),
  ])
}
