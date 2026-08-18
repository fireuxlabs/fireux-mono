import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import {
  requirePropertyConsoleWrite,
  useActiveProperty,
  type ActivePropertyRuntime,
} from 'fireux-properties/runtime/composables/fireux/console/property/operations/useActiveProperty'
import type {
  ReservationResponse,
  ReservationUpdateInput,
} from '../../../../../../models/reservation.model'

export function useReservationUpdate(
  runtimeProperty: ActivePropertyRuntime = useActiveProperty()
) {
  async function updateReservation(input: {
    reservationId: string
    changes: ReservationUpdateInput
  }) {
    const propertyId = requirePropertyConsoleWrite(
      runtimeProperty,
      'fireux-reservations'
    )
    if (runtimeProperty.isDemo.value) {
      throw new Error('[fireux-reservations] Demo reservations are read-only.')
    }
    const user = await useRequireUser()
    const response = await $fetch<ReservationResponse>(
      `/api/console/properties/${encodeURIComponent(propertyId)}/reservations/${encodeURIComponent(input.reservationId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: input.changes,
      }
    )
    return response.reservation
  }
  return { updateReservation }
}
