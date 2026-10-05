import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useActiveProperty } from 'fireux-properties/runtime/property/composables/workspace/useActiveProperty'
import type {
  Reservation,
  ReservationListResponse,
  ReservationStatus,
} from '../../models/reservation.model.ts'
import { reservationNights } from '../../utils/reservation-date'

async function authorizationHeader() {
  const user = await useRequireUser()
  return { Authorization: `Bearer ${await user.getIdToken()}` }
}

export function usePropertyReservations(runtimeProperty = useActiveProperty()) {
  const { currentUser } = useAuth()
  const state = useLiveAsyncData<ReservationListResponse>(
    computed(
      () =>
        `property-reservations:${currentUser.value?.uid || ''}:${runtimeProperty.id.value}:${runtimeProperty.canRead.value}`
    ),
    (liveFetch) =>
      runtimeProperty.canRead.value && runtimeProperty.id.value
        ? authorizationHeader().then((headers) =>
            liveFetch<ReservationListResponse>(
              `/api/workspace/properties/${encodeURIComponent(runtimeProperty.id.value)}/reservations`,
              { headers }
            )
          )
        : Promise.resolve({
            items: [],
            limit: 0,
            truncated: false,
          } satisfies ReservationListResponse),
    { server: false }
  )
  const live = computed(() => state.data.value?.items || [])
  const refresh = state.refresh
  const collection = computed<Reservation[]>(() => {
    return live.value
      .filter(
        (reservation) => reservation.property_id === runtimeProperty.id.value
      )
      .slice()
      .sort((first, second) =>
        first.arrival_date.localeCompare(second.arrival_date)
      )
  })
  const pending = computed(() => state.pending.value)
  const error = computed(() => state.error.value)
  const outcome = computed(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return collection.value.length ? 'ready' : 'empty'
  })
  const { byId: reservation } = useCollectionById(collection)
  const summary = computed(() => {
    const statuses: Record<ReservationStatus, number> = {
      inquiry: 0,
      hold: 0,
      confirmed: 0,
      checked_in: 0,
      checked_out: 0,
      cancelled: 0,
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
