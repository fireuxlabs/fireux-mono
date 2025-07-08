/**
 * Configure models for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureModels(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Set up model aliases for easy importing
  nuxt.options.alias = nuxt.options.alias ?? {}
  nuxt.options.alias['#fireux-core-models'] = resolvePath('./runtime/models')

  // Add models directory to TypeScript paths if needed
  if (nuxt.options.typescript) {
    nuxt.options.typescript.tsConfig = nuxt.options.typescript.tsConfig ?? {}
    nuxt.options.typescript.tsConfig.compilerOptions =
      nuxt.options.typescript.tsConfig.compilerOptions ?? {}
    nuxt.options.typescript.tsConfig.compilerOptions.paths =
      nuxt.options.typescript.tsConfig.compilerOptions.paths ?? {}
    nuxt.options.typescript.tsConfig.compilerOptions.paths[
      '#fireux-core-models/*'
    ] = [resolvePath('./runtime/models/*')]
  }

  console.log('Configured FireUX Core models')
}
