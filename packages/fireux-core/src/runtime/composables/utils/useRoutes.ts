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

export const useRoutes = (appLinks: RouteLink[] = []) => {
  const { appIcon, appName } = useFireUXConfig()
  const { appUser } = useAppUser()

  // Ensure appLinks is always an array
  const safeAppLinks = Array.isArray(appLinks) ? appLinks : []

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

  // App user routes - only visible to authenticated app users
  const appUserRoutes = appUser
    ? [
        {
          label: 'Overview',
          icon: 'i-lucide-layout-dashboard',
          to: '/dashboard',
        },
        {
          label: 'Profile',
          icon: 'i-lucide-user',
          to: '/dashboard/profile',
        },
        {
          label: 'Account',
          icon: 'i-lucide-settings',
          to: '/dashboard/account',
        },
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
        {
          label: 'Favorites',
          icon: 'i-lucide-heart',
          to: '/dashboard/favorites',
        },
      ]
    : []

  // Admin routes - only visible to admin users
  const adminRoutes =
    appUser.value && appUser.value.role === 'admin'
      ? [
          {
            label: 'Admin Overview',
            icon: 'i-lucide-layout-dashboard',
            to: '/admin',
          },
          {
            label: 'Users',
            icon: 'i-lucide-users',
            to: '/admin/users',
          },
          {
            label: 'Products',
            icon: 'i-lucide-box',
            to: '/admin/products',
          },
          {
            label: 'Blog',
            icon: 'i-lucide-book',
            to: '/admin/blog',
          },
          {
            label: 'Settings',
            icon: 'i-lucide-sliders',
            to: '/admin/settings',
          },
        ]
      : []

  // Create nested user group for mobile navigation to save space
  const userGroup = appUser.value
    ? [
        {
          label: 'User',
          icon: 'i-lucide-user-circle',
          children: appUserRoutes,
        },
      ]
    : []

  // Create nested admin group for both mobile and dashboard navigation
  const adminGroup =
    adminRoutes.length > 0
      ? [
          {
            label: 'Admin',
            icon: 'i-lucide-shield',
            children: adminRoutes,
          },
        ]
      : []

  // Combine routes based on authentication status
  const menuBarLinks = [...system]
  const mobileLinks = [...system, ...safeAppLinks, ...userGroup, ...adminGroup]
  const dashboardLinks = [...appUserRoutes, ...safeAppLinks, ...adminGroup]

  return {
    menuBarLinks: menuBarLinks,
    mobileLinks: mobileLinks,
    dashboardLinks: dashboardLinks,
    subHeader: { label: '', icon: '' },
  }
}
