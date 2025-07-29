// Export for misebox routes
import type { RouteLink } from '../../../../../../../core/fireux-core/src/runtime/types/routeLink'
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'
import { useAppUser } from '../../../../../../../core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export async function getMiseboxRoutes(): Promise<{
  menuBarLinks: RouteLink[]
  mobileLinks: RouteLink[]
}> {
  const { hasProfile } = await useAppUser()

  // Misebox domain navigation links
  const miseboxRoutes: RouteLink[] = [
    { id: 'chefs', label: 'Chefs', icon: 'i-lucide-chef-hat', to: '/chefs' },
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

  // Only show Chef Profile if user has a chef profile
  if (hasProfile('chef')) {
    miseboxProfileRoutes.push({
      id: 'chef-profile',
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  // Only show Supplier Profile if user has a supplier profile
  if (hasProfile('supplier')) {
    miseboxProfileRoutes.push({
      id: 'supplier-profile',
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  const jobRoutes = await getJobRoutes(hasProfile)

  return {
    menuBarLinks: [...miseboxRoutes, ...(jobRoutes.routes || [])],
    mobileLinks: [
      ...miseboxRoutes,
      ...miseboxProfileRoutes,
      ...(jobRoutes.routes || []),
      ...(jobRoutes.profileRoutes || []),
    ],
  }
}
