// Dashboard-only job profile routes (no public discovery links)
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getJobDashboardRoutes(
  hasProfile: (profileType: string) => boolean
) {
  const jobProfileRoutes: RouteLink[] = []

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
    // Sidebar/mobile within dashboard should only show profile editors
    jobProfileRoutes,
    jobMobileRoutes: jobProfileRoutes,
  }
}
