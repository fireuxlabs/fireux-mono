import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { menuPath } from '../utils/paths'

const clean = (value: unknown) => String(value ?? '').trim()
const GLOBAL_COLLECTION_PATH = 'menus'

export function useMenuDelete(
  options: {
    scope?: 'root' | 'kitchen'
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })

  async function deleteMenu(kitchenId: string, menuId: string) {
    const collectionPath =
      options.scope === 'kitchen' || clean(kitchenId)
        ? menuPath({
            kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
            kitchenId,
          })
        : GLOBAL_COLLECTION_PATH
    const id = clean(menuId)

    if (!collectionPath || !id) {
      throw new Error('[useMenuDelete] menuId is required')
    }

    await deleteDocument(collectionPath, id)
  }

  return { deleteMenu }
}
