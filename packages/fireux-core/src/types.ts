// Export types from fireux-core

// Route link interface for navigation items
export interface RouteLink {
  label: string
  icon: string
  to: string
  children?: RouteLink[]
  requiresAuth?: boolean
  requiresCondition?: () => boolean
}
