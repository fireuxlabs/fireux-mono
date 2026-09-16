import type { MenuDirectoryEntry } from '../models/menu-directory.response.ts'
import type { MenuRouteContext } from '../models/menu-context.model.ts'

export const MenuCollectionPickValues = [
  'delivery',
  'collection',
  'pre_order',
] as const

export type MenuCollectionPick = (typeof MenuCollectionPickValues)[number]

export const menuCollectionPickProfiles: ReadonlyArray<{
  value: MenuCollectionPick
  label: string
  icon: string
}> = [
  { value: 'delivery', label: 'Delivery', icon: 'i-lucide-bike' },
  { value: 'collection', label: 'Collection', icon: 'i-lucide-shopping-bag' },
  { value: 'pre_order', label: 'Pre-order', icon: 'i-lucide-calendar-clock' },
]

const contextPicks = new Set<MenuCollectionPick>([
  'delivery',
  'collection',
  'pre_order',
])

export function menuMatchesCollectionPicks(
  menu: MenuDirectoryEntry,
  picks: readonly MenuCollectionPick[]
) {
  if (!picks.length) return true

  const contexts = new Set<MenuRouteContext>(menu.contexts ?? [])

  return picks.every((pick) => {
    return contextPicks.has(pick) && contexts.has(pick as MenuRouteContext)
  })
}
