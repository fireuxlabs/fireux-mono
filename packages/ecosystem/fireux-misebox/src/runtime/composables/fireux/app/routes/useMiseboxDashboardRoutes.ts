interface RouteLink {
  id: string
  label: string
  icon?: string
  to?: string
  children?: RouteLink[]
}

type HasProfileFn = (profileType: string) => boolean

type JobDashboardRoutesBundle = {
  jobProfileRoutes: RouteLink[]
}

const EMPTY_JOB_DASHBOARD_ROUTES: JobDashboardRoutesBundle = {
  jobProfileRoutes: [],
}

async function tryImportJobs() {
  try {
    return await import(
      /* @vite-ignore */ 'fireux-jobs/runtime/composables/fireux/app/routes/useJobDashboardRoutes'
    )
  } catch {
    return null
  }
}

const jobsModule = await tryImportJobs()
const getJobDashboardRoutesOptional:
  | null
  | ((hasProfile: HasProfileFn) => JobDashboardRoutesBundle) =
  (jobsModule as any)?.getJobDashboardRoutes ?? null

export function getMiseboxDashboardRoutes(
  hasProfile: (profileType: string) => boolean
) {
  // Get dashboard profile routes from jobs extension
  const jobRoutes = getJobDashboardRoutesOptional
    ? getJobDashboardRoutesOptional(hasProfile)
    : EMPTY_JOB_DASHBOARD_ROUTES

  const miseboxProfileRoutes: RouteLink[] = []

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
    // Sidebar/dashboard menu: profiles only
    menuBarLinks: [...miseboxProfileRoutes, ...jobRoutes.jobProfileRoutes],
    // Mobile menu: same set (no public discovery links here)
    mobileLinks: [...miseboxProfileRoutes, ...jobRoutes.jobProfileRoutes],
  }
}
