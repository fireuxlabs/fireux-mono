import { defineNuxtModule, createResolver, extendPages } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Enable job posting functionality
   * @default true
   */
  posting: boolean
  /**
   * Enable job application functionality
   * @default true
   */
  applications: boolean
  /**
   * Enable job search and filtering
   * @default true
   */
  search: boolean
  /**
   * Firebase collection names
   */
  collections: {
    jobs: string
    applications: string
    employers: string
    jobSeekers: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    configKey: 'fireuxJobs',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    posting: true,
    applications: true,
    search: true,
    collections: {
      jobs: 'jobs',
      applications: 'job_applications',
      employers: 'employers',
      jobSeekers: 'job_seekers',
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add runtime config
    nuxt.options.runtimeConfig.public.fireuxJobs = {
      ...options,
    }

    // Add pages
    extendPages((pages) => {
      pages.push({
        name: 'dashboard-employer-profile',
        path: '/dashboard/employer-profile',
        file: resolver.resolve(
          './runtime/pages/dashboard/employer-profile.vue'
        ),
      })
      pages.push({
        name: 'dashboard-professional-profile',
        path: '/dashboard/professional-profile',
        file: resolver.resolve(
          './runtime/pages/dashboard/professional-profile.vue'
        ),
      })
    })

    // Module setup complete - ready for job models
    console.log('FireUX Jobs module configured')
  },
})

// Export composables for direct import
export { getJobRoutes } from './runtime/composables/useJobRoutes'
