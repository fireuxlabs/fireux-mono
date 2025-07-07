import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions } from '../module'

export async function configureModels(
  resolver: Resolver,
  options: ModuleOptions
) {
  // Models configuration - copy model files to runtime
  // This will be used for TypeScript interfaces and types
  console.log('FireUX Places: Models configured')
}
