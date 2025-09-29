// packages/core/fireux-core/src/runtime/composables/app/routes/useUserRoutes.ts
import type { RouteLink } from '../../../types/routeLink'

export function useUserRoutes(): RouteLink[] {
  const userRoutes: RouteLink[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
    },
    {
      id: 'user-profile',
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/user-profile',
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: 'i-lucide-shopping-cart',
      to: '/dashboard/purchases',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: 'i-lucide-heart',
      to: '/dashboard/favorites',
    },
    {
      id: 'followers',
      label: 'Followers',
      icon: 'i-lucide-users',
      to: '/dashboard/followers',
    },
    // Settings subtree is intentionally not listed here; handled by dashboard layout group
  ]

  return userRoutes.length
    ? [
        {
          id: 'user',
          label: 'User',
          icon: 'i-lucide-user-circle',
          children: userRoutes,
        },
      ]
    : []
}
