import { computed, ref, watch } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useActiveProperty } from 'fireux-properties/runtime/property/composables/workspace/useActiveProperty'
import type {
  Reservation,
  ReservationListResponse,
  ReservationStatus,
} from '../../../../models/reservation.model.ts'
import { reservationNights } from '../../../../utils/reservation-date'
import { usePropertyReservationDemoData } from './usePropertyReservationDemoData'

async function authorizationHeader() {
  const user = await useRequireUser()
  return { Authorization: `Bearer ${await user.getIdToken()}` }
}

export function usePropertyReservations(runtimeProperty = useActiveProperty()) {
  const live = ref<Reservation[]>([])
  const livePending = ref(false)
  const liveError = ref<unknown>(null)
  const demo = usePropertyReservationDemoData(runtimeProperty.isDemo)

  async function refresh() {
    if (
      runtimeProperty.isDemo.value ||
      !runtimeProperty.canRead.value ||
      !runtimeProperty.id.value
    ) {
      live.value = []
      liveError.value = null
      return
    }
    livePending.value = true
    liveError.value = null
    try {
      const response = await $fetch<ReservationListResponse>(
        `/api/workspace/properties/${encodeURIComponent(runtimeProperty.id.value)}/reservations`,
        { headers: await authorizationHeader() }
      )
      live.value = response.items
    } catch (cause) {
      live.value = []
      liveError.value = cause
    } finally {
      livePending.value = false
    }
  }

  watch(
    [runtimeProperty.id, runtimeProperty.isDemo, runtimeProperty.canRead],
    () => void refresh(),
    { immediate: true }
  )

  const collection = computed<Reservation[]>(() => {
    const records = runtimeProperty.isDemo.value
      ? (demo.data.value ?? [])
      : live.value
    return records
      .filter(reservation => reservation.property_id === runtimeProperty.id.value)
      .slice()
      .sort((first, second) => first.arrival_date.localeCompare(second.arrival_date))
  })
  const pending = computed(() =>
    runtimeProperty.isDemo.value ? demo.pending.value : livePending.value
  )
  const error = computed(() =>
    runtimeProperty.isDemo.value ? demo.error.value : liveError.value
  )
  const outcome = computed(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return collection.value.length ? 'ready' : 'empty'
  })
  const { byId: reservation } = useCollectionById(collection)
  const summary = computed(() => {
    const statuses: Record<ReservationStatus, number> = {
      inquiry: 0, hold: 0, confirmed: 0, checked_in: 0, checked_out: 0, cancelled: 0,
    }
    let occupiedNights = 0
    for (const item of collection.value) {
      statuses[item.status] += 1
      if (item.status !== 'cancelled') occupiedNights += reservationNights(item)
    }
    return {
      total: collection.value.length,
      upcoming: statuses.inquiry + statuses.hold + statuses.confirmed,
      occupiedNights,
      statuses,
    }
  })

  return {
    runtimeProperty,
    collection,
    reservation,
    pending,
    error,
    outcome,
    summary,
    refresh,
    canWrite: runtimeProperty.canWrite,
  }
}
