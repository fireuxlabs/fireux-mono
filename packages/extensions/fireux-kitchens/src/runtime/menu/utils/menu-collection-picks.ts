import type { PublicMenuIndexItem } from '../models/menu-index.model.ts'
import type { MenuRouteContext } from '../models/menu-context.model.ts'
import { readWeekdayTimeOpenState } from '../../utils/weekday-time'

export const MenuCollectionPickValues = [
  'open_now',
  'delivery',
  'collection',
  'pre_order',
] as const

export type MenuCollectionPick = typeof MenuCollectionPickValues[number]

export const menuCollectionPickProfiles: ReadonlyArray<{
  value: MenuCollectionPick
  label: string
  icon: string
}> = [
  { value: 'open_now', label: 'Open now', icon: 'i-lucide-clock-3' },
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
  menu: PublicMenuIndexItem,
  picks: readonly MenuCollectionPick[],
  now = new Date()
) {
  if (!picks.length) return true

  const contexts = new Set<MenuRouteContext>(menu.contexts ?? [])

  return picks.every((pick) => {
    if (pick === 'open_now') {
      return readWeekdayTimeOpenState(
        menu.service_hours?.operation_hours,
        now
      ).open
    }

    return contextPicks.has(pick) && contexts.has(pick as MenuRouteContext)
  })
}
