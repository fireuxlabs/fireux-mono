import { refreshNuxtData } from 'nuxt/app'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { PlaceUpdateAdapter } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceUpdate'

export function useSupplierProfileUpdate() {
  const { currentUser } = useAuth()
  async function updateProfile(input: {
    supplierId: string
    placeId: string
    patch: Parameters<PlaceUpdateAdapter['update']>[1]
  }) {
    const body = JSON.parse(JSON.stringify(input)) as typeof input
    const user = currentUser.value
    if (!body.supplierId || !body.placeId || !user || user.isAnonymous)
      throw new Error(
        'Sign in and choose a Supplier before editing its profile.'
      )
    const token = await user.getIdToken()
    if (currentUser.value?.uid !== user.uid)
      throw new Error('The signed-in account changed.')
    const result = await $fetch<{ ok: true; supplierId: string; place: Place }>(
      '/api/workspace/supplier/profile',
      {
        onResponse: async ({ options, response }) => {
          if (
            response.ok &&
            !['GET', 'HEAD'].includes(
              String(options.method || 'GET').toUpperCase()
            )
          )
            await refreshNuxtData()
        },
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body,
        retry: 0,
      }
    )
    if (
      result?.ok !== true ||
      result.supplierId !== body.supplierId ||
      result.place?.id !== body.placeId
    )
      throw new Error(
        'Supplier profile response did not match the requested business.'
      )
    return result.place
  }
  return { updateProfile }
}
