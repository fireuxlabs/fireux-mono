import type { RouteLink } from '../../../types/routeLink'

export function useAppUserRoutes(): RouteLink[] {
  const appUserRoutes: RouteLink[] = [
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

  return appUserRoutes.length
    ? [
        {
          id: 'user',
          label: 'User',
          icon: 'i-lucide-user-circle',
          to: '/user',
          children: appUserRoutes,
        },
      ]
    : []
}
