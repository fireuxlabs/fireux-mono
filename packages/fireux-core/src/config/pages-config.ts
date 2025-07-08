import { extendPages } from '@nuxt/kit'

/**
 * Configure pages for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configurePages(resolver: any, _nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Define all pages to be registered from the module
  const modulePages = [
    // Root pages (index page excluded - each app should have its own)
    { name: 'auth', path: '/auth', file: './runtime/pages/auth.vue' },
    {
      name: 'getting-started',
      path: '/getting-started',
      file: './runtime/pages/getting-started.vue',
    },
    { name: 'skills', path: '/skills', file: './runtime/pages/skills.vue' },

    // Admin pages
    { name: 'admin', path: '/admin', file: './runtime/pages/admin/index.vue' },
    {
      name: 'admin-blog',
      path: '/admin/blog',
      file: './runtime/pages/admin/blog.vue',
    },
    {
      name: 'admin-products',
      path: '/admin/products',
      file: './runtime/pages/admin/products.vue',
    },
    {
      name: 'admin-settings',
      path: '/admin/settings',
      file: './runtime/pages/admin/settings.vue',
    },
    {
      name: 'admin-users',
      path: '/admin/users',
      file: './runtime/pages/admin/users.vue',
    },

    // Blog pages
    { name: 'blog', path: '/blog', file: './runtime/pages/blog/index.vue' },
    {
      name: 'blog-slug',
      path: '/blog/[slug]',
      file: './runtime/pages/blog/[slug].vue',
    },

    // Dashboard pages
    {
      name: 'dashboard',
      path: '/dashboard',
      file: './runtime/pages/dashboard/index.vue',
    },
    {
      name: 'dashboard-account',
      path: '/dashboard/account',
      file: './runtime/pages/dashboard/account.vue',
    },
    {
      name: 'dashboard-favorites',
      path: '/dashboard/favorites',
      file: './runtime/pages/dashboard/favorites.vue',
    },
    {
      name: 'dashboard-orders',
      path: '/dashboard/orders',
      file: './runtime/pages/dashboard/orders.vue',
    },
    {
      name: 'dashboard-profile',
      path: '/dashboard/profile',
      file: './runtime/pages/dashboard/profile.vue',
    },
    {
      name: 'dashboard-subscriptions',
      path: '/dashboard/subscriptions',
      file: './runtime/pages/dashboard/subscriptions.vue',
    },

    // Design pages
    {
      name: 'design',
      path: '/design',
      file: './runtime/pages/design/index.vue',
    },
    {
      name: 'design-atoms-colors',
      path: '/design/atoms/colors',
      file: './runtime/pages/design/atoms/colors.vue',
    },
    {
      name: 'design-atoms-img',
      path: '/design/atoms/img',
      file: './runtime/pages/design/atoms/img.vue',
    },
    {
      name: 'design-atoms-tokens',
      path: '/design/atoms/tokens',
      file: './runtime/pages/design/atoms/tokens.vue',
    },
    {
      name: 'design-atoms-typography',
      path: '/design/atoms/typography',
      file: './runtime/pages/design/atoms/typography.vue',
    },

    // Developer pages
    {
      name: 'developer',
      path: '/developer',
      file: './runtime/pages/developer/index.vue',
    },
    {
      name: 'developer-skills',
      path: '/developer/skills',
      file: './runtime/pages/developer/skills.vue',
    },
    {
      name: 'developer-technologies',
      path: '/developer/technologies',
      file: './runtime/pages/developer/technologies.vue',
    },

    // Product pages
    {
      name: 'products',
      path: '/products',
      file: './runtime/pages/products/index.vue',
    },
    {
      name: 'products-slug',
      path: '/products/[slug]',
      file: './runtime/pages/products/[slug].vue',
    },
  ]

  // Extend pages to include all module pages
  extendPages((pages) => {
    modulePages.forEach((page) => {
      const resolvedPath = resolvePath(page.file)
      console.log(
        `Registering page: ${page.name} -> ${page.path} (${resolvedPath})`
      )

      pages.push({
        name: page.name,
        path: page.path,
        file: resolvedPath,
      })
    })
  })
}
