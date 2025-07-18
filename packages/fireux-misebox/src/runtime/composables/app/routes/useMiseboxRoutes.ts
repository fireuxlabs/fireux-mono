// Export for misebox routes
import type { RouteLink } from '../../../../../../fireux-core/src/runtime/types/routeLink'

export function getMiseboxRoutes(): RouteLink[] {
  return [
    { label: 'Chefs', icon: 'i-lucide-cooking-pot', to: '/chefs' },
    { label: 'Suppliers', icon: 'i-lucide-truck', to: '/suppliers' },
  ]
}
