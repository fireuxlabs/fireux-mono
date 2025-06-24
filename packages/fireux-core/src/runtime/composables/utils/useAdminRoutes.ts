// packages/fireux-core/src/runtime/composables/utils/adminRoutes.ts

// Modular, robust admin routes composable for Nuxt 3
// You can extend this to fetch, merge, or dynamically generate admin routes as needed

// Returns grouped admin routes for navigation
export function useAdminRoutes(isAdmin = true) {
  const adminRoutes = [
    {
      label: 'Admin Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/admin',
    },
    { label: 'Users', icon: 'i-lucide-users', to: '/admin/users' },
    { label: 'Products', icon: 'i-lucide-box', to: '/admin/products' },
    { label: 'Blog', icon: 'i-lucide-book', to: '/admin/blog' },
    { label: 'Settings', icon: 'i-lucide-sliders', to: '/admin/settings' },
  ]

  const adminGroup =
    isAdmin && adminRoutes.length
      ? [{ label: 'Admin', icon: 'i-lucide-shield', children: adminRoutes }]
      : []

  return adminGroup
}
