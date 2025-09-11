export function getMiseboxDevRoutes() {
  const rc = useRuntimeConfig?.() // Nuxt auto-import safe-guard
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
