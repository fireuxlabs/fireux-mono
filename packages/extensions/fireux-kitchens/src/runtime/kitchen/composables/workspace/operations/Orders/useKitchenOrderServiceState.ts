import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComputedRef,
} from 'vue'
import type { KitchenSurface } from '../../../firestore/utils/view/useKitchenInterface'
import { readWeekdayTimeOpenState } from '../../../../../utils/weekday-time'

type UseKitchenOrderServiceStateOptions = {
  activeOrderCount: ComputedRef<number>
  allowManualOpen: ComputedRef<boolean>
  kitchenId: ComputedRef<string>
  selectedKitchen: ComputedRef<KitchenSurface | null>
  waitingOrderCount: ComputedRef<number>
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => String(value ?? '').trim()

const serviceHours = (kitchen: KitchenSurface | null) => {
  const source = record(kitchen)
  const kitchenHours = record(record(source.orders).operation_hours)
  if (
    text(kitchenHours.timezone) &&
    Array.isArray(kitchenHours.windows) &&
    kitchenHours.windows.length
  ) {
    return kitchenHours
  }

  const placeHours = record(source.business_hours)
  return {
    ...placeHours,
    source: 'place',
    timezone: text(placeHours.timezone) || text(source.timezone),
  }
}

export function useKitchenOrderServiceState(
  options: UseKitchenOrderServiceStateOptions
) {
  const now = ref(new Date())
  const sessionOpen = ref(false)
  let minuteClock: number | undefined

  const scheduledState = computed(() =>
    readWeekdayTimeOpenState(
      serviceHours(options.selectedKitchen.value),
      now.value
    )
  )
  const isOpen = computed(() => scheduledState.value.open || sessionOpen.value)
  const canOpenNow = computed(
    () => options.allowManualOpen.value && !isOpen.value
  )
  const statusLabel = computed(() =>
    isOpen.value
      ? 'Kitchen open'
      : scheduledState.value.known
        ? 'Kitchen closed'
        : 'Kitchen hours unavailable'
  )
  const message = computed(() => {
    if (options.waitingOrderCount.value) {
      const noun =
        options.waitingOrderCount.value === 1
          ? 'scheduled order'
          : 'scheduled orders'
      return `${options.waitingOrderCount.value} ${noun} waiting.`
    }
    if (isOpen.value && options.activeOrderCount.value === 0) {
      return 'Awaiting your first order.'
    }
    if (!isOpen.value && options.activeOrderCount.value === 0) {
      return 'No orders waiting.'
    }
    return ''
  })

  const openNow = () => {
    if (!canOpenNow.value) return
    sessionOpen.value = true
  }

  watch(options.kitchenId, () => {
    sessionOpen.value = false
  })
  onMounted(() => {
    now.value = new Date()
    minuteClock = window.setInterval(() => {
      now.value = new Date()
    }, 60_000)
  })
  onBeforeUnmount(() => {
    if (minuteClock) window.clearInterval(minuteClock)
  })

  return {
    canOpenNow,
    isOpen,
    message,
    openNow,
    scheduledState,
    sessionOpen,
    statusLabel,
  }
}
