import { useAsyncData } from 'nuxt/app'
import { resolveHttpDocumentOutcome } from 'fireux-core/runtime/utils/http-document-outcome'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { usePropertyScope } from 'fireux-properties/runtime/property/composables/usePropertyScope'
import type { ReservationResponse } from '../../models/reservation.model'

/** Exact, authorized live detail; the Reservation list is not an identity index. */
export function usePropertyReservation(
  reservationId: MaybeRefOrGetter<string>,
  runtimeProperty: ReturnType<typeof usePropertyScope>
) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const id = computed(() => String(toValue(reservationId) || '').trim())
  const key = computed(() =>
    JSON.stringify([
      'property-reservation',
      config.appId,
      currentUser.value?.uid,
      runtimeProperty.id.value,
      runtimeProperty.canRead.value,
      id.value,
    ])
  )
  const state = useAsyncData<(ReservationResponse & { key: string }) | null>(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      if (
        !runtimeProperty.canRead.value ||
        !runtimeProperty.id.value ||
        !id.value ||
        !currentUser.value
      )
        return null
      const requestKey = key.value
      const propertyId = runtimeProperty.id.value
      const requestedId = id.value
      const user = await useRequireUser()
      const token = await user.getIdToken()
      if (requestKey !== key.value || user.uid !== currentUser.value?.uid)
        return null
      const response = await fetchRead<ReservationResponse>(
        `/api/workspace/properties/${encodeURIComponent(propertyId)}/reservations/${encodeURIComponent(requestedId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return { ...response, key: requestKey }
    },
    { server: false }
  )
  const error = computed(
    () =>
      state.error.value ||
      (runtimeProperty.targetOutcome.value === 'error'
        ? new Error('Property could not be loaded.')
        : undefined)
  )
  const outcome = computed(() => {
    if (runtimeProperty.targetOutcome.value === 'pending') return 'pending'
    if (error.value)
      return resolveHttpDocumentOutcome({
        enabled: true,
        pending: false,
        error: error.value,
        present: false,
      })
    if (!runtimeProperty.canRead.value || !currentUser.value) return 'denied'
    if (!id.value) return 'idle'
    if (state.data.value && state.data.value.key !== key.value) return 'pending'
    return resolveHttpDocumentOutcome({
      enabled: Boolean(id.value),
      pending: state.pending.value,
      present:
        state.data.value?.reservation.id === id.value &&
        state.data.value?.reservation.property_id === runtimeProperty.id.value,
    })
  })
  return {
    runtimeProperty,
    reservation: computed(() =>
      outcome.value === 'ready' ? (state.data.value?.reservation ?? null) : null
    ),
    pending: computed(() => outcome.value === 'pending'),
    error,
    outcome,
    canWrite: computed(
      () => outcome.value === 'ready' && runtimeProperty.canWrite.value
    ),
    refresh: state.refresh,
  }
}
