// Returns route meta data (label and icon) for a given path - simplified version
export function getRouteMetaForPath(path: string): {
  label: string
  icon: string
} {
  // Map common profile routes to their meta data
  const routeMap: Record<string, { label: string; icon: string }> = {
    '/dashboard/profile': { label: 'User Profile', icon: 'i-lucide-user' },
    '/dashboard/professional-profile': {
      label: 'Professional Profile',
      icon: 'i-lucide-briefcase',
    },
    '/dashboard/employer-profile': {
      label: 'Company Profile',
      icon: 'i-lucide-building',
    },
    '/dashboard': { label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
    '/dashboard/account': {
      label: 'Account Settings',
      icon: 'i-lucide-settings',
    },
    '/dashboard/orders': { label: 'Orders', icon: 'i-lucide-shopping-cart' },
    '/dashboard/subscriptions': {
      label: 'Subscriptions',
      icon: 'i-lucide-credit-card',
    },
    '/dashboard/favorites': { label: 'Favorites', icon: 'i-lucide-heart' },
  }

  return (
    routeMap[path] || { label: 'Dashboard', icon: 'i-lucide-layout-dashboard' }
  )
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
