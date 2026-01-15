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
  jobMobileRoutes: RouteLink[]
}

const EMPTY_JOB_ROUTES: JobRoutesBundle = {
  jobRoutes: [],
  jobProfileRoutes: [],
  jobMobileRoutes: [],
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

export function getMiseboxDefaultRoutes(
  hasProfile: (profileType: string) => boolean
) {
  // Get package routes
  const jobRoutes = getJobRoutesOptional
    ? getJobRoutesOptional(hasProfile)
    : EMPTY_JOB_ROUTES

  // Public Misebox routes (default layout header)
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
      id: 'recipes',
      label: 'Recipes',
      icon: 'i-lucide-book-open',
      to: '/recipes',
    },
  ]

  const miseboxProfileRoutes: RouteLink[] = []

  // Dashboard shortcuts (only if user has those profiles)
  if (hasProfile('chef')) {
    miseboxProfileRoutes.push({
      id: 'chef-profile',
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  if (hasProfile('supplier')) {
    miseboxProfileRoutes.push({
      id: 'supplier-profile',
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  return {
    // Desktop header: public discovery + jobs public
    menuBarLinks: [...miseboxRoutes, ...jobRoutes.jobRoutes],
    // Mobile menu: dashboard shortcuts (if any) + filtered public + jobs mobile
    mobileLinks: [
      ...miseboxProfileRoutes,
      ...jobRoutes.jobProfileRoutes,
      ...miseboxRoutes,
      ...jobRoutes.jobMobileRoutes,
    ],
  }
}
