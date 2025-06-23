// Export for private job routes
import type { RouteLink } from 'fireux-core/src/types'

export function getPrivateJobRoutes(): RouteLink[] {
  return [
    {
      label: 'Employer Profile',
      icon: 'i-lucide-building',
      to: '/jobs-dashboard/employer-profile',
    },
    {
      label: 'Professional Profile',
      icon: 'i-lucide-user-check',
      to: '/jobs-dashboard/professional-profile',
    },
  ]
}
