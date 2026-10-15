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
  async function mutate<T>(
    endpoint: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    input: Record<string, unknown>,
    intentCurrent: () => boolean = () => true
  ) {
    requireWritableData()
    const body = JSON.parse(JSON.stringify(input))
    if (!selectedId.value || body.kitchenId !== selectedId.value)
      throw new Error('The selected Kitchen does not match this Menu command.')
    const uid = currentUser.value?.uid,
      isCurrent = captureScope()
    const assertScope = () => {
      if (
        !uid ||
        currentUser.value?.uid !== uid ||
        !isCurrent() ||
        !intentCurrent()
      )
        throw new Error('The account or Menu changed. Reopen the Menu editor.')
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen the Menu editor.')
    const token = await user.getIdToken()
    assertScope()
    requireWritableData()
    const result = await $fetch<
      T & { kitchenId: string; menuId: string; id?: string; ok?: boolean }
    >(`/api/workspace/kitchen/menus${endpoint ? `/${endpoint}` : ''}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    if (
      !result ||
      result.kitchenId !== body.kitchenId ||
      result.menuId !== body.menuId ||
      (result.ok !== true && !result.id)
    )
      throw new Error(
        'Menu response did not match the requested Kitchen and Menu.'
      )
    return result
  }
  return { mutate }
}
