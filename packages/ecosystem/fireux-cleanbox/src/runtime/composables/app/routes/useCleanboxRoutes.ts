import { computed } from 'vue'
interface RouteLink {
  id: string
  label: string
  icon?: string
  to?: string
  children?: RouteLink[]
}

// Flat tenant-only links (currently none)
export function useCleanboxRoutes() {
  // For default layout, we only need a flat list to filter; leave empty until tenant adds public links.
  const links = computed<RouteLink[]>(() => [])
  return { links }
}
