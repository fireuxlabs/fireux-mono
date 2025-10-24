// Local type to avoid deep import from core (not exported to prevent auto-import duplication)
interface RouteLink {
  id: string
  label: string
  icon?: string
  to?: string
  children?: RouteLink[]
}

export function getCleanboxDevRoutes() {
  // Core dev routes (from fireux-core)
  const coreDevRoutes: RouteLink[] = [
    {
      id: 'dev-app',
      label: 'Apps',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/dev/apps',
    },
  ]

  // Cleanbox-specific dev routes
  const cleanboxDevRoutes: RouteLink[] = [
    {
      id: 'dev-cleanbox',
      label: 'Cleanbox Package',
      icon: 'i-heroicons-sparkles',
      to: '/dev/fireux-cleanbox',
    },
  ]

  // Combine and return complete route structure
  return {
    menuBarLinks: [...coreDevRoutes, ...cleanboxDevRoutes],
    mobileLinks: [...coreDevRoutes, ...cleanboxDevRoutes],
  }
}
