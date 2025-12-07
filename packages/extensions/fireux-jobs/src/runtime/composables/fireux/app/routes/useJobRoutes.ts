// Export for public job routes
// Local RouteLink type to avoid cross-package deep imports
export interface RouteLink {
  id: string
  label: string
  icon?: string
  to?: string
  children?: RouteLink[]
}

export function getJobRoutes(hasProfile: (profileType: string) => boolean) {
  const jobRoutes: RouteLink[] = [
    {
      id: 'jobs',
      label: 'Jobs',
      icon: 'i-lucide-briefcase',
      to: '/jobs',
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: 'i-lucide-building-2',
      to: '/agents',
    },
    {
      id: 'professionals',
      label: 'Professionals',
      icon: 'i-lucide-users',
      to: '/professionals',
    },
  ]

  const jobProfileRoutes: RouteLink[] = []

  // Do not conditionally hide public routes; UI handles active state/UX.
  const jobMobileRoutes = jobRoutes

  if (hasProfile('agent')) {
    jobProfileRoutes.push({
      id: 'agent-profile',
      label: 'Agent Profile',
      icon: 'i-lucide-building-2',
      to: '/dashboard/agent/profile',
    })
  }

  if (hasProfile('professional')) {
    jobProfileRoutes.push({
      id: 'professional-profile',
      label: 'Professional Profile',
      icon: 'i-lucide-users',
      to: '/dashboard/professional/profile',
    })
  }

  return {
    jobRoutes: jobRoutes,
    jobProfileRoutes: jobProfileRoutes,
    jobMobileRoutes: jobMobileRoutes,
  }
}
