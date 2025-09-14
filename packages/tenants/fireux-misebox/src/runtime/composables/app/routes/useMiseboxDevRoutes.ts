// Declare minimal type for Nuxt runtime config to satisfy package-level tsc without Nuxt context
declare function useRuntimeConfig(): { public?: { role?: string } }

export function getMiseboxDevRoutes() {
  const rc = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : undefined
  const role = rc?.public?.role
  const routes = [
    {
      id: 'dev-misebox',
      label: 'Misebox Global',
      icon: 'i-heroicons-beaker',
      to: '/dev/fireux-misebox',
    },
  ]
  if (role === 'tennant') {
    routes.push({
      id: 'dev-misebox-tennant',
      label: 'Misebox Tennant',
      icon: 'i-heroicons-home-modern',
      to: '/dev/fireux-misebox-tennant',
    })
  }
  return { miseboxDevRoutes: routes }
}
