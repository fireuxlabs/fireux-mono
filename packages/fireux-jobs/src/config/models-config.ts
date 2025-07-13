/**
 * Configure models for the FireUX Jobs module
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureModels(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Set up model aliases for easy importing
  nuxt.options.alias = nuxt.options.alias || {}

  // Main models directory with wildcard support
  nuxt.options.alias['#fireux-jobs-models'] = resolvePath('./runtime/models')

  // Add models directory to TypeScript paths with wildcards
  if (nuxt.options.typescript) {
    nuxt.options.typescript.tsConfig = nuxt.options.typescript.tsConfig || {}
    nuxt.options.typescript.tsConfig.compilerOptions =
      nuxt.options.typescript.tsConfig.compilerOptions || {}
    nuxt.options.typescript.tsConfig.compilerOptions.paths =
      nuxt.options.typescript.tsConfig.compilerOptions.paths || {}

    // Dynamic TypeScript path mappings with wildcards - auto-discovers subdirectories
    nuxt.options.typescript.tsConfig.compilerOptions.paths[
      '#fireux-jobs-models/*'
    ] = [resolvePath('./runtime/models/*')]
    nuxt.options.typescript.tsConfig.compilerOptions.paths[
      '#fireux-jobs-models/**/*'
    ] = [resolvePath('./runtime/models/**/*')]
  }

  console.log('✅ Configured FireUX Jobs models with dynamic structure:')
  console.log('   � #fireux-jobs-models/* → auto-discovers all subdirectories')
  console.log(
    '   📁 Available: profiles/, objects/, and any future directories'
  )
}
