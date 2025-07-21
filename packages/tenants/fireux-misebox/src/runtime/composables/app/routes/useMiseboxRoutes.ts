// Export for misebox routes
import type { RouteLink } from '../../../../../../../core/fireux-core/src/runtime/types/routeLink'
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'
import { useAppUser } from '../../../../../../../core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export async function getMiseboxRoutes(): Promise<{
  profileRoutes: RouteLink[]
  routes: RouteLink[]
}> {
  // Get job marketplace routes from jobs package
  const jobRoutesResult = await getJobRoutes()
  const jobProfileRoutes = jobRoutesResult.profileRoutes || []
  const jobRoutes = jobRoutesResult.routes || []

  // Define Misebox-specific food marketplace routes
  const miseboxRoutes: RouteLink[] = [
    { label: 'Chefs', icon: 'i-lucide-chef-hat', to: '/chefs' },
    { label: 'Suppliers', icon: 'i-lucide-truck', to: '/suppliers' },
    { label: 'Kitchens', icon: 'i-lucide-cooking-pot', to: '/kitchens' },
    { label: 'Recipes', icon: 'i-lucide-book-open', to: '/recipes' },
  ]

  // Get appUser with profile checking method
  const { hasProfile } = await useAppUser()

  console.log('getMiseboxRoutes - hasChef:', hasProfile('chef'))
  console.log('getMiseboxRoutes - hasSupplier:', hasProfile('supplier'))

  const profileRoutes: RouteLink[] = []

  // Only show Chef Profile if user has a chef profile
  if (hasProfile('chef')) {
    profileRoutes.push({
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  // Only show Supplier Profile if user has a supplier profile
  if (hasProfile('supplier')) {
    profileRoutes.push({
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  // Combine all routes
  return {
    profileRoutes: [...profileRoutes, ...jobProfileRoutes],
    routes: [...miseboxRoutes, ...jobRoutes],
  }
}
