import { addImportsDir } from '@nuxt/kit'

/**
 * Configure composables for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 */
export function configureComposables(resolver: any) {
  const resolvePath = (p: string) => resolver.resolve(p)
  
  // Add all composable directories for auto-import
  addImportsDir([
    resolvePath('./runtime/composables/**'),
  ])
}
