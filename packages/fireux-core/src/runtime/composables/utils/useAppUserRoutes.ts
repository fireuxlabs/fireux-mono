// Returns route meta data (label and icon) for a given path - simplified version
export function getRouteMetaForPath(path: string): {
  label: string
  icon: string
} {
  return { label: '', icon: '' }
}

// Returns grouped app user routes for navigation
export function useAppUserRoutes() {
  const appUserRoutes = [
    { label: 'Overview', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
    { label: 'Profile', icon: 'i-lucide-user', to: '/dashboard/profile' },
    { label: 'Account', icon: 'i-lucide-settings', to: '/dashboard/account' },
    {
      label: 'Orders',
      icon: 'i-lucide-shopping-cart',
      to: '/dashboard/orders',
    },
    {
      label: 'Subscriptions',
      icon: 'i-lucide-credit-card',
      to: '/dashboard/subscriptions',
    },
    { label: 'Favorites', icon: 'i-lucide-heart', to: '/dashboard/favorites' },
  ]

  return appUserRoutes.length
    ? [{ label: 'User', icon: 'i-lucide-user-circle', children: appUserRoutes }]
    : []
}
