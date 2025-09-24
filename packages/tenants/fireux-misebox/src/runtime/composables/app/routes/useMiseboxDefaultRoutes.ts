import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'
// Local type to avoid deep import from core
export interface RouteLink {
  id: string
  label: string
  icon: string
  to: string
  children?: RouteLink[]
}

export function getMiseboxDefaultRoutes(
  hasProfile: (profileType: string) => boolean
) {
  // Get package routes
  const jobRoutes = getJobRoutes(hasProfile)

  // Public Misebox routes (default layout header)
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

  // Hide public links that have a direct dashboard shortcut for the user (mobile menu only)
  const miseboxMobileRoutes = miseboxRoutes.filter((route) => {
    if (route.id === 'chefs' && hasProfile('chef')) return false
    if (route.id === 'suppliers' && hasProfile('supplier')) return false
    return true
  })

  // Dashboard shortcuts (only if user has those profiles)
  if (hasProfile('chef')) {
    miseboxProfileRoutes.push({
      id: 'chef-profile',
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  if (hasProfile('supplier')) {
    miseboxProfileRoutes.push({
      id: 'supplier-profile',
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  return {
    // Desktop header: public discovery + jobs public
    menuBarLinks: [...miseboxRoutes, ...jobRoutes.jobRoutes],
    // Mobile menu: dashboard shortcuts (if any) + filtered public + jobs mobile
    mobileLinks: [
      ...miseboxProfileRoutes,
      ...jobRoutes.jobProfileRoutes,
      ...miseboxMobileRoutes,
      ...jobRoutes.jobMobileRoutes,
    ],
  }
}
