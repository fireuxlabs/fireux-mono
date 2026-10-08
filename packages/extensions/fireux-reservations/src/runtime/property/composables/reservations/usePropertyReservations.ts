import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useActiveProperty } from 'fireux-properties/runtime/property/composables/workspace/useActiveProperty'
import type {
  Reservation,
  ReservationListResponse,
  ReservationStatus,
} from '../../models/reservation.model.ts'
import { reservationNights } from '../../utils/reservation-date'

export function usePropertyReservations(runtimeProperty = useActiveProperty()) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const sources = [
    () => currentUser.value?.uid || '',
    () => config.appId,
    () => JSON.stringify(appUser.value),
    runtimeProperty.id,
    runtimeProperty.canRead,
  ]
  const captureScope = useCommandScope(sources)
  const epoch = ref(0)
  watch(
    sources,
    () => {
      epoch.value += 1
    },
    { flush: 'sync' }
  )
  const readKey = computed(
    () =>
      `property-reservations:${config.appId}:${currentUser.value?.uid || ''}:${runtimeProperty.id.value}:${runtimeProperty.canRead.value}:${epoch.value}`
  )
  const settledKey = ref('')
  const state = useLiveAsyncData<ReservationListResponse>(
    readKey,
    async (liveFetch) => {
      const user = currentUser.value
      const propertyId = runtimeProperty.id.value
      const key = readKey.value
      const isCurrent = captureScope()
      if (!runtimeProperty.canRead.value || !propertyId || !user)
        return { items: [], limit: 0, truncated: false }
      try {
        const token = await user.getIdToken()
        if (!isCurrent()) return { items: [], limit: 0, truncated: false }
        const result = await liveFetch<ReservationListResponse>(
          `/api/workspace/properties/${encodeURIComponent(propertyId)}/reservations`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!isCurrent()) return { items: [], limit: 0, truncated: false }
        if (result.items.some((item) => item.property_id !== propertyId))
          throw new Error(
            'Reservation results did not match the requested Property.'
          )
        settledKey.value = key
        return result
      } catch (error) {
        if (!isCurrent()) return { items: [], limit: 0, truncated: false }
        settledKey.value = key
        throw error
      }
    },
    { server: false }
  )
  const outcome = computed(() =>
    runtimeProperty.targetOutcome.value !== 'ready'
      ? runtimeProperty.targetOutcome.value
      : resolveReadOutcome({
          active: runtimeProperty.canRead.value,
          current: settledKey.value === readKey.value,
          pending: state.pending.value,
          error: state.error.value,
          kind: 'collection',
          present: Boolean(state.data.value?.items.length),
        })
  )
  const collection = computed<Reservation[]>(() =>
    outcome.value === 'ready'
      ? [...(state.data.value?.items ?? [])].sort((first, second) =>
          first.arrival_date.localeCompare(second.arrival_date)
        )
      : []
  )
  const pending = computed(() => outcome.value === 'pending')
  const error = computed(() =>
    outcome.value === 'error'
      ? 'Reservations could not be loaded. Try again when the connection is available.'
      : ''
  )
  const truncated = computed(
    () => outcome.value === 'ready' && Boolean(state.data.value?.truncated)
  )
  const refresh = state.refresh
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
    truncated,
    summary,
    refresh,
    canWrite: runtimeProperty.canWrite,
  }
}
