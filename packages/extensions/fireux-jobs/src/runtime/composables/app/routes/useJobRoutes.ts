// Export for public job routes
// Local type to avoid cross-package deep imports
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getJobRoutes(hasProfile: (profileType: string) => boolean) {
  const jobRoutes: RouteLink[] = [
    {
      id: 'jobs',
      label: 'Jobs',
      icon: 'i-lucide-briefcase',
      to: '/jobs',
    },
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

  const jobProfileRoutes: RouteLink[] = []

  // Do not conditionally hide public routes; UI handles active state/UX.
  const jobMobileRoutes = jobRoutes

  if (hasProfile('employer')) {
    jobProfileRoutes.push({
      id: 'employer-profile',
      label: 'Employer Profile',
      icon: 'i-lucide-building-2',
      to: '/dashboard/employer-profile',
    })
  }

  if (hasProfile('professional')) {
    jobProfileRoutes.push({
      id: 'professional-profile',
      label: 'Professional Profile',
      icon: 'i-lucide-users',
      to: '/dashboard/professional-profile',
    })
  }

  return {
    jobRoutes: jobRoutes,
    jobProfileRoutes: jobProfileRoutes,
    jobMobileRoutes: jobMobileRoutes,
  }
}
