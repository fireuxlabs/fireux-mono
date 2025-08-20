/**
 * Configure models for the FireUX Jobs module
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
/**
 * Configure models for the FireUX Jobs module
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureModels(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Set up model aliases for easy importing
  nuxt.options.alias = nuxt.options.alias || {}

  // Main models directory
  nuxt.options.alias['#fireux-jobs-models'] = resolvePath('./runtime/models')

  console.log('✅ Configured FireUX Jobs models')
}
