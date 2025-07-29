// Export for public job routes
import type { RouteLink } from '../../../../../../../core/fireux-core/src/runtime/types/routeLink'
import { useAppUser } from '../../../../../../../core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export async function getJobRoutes(
  hasProfile?: (profileType: string) => boolean
): Promise<{
  profileRoutes: RouteLink[]
  routes: RouteLink[]
}> {
  // If hasProfile is not provided, get it from useAppUser
  const profileChecker = hasProfile || (await useAppUser()).hasProfile

  console.log('getJobRoutes - hasEmployer:', profileChecker('employer'))
  console.log('getJobRoutes - hasProfessional:', profileChecker('professional'))

  const jobsRoutes: RouteLink[] = [
    { id: 'jobs', label: 'Jobs', icon: 'i-lucide-briefcase', to: '/jobs' },
    {
      id: 'employers',
      label: 'Employers',
      icon: 'i-lucide-building-2',
      to: '/employers',
    },
    {
      id: 'professionals',
      label: 'Professionals',
      icon: 'i-lucide-users',
      to: '/professionals',
    },
  ]

  const profileRoutes: RouteLink[] = []

  // Only show Employer Profile if user has an employer profile
  if (profileChecker('employer')) {
    profileRoutes.push({
      id: 'employer-profile',
      label: 'Employer Profile',
      icon: 'i-lucide-building-2',
      to: '/dashboard/employer-profile',
    })
  }

  // Only show Professional Profile if user has a professional profile
  if (profileChecker('professional')) {
    profileRoutes.push({
      id: 'professional-profile',
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
