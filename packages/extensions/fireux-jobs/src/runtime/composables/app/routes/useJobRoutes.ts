// Export for public job routes
import { computed } from 'vue'
import type { RouteLink } from '../../../../../../../core/fireux-core/src/runtime/types/routeLink'
import { useAppUser } from '../../../../../../../core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export async function getJobRoutes() {
  const { hasProfile } = await useAppUser()

  const routes = computed(() => {
    console.log('[test] Computing job routes')

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

    // Filter out "Employers" from mobile menu if user has employer profile
    // Filter out "Professionals" from mobile menu if user has professional profile
    const mobileRoutes = jobRoutes.filter((route) => {
      if (route.id === 'employers' && hasProfile('employer')) return false
      if (route.id === 'professionals' && hasProfile('professional'))
        return false
      return true
    })

    if (hasProfile('employer')) {
      console.log('[test] Adding Employer Profile route')
      jobProfileRoutes.push({
        id: 'employer-profile',
        label: 'Employer Profile',
        icon: 'i-lucide-building-2',
        to: '/dashboard/employer-profile',
      })
    }

    if (hasProfile('professional')) {
      console.log('[test] Adding Professional Profile route')
      jobProfileRoutes.push({
        id: 'professional-profile',
        label: 'Professional Profile',
        icon: 'i-lucide-users',
        to: '/dashboard/professional-profile',
      })
    }

    return {
      menuBarLinks: jobRoutes,
      mobileLinks: [...mobileRoutes, ...jobProfileRoutes],
    }
  })

  return routes
}
