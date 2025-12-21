import { useRuntimeConfig } from '#imports'

export function getMiseboxDevRoutes() {
  const rc = useRuntimeConfig() as any
  const role = rc?.public?.role

  const routes = [
    {
      id: 'dev-misebox',
      label: 'Misebox Global',
      icon: 'i-heroicons-beaker',
      to: '/dev/fireux-misebox',
    },
    {
      id: 'dev-jobs',
      label: 'Jobs Global',
      icon: 'i-lucide-briefcase',
      to: '/dev/fireux-jobs',
    },
  ]

  if (role === 'tenant') {
    routes.push(
      {
        id: 'dev-misebox-tenant',
        label: 'Misebox Tenant',
        icon: 'i-heroicons-home-modern',
        to: '/dev/fireux-misebox-tenant',
      },
      {
        id: 'dev-jobs-tenant',
        label: 'Jobs Tenant',
        icon: 'i-lucide-building-2',
        to: '/dev/fireux-jobs-tenant',
      }
    )
  }

  return { miseboxDevRoutes: routes }
}
