import type { Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRoute } from '#imports'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import {
  requirePropertyWrite,
  usePropertyScope,
  type PropertyScope,
} from 'fireux-properties/runtime/property/composables/usePropertyScope'
import type {
  Reservation,
  ReservationCreateInput,
  ReservationResponse,
} from '../../models/reservation.model.ts'

export function useReservationCreate(
  _existingReservations: Ref<Reservation[]>,
  runtimeProperty: PropertyScope
) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const route = useRoute()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    () => runtimeProperty.id.value,
    () => runtimeProperty.canWrite.value,
    () => route.fullPath,
  ])
  async function createReservation(input: ReservationCreateInput) {
    const isCurrent = captureIntent()
    const actorUid = currentUser.value?.uid
    const body = JSON.parse(JSON.stringify(input))
    const propertyId = requirePropertyWrite(
      runtimeProperty,
      'fireux-reservations'
    )
    const user = await useRequireUser()
    if (!isCurrent() || user.uid !== actorUid)
      throw new Error('The account or Property changed. Reopen the action.')
    const token = await user.getIdToken()
    if (!isCurrent())
      throw new Error('The account or Property changed. Reopen the action.')
    const response = await $fetch<ReservationResponse>(
      `/api/workspace/properties/${encodeURIComponent(propertyId)}/reservations`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
        retry: 0,
      }
    )
    if (
      !response?.reservation?.id ||
      response.reservation.property_id !== propertyId
    )
      throw new Error(
        'Reservation response did not match the requested Property and Reservation.'
      )
    return response.reservation.id
  }
  return { createReservation, captureIntent }
}
