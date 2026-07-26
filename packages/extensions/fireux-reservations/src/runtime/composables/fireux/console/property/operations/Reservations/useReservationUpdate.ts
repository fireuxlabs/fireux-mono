import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePropertyConsoleWrite,
  useActiveProperty,
  usePropertyConsoleChildPath,
  type ActivePropertyRuntime,
} from 'fireux-properties/runtime/composables/fireux/console/property/operations/useActiveProperty'
import {
  ReservationStorage,
  type Reservation,
  type ReservationUpdateInput,
} from '../../../../../../models/reservation.model'

const normalize = (value: unknown) => String(value ?? '').trim()

export function useReservationUpdate(
  runtimeProperty: ActivePropertyRuntime = useActiveProperty()
) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePropertyConsoleChildPath(
    runtimeProperty,
    ReservationStorage.collection
  )

  async function updateReservation(
    reservationId: string,
    patch: ReservationUpdateInput
  ) {
    requirePropertyConsoleWrite(runtimeProperty, 'fireux-reservations')
    if (runtimeProperty.isDemo.value) {
      throw new Error('[fireux-reservations] Demo reservations are read-only.')
    }

    const id = normalize(reservationId)
    if (!id || !collectionPath.value) {
      throw new Error('[fireux-reservations] reservation path is required.')
    }

    await updateDocument<Omit<Reservation, 'id'>>(
      collectionPath.value,
      id,
      patch
    )
  }

  return {
    updateReservation,
  }
}
