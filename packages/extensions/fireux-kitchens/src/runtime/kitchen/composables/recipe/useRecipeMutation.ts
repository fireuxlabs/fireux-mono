import type { WatchSource } from 'vue'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { useRoute } from '#imports'
import { useRecipeScope } from './useRecipeScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'

/** Shared credential and stale-intent boundary for the three Recipe commands. */
export function useRecipeMutation(ownerSources: WatchSource[] = []) {
  const route = useRoute()
  const { currentUser } = useAuth()
  const { selectedId } = useKitchenWorkspaceSelection()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const captureScope = useRecipeScope([
    selectedId,
    () => route.fullPath,
    ...ownerSources,
  ])
  async function mutate(
    method: 'POST' | 'PATCH' | 'DELETE',
    input: Record<string, unknown>,
    override?: string,
    prepare?: (
      body: Record<string, unknown>,
      assertCurrent: () => void
    ) => Promise<Record<string, unknown>>
  ) {
    requireWritableData()
    const kitchenId = String(override || selectedId.value || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required')
    const isCurrent = captureScope(),
      uid = currentUser.value?.uid
    let body = JSON.parse(JSON.stringify({ ...input, kitchenId }))
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent())
        throw new Error(
          'The account or Kitchen changed. Reopen the Recipe editor.'
        )
    }
    assertScope()
    if (prepare) {
      body = await prepare(body, assertScope)
      assertScope()
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen the Recipe editor.')
    const token = await user.getIdToken()
    assertScope()
    requireWritableData()
    const result = await $fetch<{ id: string }>(
      '/api/workspace/kitchen/recipes',
      {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body,
      }
    )
    if (
      typeof result?.id !== 'string' ||
      result.id !== result.id.trim() ||
      !isFirestoreDocumentId(result.id) ||
      (method !== 'POST' && result.id !== body.recipeId)
    )
      throw new Error('Recipe response did not identify the requested record.')
    return result
  }
  return { mutate }
}
