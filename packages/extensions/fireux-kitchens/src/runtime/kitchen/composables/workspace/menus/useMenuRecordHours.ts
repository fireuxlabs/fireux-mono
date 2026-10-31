import { computed, onScopeDispose, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model'
import type { useKitchenMenuRecordContext } from './useKitchenMenuRecordContext'
import {
  hoursWithinParent,
  serviceHoursSummary,
} from '../../../utils/service-hours'

export function useMenuRecordHours(
  context: Pick<
    ReturnType<typeof useKitchenMenuRecordContext>,
    | 'menu'
    | 'menuId'
    | 'kitchenId'
    | 'kitchenHours'
    | 'timezone'
    | 'canWrite'
    | 'updateMenu'
  >
) {
  const {
    menu,
    menuId,
    kitchenId,
    kitchenHours,
    timezone,
    canWrite,
    updateMenu,
  } = context
  const custom = ref(false)
  const hours = ref<WeekdayTimeWindowsConfig | null>(null)
  const busy = ref(false)
  const error = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  const capture = useCommandScope([kitchenId, menuId, canWrite])
  const conflict = computed(() =>
    Boolean(
      custom.value &&
        hours.value?.windows.length &&
        !hoursWithinParent(hours.value, kitchenHours.value)
    )
  )
  watch(
    () => menu.value?.serving_hours,
    (value) => {
      if (busy.value || timer) return
      custom.value = Boolean(value)
      hours.value = value || null
    },
    { immediate: true, deep: true }
  )
  watch([kitchenId, menuId, canWrite], () => {
    clearTimeout(timer)
    timer = undefined
    busy.value = false
    error.value = ''
  })
  onScopeDispose(() => clearTimeout(timer))
  const empty = (): WeekdayTimeWindowsConfig => ({
    source: 'custom',
    timezone: timezone.value,
    windows: [],
  })
  async function persist(value: WeekdayTimeWindowsConfig | null) {
    if (!canWrite.value || busy.value) return
    const current = capture(),
      kitchen = kitchenId.value,
      id = menuId.value
    busy.value = true
    error.value = ''
    try {
      await updateMenu(kitchen, id, { serving_hours: value })
    } catch (cause) {
      if (current()) {
        error.value =
          cause instanceof Error ? cause.message : 'Please try again.'
        custom.value = Boolean(menu.value?.serving_hours)
        hours.value = menu.value?.serving_hours || null
      }
    } finally {
      if (current()) busy.value = false
    }
  }
  function setMode(value: boolean) {
    clearTimeout(timer)
    timer = undefined
    custom.value = value
    hours.value = value ? empty() : null
    void persist(hours.value)
  }
  function setHours(value: WeekdayTimeWindowsConfig | null) {
    hours.value = value || empty()
    clearTimeout(timer)
    const current = capture(),
      next = hours.value
    timer = setTimeout(() => {
      timer = undefined
      if (current()) void persist(next)
    }, 500)
  }
  return {
    menu,
    canWrite,
    kitchenHours,
    timezone,
    custom,
    hours,
    busy,
    error,
    conflict,
    setMode,
    setHours,
    serviceHoursSummary,
  }
}
