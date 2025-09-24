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
      id: 'profile',
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/profile',
    },
    {
      id: 'account',
      label: 'Account',
      icon: 'i-lucide-settings',
      to: '/dashboard/account',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'i-lucide-shopping-cart',
      to: '/dashboard/orders',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: 'i-lucide-credit-card',
      to: '/dashboard/subscriptions',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: 'i-lucide-heart',
      to: '/dashboard/favorites',
    },
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
