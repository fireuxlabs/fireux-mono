import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import {
  requirePropertyWorkspaceWrite,
  useActiveProperty,
  type ActivePropertyRuntime,
} from 'fireux-properties/runtime/property/composables/workspace/operations/useActiveProperty'
import type {
  ReservationResponse,
  ReservationUpdateInput,
} from '../../../../models/reservation.model.ts'

export function useReservationUpdate(
  runtimeProperty: ActivePropertyRuntime = useActiveProperty()
) {
  async function updateReservation(input: {
    reservationId: string
    changes: ReservationUpdateInput
  }) {
    const propertyId = requirePropertyWorkspaceWrite(
      runtimeProperty,
      'fireux-reservations'
    )
    if (runtimeProperty.isDemo.value) {
      throw new Error('[fireux-reservations] Demo reservations are read-only.')
    }
    const user = await useRequireUser()
    const response = await $fetch<ReservationResponse>(
      `/api/workspace/properties/${encodeURIComponent(propertyId)}/reservations/${encodeURIComponent(input.reservationId)}`,
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
