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
      name: 'employer-profile',
      path: '/employer-profile',
      file: './runtime/pages/employer-profile.vue',
    },
    {
      name: 'professional-profile',
      path: '/professional-profile',
      file: './runtime/pages/professional-profile.vue',
    },
  ]

  // Add pages to Nuxt
  extendPages((pages) => {
    jobPages.forEach((page) => {
      pages.push({
        name: page.name,
        path: page.path,
        file: resolvePath(page.file),
      })
    })
  })
}
