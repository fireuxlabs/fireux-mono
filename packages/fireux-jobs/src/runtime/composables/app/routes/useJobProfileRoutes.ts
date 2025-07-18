// Export for private job routes
import type { RouteLink } from '../../../../../../fireux-core/src/runtime/types/routeLink'
import { useAppUser } from '../../../../../../fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export async function getJobProfileRoutes(): Promise<RouteLink[]> {
  // Get appUser with profile checking method
  const { hasProfile } = await useAppUser()

  console.log('getJobProfileRoutes - hasEmployer:', hasProfile('employer'))
  console.log(
    'getJobProfileRoutes - hasProfessional:',
    hasProfile('professional')
  )

  const routes: RouteLink[] = []

  // Only show Employer Profile if user has an employer profile
  if (hasProfile('employer')) {
    routes.push({
      label: 'Employer Profile',
      icon: 'i-lucide-building',
      to: '/dashboard/employer-profile',
    })
  }

  // Only show Professional Profile if user has a professional profile
  if (hasProfile('professional')) {
    routes.push({
      label: 'Professional Profile',
      icon: 'i-lucide-user-check',
      to: '/dashboard/professional-profile',
    })
  }

  return routes
}
