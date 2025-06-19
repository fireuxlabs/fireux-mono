// Export for public job routes
import type { RouteLink } from 'fireux-core/src/types'

export function getPublicJobRoutes(): RouteLink[] {
  return [
    {
      label: 'Jobs',
      icon: 'i-lucide-briefcase',
      to: '/jobs',
    },
  ]
}
