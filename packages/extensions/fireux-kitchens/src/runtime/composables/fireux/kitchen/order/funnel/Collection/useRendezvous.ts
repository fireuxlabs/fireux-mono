import { computed, ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../../models/kitchen/menu/menu-ordering.model'
import { useMenuServiceComputed } from '../../../../firestore/menu/useMenu'
import { readWeekdayTimeSelectionState } from '../../../../../../utils/weekday-time'

export type CollectionRendezvousMode = 'queue' | 'scheduled'

export function useRendezvous(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const mode = ref<CollectionRendezvousMode>('queue')
  const scheduledDate = ref('today')
  const scheduledTime = ref('')
  const status = computed(() =>
    toValue(order).policy?.message ||
    'Choose whether to join the kitchen queue now or schedule collection for later.'
  )
  const serviceHours = computed(() => {
    const current = toValue(order)

    return current.serviceHours?.operation_hours
  })
  const { menuServiceChip: serviceTimes } =
    useMenuServiceComputed(serviceHours)
  const canJoinQueue = computed(() =>
    !serviceTimes.value.known || serviceTimes.value.open
  )
  const scheduleSelection = computed(() => {
    const current = toValue(order)

    return readWeekdayTimeSelectionState(
      current.serviceHours?.operation_hours,
      scheduledDate.value,
      scheduledTime.value
    )
  })
  const ready = computed(() =>
    mode.value === 'queue' ||
      scheduleSelection.value.available
  )
  const allOptions = [
    {
      label: 'Join the queue',
      description: 'Ask the kitchen for the next available collection slot.',
      icon: 'i-lucide-list-plus',
      value: 'queue',
    },
    {
      label: 'Scheduled',
      description: 'Choose a collection time for later.',
      icon: 'i-lucide-calendar-clock',
      value: 'scheduled',
    },
  ] as const
  const options = computed(() =>
    canJoinQueue.value
      ? allOptions
      : allOptions.filter((option) => option.value !== 'queue')
  )

  watchEffect(() => {
    if (canJoinQueue.value || mode.value !== 'queue') return

    mode.value = 'scheduled'
  })

  return {
    mode,
    options,
    scheduleSelection,
    scheduledDate,
    scheduledTime,
    serviceTimes,
    ready,
    status,
  }
}
