import { computed, ref } from 'vue'
import {
  menuLocalDate,
  nextSpecialRelease,
  publishedMenuDates,
} from '../../../../menu/utils/calendar/daily'
import { useDatedMenuDishRead } from '../../../../menu/composables/useDatedMenuDishRead'
import { shiftMenuDate } from '../../../../menu/utils/calendar/date'
import { useKitchenOfferingNow } from '../../useKitchenOfferingNow'
import type { Menu } from '../../../../menu/models/menu.model'

export function useKitchenWorkspaceMenuSpecials(
  props: Readonly<{
    menu: Menu
    kitchenId: string
    timezone: string
  }>
) {
  const { now } = useKitchenOfferingNow()
  const today = computed(() =>
    props.timezone ? menuLocalDate(props.timezone, now.value) : ''
  )
  const days = computed(() =>
    props.menu.status === 'published'
      ? publishedMenuDates(props.menu.published_dates)
      : []
  )
  const selected = ref('')
  const date = computed(() => {
    if (!today.value) return ''
    if (selected.value >= today.value) return selected.value
    return nextSpecialRelease(days.value, today.value) || today.value
  })
  function step(amount: number) {
    const next = shiftMenuDate(date.value, amount)
    if (next >= today.value) selected.value = next
  }

  const { status, item } = useDatedMenuDishRead(
    computed(() => props.kitchenId),
    computed(() => props.menu),
    date
  )
  return { date, today, step, status, item }
}
