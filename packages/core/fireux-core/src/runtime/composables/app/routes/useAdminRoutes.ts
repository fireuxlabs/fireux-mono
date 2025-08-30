// packages/fireux-core/src/runtime/composables/utils/adminRoutes.ts

import type { RouteLink } from '../../../types/routeLink'

/**
 * Returns grouped admin routes for navigation.
 * @returns RouteLink[]
 */
export function useAdminRoutes(): RouteLink[] {
  const adminRoutes: RouteLink[] = [
    {
      id: 'admin-overview',
      label: 'Admin Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/admin',
    },
    {
      id: 'admin-users',
      label: 'Users',
      icon: 'i-lucide-users',
      to: '/admin/users',
    },
    {
      id: 'admin-products',
      label: 'Products',
      icon: 'i-lucide-box',
      to: '/admin/products',
    },
    {
      id: 'admin-blog',
      label: 'Blog',
      icon: 'i-lucide-book',
      to: '/admin/blog',
    },
    {
      id: 'admin-settings',
      label: 'Settings',
      icon: 'i-lucide-sliders',
      to: '/admin/settings',
    },
  ]

  return adminRoutes.length
    ? [
        {
          id: 'admin',
          label: 'Admin',
          icon: 'i-lucide-shield',
          to: '/admin',
          children: adminRoutes,
        },
      ]
    : []
}
