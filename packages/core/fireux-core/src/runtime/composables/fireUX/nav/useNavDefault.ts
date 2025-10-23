import { computed } from 'vue'
import { useNavIndex } from './useNavIndex'
import type { NormalizedNavItem } from '../../../types/nav'

type Item = { label: string; icon?: string; to: string }
const BASICS = ['home', 'products', 'blog'] as const

export function useNavDefault() {
  const { byKey, filter, sorted } = useNavIndex()

  const asItem = (i: NormalizedNavItem): Item => ({
    label: i.label,
    icon: i.icon,
    to: i.to,
  })

  const desktop = computed<Item[]>(() =>
    BASICS.map((k) => byKey.value.get(k))
      .filter((i): i is NormalizedNavItem => !!i)
      .map(asItem)
  )

  const mobile = computed<Item[]>(() => {
    const extras = sorted(
      filter(
        (i: NormalizedNavItem) => i.mobile && !BASICS.includes(i.key as any)
      )
    ).map(asItem)
    return [...desktop.value, ...extras]
  })

  return { desktop, mobile }
}
