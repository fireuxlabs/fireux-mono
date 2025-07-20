// Pages configuration for fireux-jobs module
import { extendPages } from '@nuxt/kit'

/**
 * Configure pages for the FireUX Jobs module
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configurePages(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Define all job-related pages to be registered from the module
  const jobPages = [
    {
      name: 'jobs',
      path: '/jobs',
      file: './runtime/pages/jobs/index.vue',
    },
    {
      name: 'dashboard-employer-profile',
      path: '/dashboard/employer-profile',
      file: './runtime/pages/dashboard/employer-profile.vue',
    },
    {
      name: 'dashboard-professional-profile',
      path: '/dashboard/professional-profile',
      file: './runtime/pages/dashboard/professional-profile.vue',
    },
    {
      name: 'employers',
      path: '/employers',
      file: './runtime/pages/employers/index.vue',
    },
    {
      name: 'employer-public-profile',
      path: '/employers/[id]',
      file: './runtime/pages/employers/[id].vue',
    },
    {
      name: 'professionals',
      path: '/professionals',
      file: './runtime/pages/professionals/index.vue',
    },
    {
      name: 'professional-public-profile',
      path: '/professionals/[id]',
      file: './runtime/pages/professionals/[id].vue',
    },
  ]

  // Add pages to Nuxt
  extendPages((pages) => {
    jobPages.forEach((page) => {
      const resolvedPath = resolvePath(page.file)
      console.log(
        `Registering job page: ${page.name} -> ${page.path} (${resolvedPath})`
      )

      pages.push({
        name: page.name,
        path: page.path,
        file: resolvedPath,
      })
    })
  })
}
