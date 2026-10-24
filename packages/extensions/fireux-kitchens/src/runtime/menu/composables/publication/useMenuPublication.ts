import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/workspace/composables/useWorkspaceWriteGuard'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useMenuEditorScope } from '../useMenuEditorScope'

export function useMenuPublication() {
  const { currentUser } = useAuth()
  const { selectedId } = useWorkspace('kitchen')
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const route = useRoute()
  const captureScope = useMenuEditorScope([selectedId, () => route.fullPath])

  async function run(
    action: 'publish' | 'unpublish' | 'archive' | 'restore',
    kitchenId: string,
    menuId: string
  ) {
    const user = currentUser.value
    if (!user)
      throw new Error(
        action === 'publish'
          ? 'Sign in before publishing this Menu.'
          : action === 'unpublish'
            ? 'Sign in before unpublishing this menu.'
            : action === 'archive'
              ? 'Sign in before archiving this Menu.'
              : 'Sign in before restoring this Menu.'
      )
    requireWritableData()
    if (!kitchenId || !menuId || kitchenId !== selectedId.value)
      throw new Error('The selected Kitchen does not match this Menu command.')
    const isCurrent = captureScope()
    const token = await user.getIdToken()
    if (!token || !isCurrent() || currentUser.value?.uid !== user.uid)
      throw new Error('The account or Menu changed. Reopen the Menu editor.')
    requireWritableData()
    const result = await $fetch<{ ok: boolean; menu_id?: string }>(
      `/api/workspace/kitchen/menus/${action}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchenId, menuId },
        retry: 0,
      }
    )
    if (
      result?.ok !== true ||
      (action === 'publish' && result.menu_id !== menuId)
    )
      throw new Error(
        'Menu publication response did not match the requested action.'
      )
  }

  return {
    publishMenu: (kitchenId: string, menuId: string) =>
      run('publish', kitchenId, menuId),
    unpublishMenu: (kitchenId: string, menuId: string) =>
      run('unpublish', kitchenId, menuId),
    restoreMenu: (kitchenId: string, menuId: string) =>
      run('restore', kitchenId, menuId),
    archiveMenu: (kitchenId: string, menuId: string) =>
      run('archive', kitchenId, menuId),
  }
}
