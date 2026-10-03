import type { Ref } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import {
  requirePropertyWorkspaceWrite,
  useActiveProperty,
  type ActivePropertyRuntime,
} from 'fireux-properties/runtime/property/composables/workspace/useActiveProperty'
import type {
  Reservation,
  ReservationCreateInput,
  ReservationResponse,
} from '../../models/reservation.model.ts'

export function useReservationCreate(
  _existingReservations: Ref<Reservation[]>,
  runtimeProperty: ActivePropertyRuntime = useActiveProperty()
) {
  async function createReservation(input: ReservationCreateInput) {
    const propertyId = requirePropertyWorkspaceWrite(runtimeProperty, 'fireux-reservations')
    const user = await useRequireUser()
    const response = await $fetch<ReservationResponse>(
      `/api/workspace/properties/${encodeURIComponent(propertyId)}/reservations`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: input,
      }
    )
    return response.reservation.id
  }
  return { createReservation }
}
