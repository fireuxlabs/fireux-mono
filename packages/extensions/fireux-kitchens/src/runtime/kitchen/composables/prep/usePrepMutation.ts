import type { WatchSource } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { useKitchenAccess } from '../useKitchenAccess'
/** Shared bearer/scope transport; each Entity owns validation and its trusted command. */
export function usePrepMutation(sources: WatchSource[] = []) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const session = useAppSession()
  const access = useKitchenAccess()
  const capture = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(session.appUser.value),
    () => access.outcome.value,
    () => JSON.stringify(access.ids.value),
    ...sources,
  ])
  async function update(
    entity: 'preparations' | 'recipes',
    kitchenId: string,
    id: string,
    changes: object,
    isOwnerCurrent: () => boolean
  ) {
    if (!isFirestoreDocumentId(kitchenId) || !isFirestoreDocumentId(id))
      throw new Error('Choose a Kitchen record.')
    const body = JSON.parse(
      JSON.stringify({
        kitchenId,
        [entity === 'recipes' ? 'recipeId' : 'preparationId']: id,
        changes,
      })
    )
    const current = capture(),
      user = currentUser.value
    const assertCurrent = () => {
      if (
        !user ||
        currentUser.value?.uid !== user.uid ||
        !current() ||
        !isOwnerCurrent() ||
        session.pending.value ||
        session.error.value ||
        access.outcome.value !== 'ready' ||
        !access.ids.value.includes(kitchenId)
      )
        throw new Error('The account or Kitchen changed. Reopen the editor.')
    }
    assertCurrent()
    const token = await user!.getIdToken()
    assertCurrent()
    const result = await $fetch<{ id: string }>(
      `/api/workspace/kitchen/${entity}`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body }
    )
    if (result?.id !== id)
      throw new Error('Save response did not identify the requested record.')
    return result
  }
  return { update }
}
