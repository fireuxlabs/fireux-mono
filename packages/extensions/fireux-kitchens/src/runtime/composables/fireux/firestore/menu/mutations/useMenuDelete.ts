import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { kitchenMenusPath } from '../../../console/kitchen/operations/menu/paths'

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuDelete(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })

  async function deleteMenu(kitchenId: string, menuId: string) {
    const collectionPath = kitchenMenusPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
    })
    const id = clean(menuId)

    if (!collectionPath || !id) {
      throw new Error('[useMenuDelete] kitchenId and menuId are required')
    }

    await deleteDocument(collectionPath, id)
  }

  return { deleteMenu }
}
