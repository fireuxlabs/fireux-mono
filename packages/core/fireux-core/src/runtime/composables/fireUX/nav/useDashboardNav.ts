// packages/core/fireux-core/src/runtime/composables/fireUX/nav/useDashboardNav.ts
import { computed } from 'vue'
import { useNavIndex } from './useNavIndex'
import type { NormalizedNavItem } from '../../../types/nav'

type DashboardItem = {
  label: string
  icon?: string
  to: string
  group: string
  order: number
}

export function useDashboardNav() {
  const { filter, sorted } = useNavIndex()

  const items = computed<DashboardItem[]>(() =>
    sorted(
      filter(
        (i: NormalizedNavItem) =>
          i.area === 'dashboard' || i.to.startsWith('/dashboard')
      )
    ).map((i) => ({
      label: i.label,
      icon: i.icon,
      to: i.to,
      group: i.group,
      order: i.order,
    }))
  )

  // Optional split
  const user = computed(() => items.value.filter((i) => i.group !== 'Admin'))
  const admin = computed(() => items.value.filter((i) => i.group === 'Admin'))

  return { items, user, admin }
}
