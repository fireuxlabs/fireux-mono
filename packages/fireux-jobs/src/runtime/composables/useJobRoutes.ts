// Import RouteLink type from fireux-core
import type { RouteLink } from 'fireux-core/src/types'

// Simple job routes for extending the core navigation
export function getJobRoutes(): {
  dashboard: RouteLink[]
} {
  return {
    dashboard: [
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
    ],
  }
}
