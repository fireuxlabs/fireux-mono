import {
  computed,
  ref,
  toValue,
  watch,
  watchEffect,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuOrderingCollectionState } from '../../models/menu-order-draft.model.ts'
import type {
  MenuOrderPreviewState,
  MenuOrderingIncoming,
} from '../../models/menu-order-preview.model.ts'
import { useMenuServiceComputed } from '../useMenuServiceComputed'
import {
  readWeekdayTimeNoticeState,
  readWeekdayTimeSelectionState,
} from '../../../utils/weekday-time'

export type CollectionMode = 'queue' | 'scheduled'

const todayDate = () => {
  const now = new Date()

  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}
const splitRequestedFor = (value: unknown) => {
  const text = String(value ?? '').trim()
  if (!text) return { date: '', time: '' }

  const [date = '', time = ''] = text.split('T')

  return {
    date,
    time: time.slice(0, 5),
  }
}
const collectionOptions = [
  {
    label: 'Queue',
    description: 'Join the queue and receive an ETA.',
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

export function useMenuPreviewCollectionFunnel(
  order: MaybeRefOrGetter<MenuOrderPreviewState>,
  step: MaybeRefOrGetter<number>,
  incoming: MaybeRefOrGetter<MenuOrderingIncoming>
) {
  const savedCollection = computed(() => toValue(incoming).collection)
  const savedRequestedFor = splitRequestedFor(
    savedCollection.value?.requested_for
  )
  const mode = ref<CollectionMode>(
    savedCollection.value?.mode === 'scheduled' ? 'scheduled' : 'queue'
  )
  const scheduledDate = ref(savedRequestedFor.date || todayDate())
  const dateInputOpen = ref(Boolean(savedRequestedFor.date))
  const scheduledTime = ref(savedRequestedFor.time)
  const serviceHours = computed(() => {
    const current = toValue(order)

    return current.serviceHours?.operation_hours
  })
  const { menuServiceChip: serviceTimes } = useMenuServiceComputed(serviceHours)
  const canJoinQueue = computed(
    () => !serviceTimes.value.known || serviceTimes.value.open
  )
  const scheduleSelection = computed(() => {
    const current = toValue(order)

    return readWeekdayTimeSelectionState(
      current.serviceHours?.operation_hours,
      scheduledDate.value,
      scheduledTime.value
    )
  })
  const noticeSelection = computed(() =>
    readWeekdayTimeNoticeState(
      serviceHours.value,
      scheduleSelection.value.requested_for,
      toValue(order).policy?.notice_hours
    )
  )
  const requestedFor = computed(() =>
    mode.value === 'scheduled' &&
    scheduleSelection.value.available &&
    noticeSelection.value.available
      ? scheduleSelection.value.requested_for
      : ''
  )
  const collection = computed<MenuOrderingCollectionState>(() => ({
    mode: mode.value,
    ...(requestedFor.value ? { requested_for: requestedFor.value } : {}),
  }))
  const requestReady = computed(
    () =>
      mode.value === 'queue' ||
      (scheduleSelection.value.available && noticeSelection.value.available)
  )
  const ready = computed(() => canContinue(Number(toValue(step)) || 1))
  const options = computed(() =>
    canJoinQueue.value
      ? collectionOptions
      : collectionOptions.filter((option) => option.value !== 'queue')
  )
  const scheduledDateLabel = computed(() =>
    scheduledDate.value === todayDate() ? 'Today' : scheduledDate.value
  )

  function canContinue(step: number) {
    if (step === 2) return Boolean(toValue(incoming).allergen_checked)
    if (step === 3) return requestReady.value

    return true
  }

  function reset() {
    const nextRequestedFor = splitRequestedFor(
      savedCollection.value?.requested_for
    )

    mode.value =
      savedCollection.value?.mode === 'scheduled' ? 'scheduled' : 'queue'
    scheduledDate.value = nextRequestedFor.date || todayDate()
    scheduledTime.value = nextRequestedFor.time
    dateInputOpen.value = Boolean(nextRequestedFor.date)
  }

  function openDateInput() {
    dateInputOpen.value = true
  }

  watch(
    () => toValue(order).quantity,
    (quantity: number) => {
      if (quantity) return

      reset()
    }
  )

  watch(
    () => toValue(order).orderType,
    () => {
      reset()
    }
  )

  watch(
    savedCollection,
    (nextCollection: MenuOrderingCollectionState | undefined) => {
      if (!nextCollection) return
      if (
        nextCollection.mode === 'queue' ||
        nextCollection.mode === 'scheduled'
      ) {
        mode.value = nextCollection.mode
      }

      const nextRequestedFor = splitRequestedFor(nextCollection.requested_for)
      if (!nextRequestedFor.date) return

      scheduledDate.value = nextRequestedFor.date
      scheduledTime.value = nextRequestedFor.time
      dateInputOpen.value = true
    },
    { deep: true }
  )

  watchEffect(() => {
    if (canJoinQueue.value || mode.value !== 'queue') return

    mode.value = 'scheduled'
  })

  return {
    canContinue,
    collection,
    dateInputOpen,
    mode,
    noticeSelection,
    openDateInput,
    options,
    ready,
    requestReady,
    requestedFor,
    scheduleSelection,
    scheduledDate,
    scheduledDateLabel,
    scheduledTime,
    serviceTimes,
  }
}

export type MenuOrderingCollectionFunnel = ReturnType<
  typeof useMenuPreviewCollectionFunnel
>
