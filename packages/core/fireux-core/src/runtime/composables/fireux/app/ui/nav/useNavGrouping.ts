import { computed, type Ref } from 'vue'
import type { NavItem } from '../../nav.types'

type NavPriority = {
  key?: string
  to?: string
}

type NavGroupingOptions = {
  topPriority?: NavPriority[]
  filter?: (item: NavItem) => boolean
  extras?: Ref<NavItem[]>
}

const sortNavItems = (items: NavItem[]) =>
  items.slice().sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.label.localeCompare(b.label)
  })

const isPriorityMatch = (item: NavItem, priority: NavPriority) =>
  (priority.key && item.key === priority.key) ||
  (priority.to && item.to === priority.to)

export function useNavGrouping(
  items: Ref<NavItem[]>,
  options: NavGroupingOptions = {}
) {
  const topPriority = options.topPriority ?? []
  const allowItem = options.filter ?? (() => true)

  const baseNav = computed(() =>
    sortNavItems(items.value.filter((item) => allowItem(item)))
  )

  const isTopNavItem = (item: NavItem) =>
    topPriority.some((priority) => isPriorityMatch(item, priority))

  const topPosition = (item: NavItem) =>
    topPriority.findIndex((priority) => isPriorityMatch(item, priority))

  const topNav = computed(() =>
    baseNav.value
      .filter(isTopNavItem)
      .sort((a, b) => topPosition(a) - topPosition(b))
      .filter((item) => topPosition(item) !== -1)
  )

  const bottomNav = computed(() =>
    baseNav.value.filter((item) => !isTopNavItem(item))
  )

  const middleNav = computed(() =>
    options.extras ? sortNavItems(options.extras.value) : []
  )

  return {
    baseNav,
    topNav,
    middleNav,
    bottomNav,
  }
}
