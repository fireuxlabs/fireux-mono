// packages/core/fireux-core/src/runtime/types/nav.ts
// Types are intentionally open-ended (plain string) so tenants/extensions can define their own
// Suggested convenience constants are provided below.

export interface NavMeta {
  /** Unique key within site (prefer kebab-case) */
  key: string
  /** Shown label; if missing, falls back to route path */
  label?: string
  /** Icon name (e.g. i-lucide-*) */
  icon?: string
  /** Visual grouping in menus */
  group?: string
  /** Ordering within group/area */
  order?: number
  /** Where this item is intended to appear */
  area?: string
  /** Show in desktop default header */
  desktop?: boolean
  /** Show in mobile menu */
  mobile?: boolean
}

export interface NormalizedNavItem {
  key: string
  label: string
  icon?: string
  to: string
  group: string
  order: number
  area: string
  desktop: boolean
  mobile: boolean
  // access constraints (normalized from RouteMeta)
  requiresAuth: boolean
  roles: string[]
}

// Optional convenience constants (non-limiting)
export const NAV_GROUP = {
  Core: 'Core',
  User: 'User',
  Admin: 'Admin',
} as const
