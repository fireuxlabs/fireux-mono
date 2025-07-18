// Export for misebox profile routes
import type { RouteLink } from '../../../../../../fireux-core/src/runtime/types/routeLink'
import { useAppUser } from '../../../../../../fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export async function getMiseboxProfileRoutes(): Promise<RouteLink[]> {
  // Get appUser with profile checking method
  const { hasProfile } = await useAppUser()

  console.log('getMiseboxProfileRoutes - hasChef:', hasProfile('chef'))
  console.log('getMiseboxProfileRoutes - hasSupplier:', hasProfile('supplier'))

  const routes: RouteLink[] = []

  // Only show Chef Profile if user has a chef profile
  if (hasProfile('chef')) {
    routes.push({
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  // Only show Supplier Profile if user has a supplier profile
  if (hasProfile('supplier')) {
    routes.push({
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  return routes
}
