import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getMiseboxRoutes(hasProfile: (profileType: string) => boolean) {
  // Get package routes
  const jobRoutes = getJobRoutes(hasProfile)

  // General misebox routes
  const miseboxRoutes: RouteLink[] = [
    {
      id: 'chefs',
      label: 'Chefs',
      icon: 'i-lucide-chef-hat',
      to: '/chefs',
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: 'i-lucide-truck',
      to: '/suppliers',
    },
    {
      id: 'kitchens',
      label: 'Kitchens',
      icon: 'i-lucide-cooking-pot',
      to: '/kitchens',
    },
    {
      id: 'recipes',
      label: 'Recipes',
      icon: 'i-lucide-book-open',
      to: '/recipes',
    },
  ]

  const miseboxProfileRoutes: RouteLink[] = []

  // Filter out "Chefs" from mobile menu if user has chef profile
  // Filter out "Suppliers" from mobile menu if user has supplier profile
  const miseboxMobileRoutes = miseboxRoutes.filter((route) => {
    if (route.id === 'chefs' && hasProfile('chef')) return false
    if (route.id === 'suppliers' && hasProfile('supplier')) return false
    return true
  })

  // Add chef profile route
  if (hasProfile('chef')) {
    miseboxProfileRoutes.push({
      id: 'chef-profile',
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  // Add supplier profile route
  if (hasProfile('supplier')) {
    miseboxProfileRoutes.push({
      id: 'supplier-profile',
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  return {
    menuBarLinks: [...miseboxRoutes, ...jobRoutes.jobRoutes],
    mobileLinks: [
      ...miseboxProfileRoutes,
      ...jobRoutes.jobProfileRoutes,
      ...miseboxMobileRoutes,
      ...jobRoutes.jobMobileRoutes,
    ],
  }
}
