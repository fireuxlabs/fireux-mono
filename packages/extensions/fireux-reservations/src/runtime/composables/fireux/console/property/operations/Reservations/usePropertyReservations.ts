import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActiveProperty,
  usePropertyConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/property/operations/useActiveProperty'
import {
  ReservationStorage,
  type Reservation,
  type ReservationStatus,
} from '../../../../../../models/reservation.model'
import { reservationNights } from '../../../../../../utils/reservation-date'
import { usePropertyReservationDemoData } from './usePropertyReservationDemoData'

export function usePropertyReservations(
  runtimeProperty = useActiveProperty()
) {
  const collectionPath = usePropertyConsoleChildPath(
    runtimeProperty,
    ReservationStorage.collection
  )
  const { firestoreFetchCollection } = useFirestoreRead()
  const live = firestoreFetchCollection<Reservation>(collectionPath)
  const demo = usePropertyReservationDemoData(runtimeProperty.isDemo)

  const collection = computed<Reservation[]>(() => {
    const records = runtimeProperty.isDemo.value
      ? (demo.data.value ?? [])
      : (live.value ?? [])

    return records
      .filter((reservation) =>
        reservation.property_id === runtimeProperty.id.value
      )
      .slice()
      .sort((first, second) =>
        first.arrival_date.localeCompare(second.arrival_date)
      )
  })
  const pending = computed(() =>
    runtimeProperty.isDemo.value ? demo.pending.value : live.pending.value
  )
  const error = computed(() =>
    runtimeProperty.isDemo.value ? demo.error.value : live.error.value
  )
  const outcome = computed(() =>
    runtimeProperty.isDemo.value ? demo.outcome.value : live.outcome.value
  )
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

    for (const record of collection.value) {
      statuses[record.status] += 1
      if (record.status !== 'cancelled') {
        occupiedNights += reservationNights(record)
      }
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
    collectionPath,
    collection,
    reservation,
    pending,
    error,
    outcome,
    summary,
    canWrite: runtimeProperty.canWrite,
  }
}
