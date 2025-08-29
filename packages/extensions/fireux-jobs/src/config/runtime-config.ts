// Runtime configuration for fireux-jobs module
import type { ModuleOptions } from '../module'

/**
 * Configure runtime settings for the FireUX Jobs module
 * @param nuxt Nuxt instance
 * @param options Module options
 */
export function configureRuntime(nuxt: any, options: ModuleOptions) {
  // Add runtime config for jobs module
  nuxt.options.runtimeConfig.public.fireuxJobs = {
    ...options,
  }

  console.log('FireUX Jobs module configured')
}
