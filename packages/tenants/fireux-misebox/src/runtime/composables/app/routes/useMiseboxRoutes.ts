// Export for misebox routes
import type { RouteLink } from '../../../../../../../core/fireux-core/src/runtime/types/routeLink'
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export function getMiseboxRoutes(): RouteLink[] {
  // Get job marketplace routes from jobs package
  const jobRoutes = getJobRoutes()

  // Define Misebox-specific food marketplace routes
  const miseboxFoodRoutes: RouteLink[] = [
    { label: 'Chefs', icon: 'i-lucide-chef-hat', to: '/chefs' },
    { label: 'Suppliers', icon: 'i-lucide-truck', to: '/suppliers' },
    { label: 'Kitchens', icon: 'i-lucide-cooking-pot', to: '/kitchens' },
    { label: 'Recipes', icon: 'i-lucide-book-open', to: '/recipes' },
  ]

  // Combine food routes with job routes
  return [...miseboxFoodRoutes, ...jobRoutes]
}
