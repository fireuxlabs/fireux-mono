// Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: send authenticated removal intent to the trusted boundary.
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

export function usePlaceDelete() {
  const { currentUser } = useAuth(), config = useFireUXConfig(), route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const captureIntent = useCommandScope([() => currentUser.value?.uid, () => config.appId, appUser, appPending, appError, appOutcome, () => route.fullPath])
  async function deletePlace(placeId: string) {
    const id = String(placeId || '').trim()
    if (!id) throw new Error('Place id is required')

    const uid = currentUser.value?.uid, isCurrent = captureIntent()
    const assertCurrent = () => { if (!uid || !isCurrent()) throw new Error('The account, App or page changed. Reopen Place deletion.') }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid) throw new Error('The account changed. Reopen Place deletion.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{ id: string; deleted: boolean }>(`/api/places/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (result?.id !== id || result.deleted !== true) throw new Error('Place deletion response did not match the requested Place.')
    return result
  }

  return { deletePlace }
}
