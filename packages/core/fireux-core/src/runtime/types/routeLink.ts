// Route link interface for navigation items
/**
 * Canonical RouteLink interface for navigation items (used everywhere).
 * id: required, domain-specific identifier (e.g. 'chef', 'jobs', 'admin', etc.)
 */
export interface RouteLink {
  id: string
  label: string
  icon: string
  // Leaf links have `to`; grouped links omit `to` and provide `children`
  to?: string
  children?: RouteLink[]
}
