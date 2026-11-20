import { computed, type WatchSource } from 'vue'
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
  const scopeKey = computed(() =>
    JSON.stringify([
      currentUser.value?.uid,
      config.appId,
      session.appUser.value,
      session.pending.value,
      Boolean(session.error.value),
      access.outcome.value,
      access.ids.value,
    ])
  )
  const capture = useCommandScope([scopeKey, ...sources])
  async function send(
    method: 'POST' | 'PATCH' | 'DELETE',
    entity: 'preparations' | 'recipes',
    kitchenId: string,
    input: object,
    isOwnerCurrent: () => boolean,
    expectedId?: string
  ) {
    if (
      !isFirestoreDocumentId(kitchenId) ||
      (expectedId !== undefined && !isFirestoreDocumentId(expectedId))
    )
      throw new Error('Choose a Kitchen record.')
    const body = JSON.parse(JSON.stringify({ kitchenId, ...input }))
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
      { method, headers: { Authorization: `Bearer ${token}` }, body }
    )
    if (
      !isFirestoreDocumentId(result?.id) ||
      (expectedId !== undefined && result.id !== expectedId)
    )
      throw new Error('Command response did not identify the requested record.')
    return result
  }
  function update(
    entity: 'preparations' | 'recipes',
    kitchenId: string,
    id: string,
    changes: object,
    isOwnerCurrent: () => boolean
  ) {
    return send(
      'PATCH',
      entity,
      kitchenId,
      {
        [entity === 'recipes' ? 'recipeId' : 'preparationId']: id,
        changes,
      },
      isOwnerCurrent,
      id
    )
  }
  function createRecipe(
    kitchenId: string,
    draft: object,
    isOwnerCurrent: () => boolean
  ) {
    return send('POST', 'recipes', kitchenId, { draft }, isOwnerCurrent)
  }
  function deleteRecipe(
    kitchenId: string,
    recipeId: string,
    isOwnerCurrent: () => boolean
  ) {
    return send(
      'DELETE',
      'recipes',
      kitchenId,
      { recipeId },
      isOwnerCurrent,
      recipeId
    )
  }
  return { update, createRecipe, deleteRecipe, scopeKey }
}
