import { useRoute } from '#imports'
import { useRecipeScope } from './useRecipeScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'

/** Shared credential and stale-intent boundary for the three Recipe commands. */
export function useRecipeMutation() {
  const route = useRoute()
  const { currentUser } = useAuth()
  const { selectedId } = useKitchenWorkspaceSelection()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const captureScope = useRecipeScope([selectedId, () => route.fullPath])
  async function mutate(method: 'POST' | 'PATCH' | 'DELETE', input: Record<string, unknown>, override?: string, prepare?: (body: Record<string, unknown>) => Promise<Record<string, unknown>>) {
    requireWritableData()
    const kitchenId = String(override || selectedId.value || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required')
    const isCurrent = captureScope(), uid = currentUser.value?.uid
    let body = JSON.parse(JSON.stringify({ ...input, kitchenId }))
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent())
        throw new Error('The account or Kitchen changed. Reopen the Recipe editor.')
    }
    if (prepare) { body = await prepare(body); assertScope() }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Reopen the Recipe editor.')
    const token = await user.getIdToken()
    assertScope()
    requireWritableData()
    const result = await $fetch<{ id: string }>('/api/workspace/kitchen/recipes', {
      method, headers: { Authorization: `Bearer ${token}` }, body,
    })
    if (!result?.id || (body.recipeId && result.id !== body.recipeId)) throw new Error('Recipe response did not identify the requested record.')
    return result
  }
  return { mutate }
}
