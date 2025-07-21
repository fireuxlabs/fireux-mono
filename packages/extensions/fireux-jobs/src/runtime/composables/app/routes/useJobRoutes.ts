// Export for public job routes
import type { RouteLink } from '../../../../../../../core/fireux-core/src/runtime/types/routeLink'
import { useAppUser } from '../../../../../../../core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export async function getJobRoutes(): Promise<{
  profileRoutes: RouteLink[]
  routes: RouteLink[]
}> {
  const { hasProfile } = await useAppUser()

  console.log('getJobRoutes - hasEmployer:', hasProfile('employer'))
  console.log('getJobRoutes - hasProfessional:', hasProfile('professional'))

  const jobsRoutes: RouteLink[] = [
    { label: 'Jobs', icon: 'i-lucide-briefcase', to: '/jobs' },
    { label: 'Employers', icon: 'i-lucide-user-tie', to: '/employers' },
    { label: 'Professionals', icon: 'i-lucide-users', to: '/professionals' },
  ]

  const profileRoutes: RouteLink[] = []

  // Only show Employer Profile if user has an employer profile
  if (hasProfile('employer')) {
    profileRoutes.push({
      label: 'Employer Profile',
      icon: 'i-lucide-user-tie',
      to: '/dashboard/employer-profile',
    })
  }

  // Only show Professional Profile if user has a professional profile
  if (hasProfile('professional')) {
    profileRoutes.push({
      label: 'Professional Profile',
      icon: 'i-lucide-users',
      to: '/dashboard/professional-profile',
    })
  }

  return {
    profileRoutes,
    routes: jobsRoutes,
  }
}
