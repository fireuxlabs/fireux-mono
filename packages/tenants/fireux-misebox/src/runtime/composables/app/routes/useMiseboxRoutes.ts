// packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxRoutes.ts
// Tenant-only navigation builder (no core links). Provides flat array which the layout filters.

export interface RouteLink {
  id: string
  label: string
  icon: string
  to: string
  children?: RouteLink[]
}

import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export function useMiseboxRoutes() {
  const { user } = useUser()

  const hasProfile = (profileType: string) => {
    const app = user.value?.app
    if (!app) return false
    const list = Array.isArray(app?.app_profiles) ? app.app_profiles : []
    return list.includes(profileType)
  }

  // Public Misebox discovery routes
  const miseboxPublic: RouteLink[] = [
    { id: 'chefs', label: 'Chefs', icon: 'i-lucide-chef-hat', to: '/chefs' },
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

  // Profile shortcuts (dashboard) conditional
  const profileShortcuts: RouteLink[] = []
  if (hasProfile('chef')) {
    profileShortcuts.push({
      id: 'chef-profile',
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }
  if (hasProfile('supplier')) {
    profileShortcuts.push({
      id: 'supplier-profile',
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  // Jobs extension routes (public + profile/dashboard flavor)
  const jobs = getJobRoutes(hasProfile)

  const links: RouteLink[] = [
    ...miseboxPublic,
    ...jobs.jobRoutes,
    ...profileShortcuts,
    ...jobs.jobProfileRoutes,
  ]

  return { links }
}
