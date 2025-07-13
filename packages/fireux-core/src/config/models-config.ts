/**
 * Configure models for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureModels(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Set up model aliases for easy importing
  nuxt.options.alias = nuxt.options.alias ?? {}

  // Main models directory
  nuxt.options.alias['#fireux-core-models'] = resolvePath('./runtime/models')

  // Organized subdirectories
  nuxt.options.alias['#fireux-core-models-core'] = resolvePath(
    './runtime/models/core'
  )
  nuxt.options.alias['#fireux-core-models-objects'] = resolvePath(
    './runtime/models/objects'
  )
  nuxt.options.alias['#fireux-core-models-profiles'] = resolvePath(
    './runtime/models/profiles'
  )
  nuxt.options.alias['#fireux-core-models-utils'] = resolvePath(
    './runtime/models/utils'
  )

  // Add models directory to TypeScript paths if needed
  if (nuxt.options.typescript) {
    nuxt.options.typescript.tsConfig = nuxt.options.typescript.tsConfig ?? {}
    nuxt.options.typescript.tsConfig.compilerOptions =
      nuxt.options.typescript.tsConfig.compilerOptions ?? {}
    nuxt.options.typescript.tsConfig.compilerOptions.paths =
      nuxt.options.typescript.tsConfig.compilerOptions.paths ?? {}

    // TypeScript path mappings
    nuxt.options.typescript.tsConfig.compilerOptions.paths[
      '#fireux-core-models/*'
    ] = [resolvePath('./runtime/models/*')]
    nuxt.options.typescript.tsConfig.compilerOptions.paths[
      '#fireux-core-models-core/*'
    ] = [resolvePath('./runtime/models/core/*')]
    nuxt.options.typescript.tsConfig.compilerOptions.paths[
      '#fireux-core-models-objects/*'
    ] = [resolvePath('./runtime/models/objects/*')]
    nuxt.options.typescript.tsConfig.compilerOptions.paths[
      '#fireux-core-models-profiles/*'
    ] = [resolvePath('./runtime/models/profiles/*')]
    nuxt.options.typescript.tsConfig.compilerOptions.paths[
      '#fireux-core-models-utils/*'
    ] = [resolvePath('./runtime/models/utils/*')]
  }

  console.log(
    'Configured FireUX Core models with organized directory structure:'
  )
  console.log('  - #fireux-core-models (main)')
  console.log('  - #fireux-core-models-core (app, user models)')
  console.log('  - #fireux-core-models-objects (content, business objects)')
  console.log('  - #fireux-core-models-profiles (profile models)')
  console.log('  - #fireux-core-models-utils (utilities, protocols)')
}
