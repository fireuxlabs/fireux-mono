import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useKitchenWorkspaceSelection } from '../../../../kitchen/composables/workspace/useKitchenWorkspaceSelection'
import { useMenuEditorScope } from '../../useMenuEditorScope'

/** Capture one Menu command before credentials; never retarget pending intent. */
export function useMenuMutation() {
  const route = useRoute()
  const { currentUser } = useAuth()
  const { selectedId } = useKitchenWorkspaceSelection()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const captureScope = useMenuEditorScope([selectedId, () => route.fullPath])
  async function mutate<T>(endpoint: string, method: 'POST' | 'PATCH' | 'DELETE', input: Record<string, unknown>) {
    requireWritableData()
    const body = JSON.parse(JSON.stringify(input))
    const uid = currentUser.value?.uid, isCurrent = captureScope()
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent()) throw new Error('The account or Menu changed. Reopen the Menu editor.')
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Reopen the Menu editor.')
    const token = await user.getIdToken()
    assertScope()
    requireWritableData()
    const result = await $fetch<T>(`/api/workspace/kitchen/menus${endpoint ? `/${endpoint}` : ''}`, { method, headers: { Authorization: `Bearer ${token}` }, body })
    assertScope()
    return result
  }
  return { mutate }
}
