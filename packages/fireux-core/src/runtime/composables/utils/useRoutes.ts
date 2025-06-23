import { useFireUXConfig } from '../FireUXConfig'
import { useAppUser } from '../firestore/AppUser/useAppUser'
import type { RouteLink } from '../../../types'

// Returns route meta data (label and icon) for a given path - simplified version
export function getRouteMetaForPath(path: string): {
  label: string
  icon: string
} {
  return { label: '', icon: '' }
}

export const useRoutes = (
  publicRoutes: RouteLink[] = [],
  privateRoutes: RouteLink[] = []
) => {
  const { appIcon, appName } = useFireUXConfig()
  const { appUser, isAdmin } = useAppUser()

  const formattedAppIcon =
    typeof appIcon === 'string' && appIcon
      ? `i-lucide-${appIcon}`
      : 'i-lucide-app'

  // Public routes - visible to everyone
  const system = [
    {
      label: typeof appName === 'string' ? appName : 'App',
      icon: formattedAppIcon,
      to: '/content',
    },
    { label: 'Products', icon: 'i-lucide-box', to: '/products' },
    { label: 'Blog', icon: 'i-lucide-book', to: '/blog' },
  ]

  // App user group routes
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

  const appUserGroup = appUser.value
    ? [
        {
          label: 'User',
          icon: 'i-lucide-user-circle',
          children: appUserRoutes,
        },
      ]
    : []

  // Admin routes
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

  // Create nested admin group for mobile and dashboard navigation
  const adminGroup = isAdmin.value
    ? [
        {
          label: 'Admin',
          icon: 'i-lucide-shield',
          children: adminRoutes,
        },
      ]
    : []

  return {
    menuBarLinks: [...system, ...publicRoutes],
    mobileLinks: [
      ...system,
      ...publicRoutes,
      ...privateRoutes,
      ...appUserGroup,
      ...adminGroup,
    ],
    dashboardLinks: [...privateRoutes, ...appUserGroup, ...adminGroup],
    subHeader: { label: '', icon: '' },
  }
}
