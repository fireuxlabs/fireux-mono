// Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: send authenticated removal intent to the trusted boundary.
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

export function usePlaceDelete() {
  async function deletePlace(placeId: string) {
    const id = String(placeId || '').trim()
    if (!id) throw new Error('Place id is required')

    const user = await useRequireUser()
    const token = await user.getIdToken()
    await $fetch(`/api/places/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  return { deletePlace }
}
