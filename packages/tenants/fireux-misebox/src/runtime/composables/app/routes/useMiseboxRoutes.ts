import { computed } from 'vue'
import type { RouteLink } from '../../../../../../../core/fireux-core/src/runtime/types/routeLink'
import { useAppUser } from '../../../../../../../core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export async function getMiseboxRoutes() {
  const { hasProfile } = await useAppUser()

  // Get job routes to combine with misebox routes
  const jobRoutesResult = await getJobRoutes()

  const routes = computed(() => {
    console.log('[test] Computing misebox routes')

    // Get job routes from the computed result
    const jobRoutes = jobRoutesResult.value.menuBarLinks
    const jobMobileRoutes = jobRoutesResult.value.mobileLinks

    const miseboxRoutes: RouteLink[] = [
      {
        id: 'chefs',
        label: 'Chefs',
        icon: 'i-lucide-chef-hat',
        to: '/chefs',
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        icon: 'i-lucide-truck',
        to: '/suppliers',
      },
      {
        id: 'kitchens',
        label: 'Kitchens',
        icon: 'i-lucide-cooking-pot',
        to: '/kitchens',
      },
      {
        id: 'recipes',
        label: 'Recipes',
        icon: 'i-lucide-book-open',
        to: '/recipes',
      },
    ]

    const miseboxProfileRoutes: RouteLink[] = []

    // Filter out "Chefs" from mobile menu if user has chef profile
    // Filter out "Suppliers" from mobile menu if user has supplier profile
    const mobileRoutes = miseboxRoutes.filter((route) => {
      if (route.id === 'chefs' && hasProfile('chef')) return false
      if (route.id === 'suppliers' && hasProfile('supplier')) return false
      return true
    })

    if (hasProfile('chef')) {
      console.log('[test] Adding Chef Profile route')
      miseboxProfileRoutes.push({
        id: 'chef-profile',
        label: 'Chef Profile',
        icon: 'i-lucide-chef-hat',
        to: '/dashboard/chef-profile',
      })
    }

    if (hasProfile('supplier')) {
      console.log('[test] Adding Supplier Profile route')
      miseboxProfileRoutes.push({
        id: 'supplier-profile',
        label: 'Supplier Profile',
        icon: 'i-lucide-package',
        to: '/dashboard/supplier-profile',
      })
    }

    // Assemble combined routes - misebox first, then jobs
    const combinedMenuBarLinks = [...miseboxRoutes, ...jobRoutes]
    const combinedMobileLinks = [
      ...mobileRoutes,
      ...miseboxProfileRoutes,
      ...jobMobileRoutes,
    ]

    return {
      menuBarLinks: combinedMenuBarLinks,
      mobileLinks: combinedMobileLinks,
    }
  })

  return routes
}
