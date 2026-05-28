import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { MenuStorage } from '../../../../../models/menu.model'
import { menuPath } from '../utils/paths'

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuDelete(
  options: {
    shape?: 'root' | 'scoped'
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })

  async function deleteMenu(kitchenId: string, menuId: string) {
    const collectionPath =
      options.shape === 'scoped' || clean(kitchenId)
        ? menuPath({
            shape: 'scoped',
            kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
            kitchenId,
          })
        : MenuStorage.rootCollection
    const id = clean(menuId)

    if (!collectionPath || !id) {
      throw new Error('[useMenuDelete] menuId is required')
    }

    await deleteDocument(collectionPath, id)
  }

  return { deleteMenu }
}
