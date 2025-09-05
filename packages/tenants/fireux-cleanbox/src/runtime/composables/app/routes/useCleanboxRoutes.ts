import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'
// Local type to avoid deep import from core (not exported to prevent auto-import duplication)
interface RouteLink {
  id: string
  label: string
  icon: string
  to: string
  children?: RouteLink[]
}

export function getCleanboxRoutes(
  hasProfile: (profileType: string) => boolean
) {
  // Get package routes
  const jobRoutes = getJobRoutes(hasProfile)

  // Future: Add cleanbox-specific routes here
  const cleanboxRoutes: RouteLink[] = []

  // Future: Add cleaner profile routes here
  const cleanboxProfileRoutes: RouteLink[] = []

  // Future: Add filtered cleanbox routes here (with profile filtering)
  const cleanboxMobileRoutes: RouteLink[] = []

  // Future development: Check for cleaner profile
  // if (hasProfile('cleaner')) {
  //   cleanboxProfileRoutes.push({
  //     id: 'cleaner-profile',
  //     label: 'Cleaner Profile',
  //     icon: 'i-lucide-spray-can',
  //     to: '/dashboard/cleaner-profile',
  //   })
  // }

  return {
    menuBarLinks: [...cleanboxRoutes, ...jobRoutes.jobRoutes],
    mobileLinks: [
      ...cleanboxProfileRoutes,
      ...jobRoutes.jobProfileRoutes,
      ...cleanboxMobileRoutes,
      ...jobRoutes.jobMobileRoutes,
    ],
  }
}
