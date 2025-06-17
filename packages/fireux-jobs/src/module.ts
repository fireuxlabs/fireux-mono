import { defineNuxtModule, addPlugin, createResolver, addComponent, addImports } from '@nuxt/kit'

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
      nuxt: '^3.0.0'
    }
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
      jobSeekers: 'job_seekers'
    }
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add runtime config
    nuxt.options.runtimeConfig.public.fireuxJobs = {
      ...options
    }

    // Add plugin
    addPlugin(resolver.resolve('./runtime/plugin'))

    // Add composables
    addImports([
      {
        name: 'useJobs',
        from: resolver.resolve('./runtime/composables/useJobs')
      },
      {
        name: 'useJobApplications',
        from: resolver.resolve('./runtime/composables/useJobApplications')
      },
      {
        name: 'useJobSearch',
        from: resolver.resolve('./runtime/composables/useJobSearch')
      },
      {
        name: 'useEmployer',
        from: resolver.resolve('./runtime/composables/useEmployer')
      },
      {
        name: 'useJobSeeker',
        from: resolver.resolve('./runtime/composables/useJobSeeker')
      }
    ])

    // Add components
    addComponent({
      name: 'JobCard',
      filePath: resolver.resolve('./runtime/components/JobCard.vue')
    })
    
    addComponent({
      name: 'JobPostingForm',
      filePath: resolver.resolve('./runtime/components/JobPostingForm.vue')
    })
    
    addComponent({
      name: 'JobApplicationForm',
      filePath: resolver.resolve('./runtime/components/JobApplicationForm.vue')
    })
    
    addComponent({
      name: 'JobSearch',
      filePath: resolver.resolve('./runtime/components/JobSearch.vue')
    })
    
    addComponent({
      name: 'JobApplicationsList',
      filePath: resolver.resolve('./runtime/components/JobApplicationsList.vue')
    })
    
    addComponent({
      name: 'EmployerDashboard',
      filePath: resolver.resolve('./runtime/components/EmployerDashboard.vue')
    })
    
    addComponent({
      name: 'JobSeekerDashboard',
      filePath: resolver.resolve('./runtime/components/JobSeekerDashboard.vue')
    })
  }
})
