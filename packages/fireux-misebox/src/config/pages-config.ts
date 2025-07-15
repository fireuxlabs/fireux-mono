/**
 * Pages Configuration for FireUX Misebox
 *
 * Auto-registers Chef and Supplier pages
 */
import { Resolver, extendPages } from '@nuxt/kit'

export function configurePages(resolver: Resolver, nuxt: any) {
  // Extend pages with misebox-specific routes
  extendPages((pages) => {
    // Add Chef pages
    pages.push({
      name: 'chefs-index',
      path: '/chefs',
      file: resolver.resolve('./runtime/pages/chefs/index.vue'),
      meta: {
        title: 'Browse Chefs',
        description: 'Find talented chefs for your kitchen needs',
      },
    })

    pages.push({
      name: 'chef-profile',
      path: '/chefs/:id',
      file: resolver.resolve('./runtime/pages/chefs/[id].vue'),
      meta: {
        title: 'Chef Profile',
        description: 'View chef profile and details',
      },
    })

    // Add Supplier pages
    pages.push({
      name: 'suppliers-index',
      path: '/suppliers',
      file: resolver.resolve('./runtime/pages/suppliers/index.vue'),
      meta: {
        title: 'Browse Suppliers',
        description: 'Find reliable suppliers for your restaurant needs',
      },
    })

    pages.push({
      name: 'supplier-profile',
      path: '/suppliers/:id',
      file: resolver.resolve('./runtime/pages/suppliers/[id].vue'),
      meta: {
        title: 'Supplier Profile',
        description: 'View supplier profile and details',
      },
    })
  })

  console.log(
    '📄 Misebox pages registered: /chefs, /suppliers with profile routes'
  )
}
