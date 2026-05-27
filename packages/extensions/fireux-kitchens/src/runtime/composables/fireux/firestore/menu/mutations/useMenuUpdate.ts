import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type { Ref } from 'vue'
import { unref } from 'vue'
import type { Menu, MenuStatus, MenuUpdateInput } from '../../../../../models/menu.model'
import { kitchenMenusPath } from '../../../console/kitchen/operations/menu/paths'

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })

  const collectionPath = (kitchenId: string) =>
    kitchenMenusPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
    })

  async function updateMenu(kitchenId: string, menuId: string, patch: MenuUpdateInput) {
    const path = collectionPath(kitchenId)
    const id = clean(menuId)
    if (!path || !id) throw new Error('Menu id is required')
    await updateDocument<Menu>(path, id, patch)
  }

  async function setMenuStatus(kitchenId: string, menuId: string, status: MenuStatus) {
    await updateMenu(kitchenId, menuId, { status })
  }

  return {
    updateMenu,
    setMenuStatus,
    publishMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'published'),
    archiveMenu: (kitchenId: string, menuId: string) =>
      setMenuStatus(kitchenId, menuId, 'archived'),
  }
}
