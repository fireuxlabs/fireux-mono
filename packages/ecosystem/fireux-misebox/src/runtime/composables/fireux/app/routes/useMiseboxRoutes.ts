// packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/app/routes/useMiseboxRoutes.ts
// Tenant-only navigation builder (no core links). Provides flat array and pre-filtered subsets.
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
interface RouteLink {
  id: string
  label: string
  icon?: string
  to?: string
  children?: RouteLink[]
}

type HasProfileFn = (profileType: string) => boolean

type JobRoutesBundle = {
  jobRoutes: RouteLink[]
  jobProfileRoutes: RouteLink[]
}

const EMPTY_JOB_ROUTES: JobRoutesBundle = {
  jobRoutes: [],
  jobProfileRoutes: [],
}

async function tryImportJobs() {
  try {
    return await import(
      /* @vite-ignore */ 'fireux-jobs/runtime/composables/fireux/app/routes/useJobRoutes'
    )
  } catch {
    return null
  }
}

const jobsModule = await tryImportJobs()
const getJobRoutesOptional: null | ((hasProfile: HasProfileFn) => JobRoutesBundle) =
  (jobsModule as any)?.getJobRoutes ?? null

export function useMiseboxRoutes() {
  const { user } = useUser()

  const hasProfile = (profileType: string) => {
    const source = user.value?.profiles
    const profiles = Array.isArray(source) ? source : []
    return profiles.includes(profileType)
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
      id: 'recipes',
      label: 'Recipes',
      icon: 'i-lucide-book-open',
      to: '/recipes',
    },
  ]

  const links = computed<RouteLink[]>(() => {
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
    const jobs = getJobRoutesOptional
      ? getJobRoutesOptional(hasProfile)
      : EMPTY_JOB_ROUTES

    return [
      ...miseboxPublic,
      ...jobs.jobRoutes,
      ...profileShortcuts,
      ...jobs.jobProfileRoutes,
    ]
  })

  // Pre-filtered subsets for layout consumption
  const MENU_IDS = new Set<string>([
    'chefs',
    'suppliers',
    'recipes',
    'jobs',
    'agents',
    'professionals',
  ])
  const MOBILE_IDS = new Set<string>([
    ...Array.from(MENU_IDS),
    'chef-profile',
    'supplier-profile',
    'agent-profile',
    'professional-profile',
  ])

  const menuLinks = computed<RouteLink[]>(() =>
    links.value.filter((r) => MENU_IDS.has(r.id))
  )
  const mobileLinks = computed<RouteLink[]>(() =>
    links.value.filter((r) => MOBILE_IDS.has(r.id))
  )

  // Ready-to-pass shape for CoreDefault
  const routes = computed(() => ({
    menuBarLinks: menuLinks.value,
    mobileLinks: mobileLinks.value,
  }))

  return { links, menuLinks, mobileLinks, routes }
}
