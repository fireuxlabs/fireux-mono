// Export for private job routes
import type { RouteLink } from '../../../../fireux-core/src/runtime/types/routLink'

export function getPrivateJobRoutes(): RouteLink[] {
  return [
    {
      label: 'Employer Profile',
      icon: 'i-lucide-building',
      to: '/dashboard/employer-profile',
    },
    {
      label: 'Professional Profile',
      icon: 'i-lucide-user-check',
      to: '/dashboard/professional-profile',
    },
  ]
}
