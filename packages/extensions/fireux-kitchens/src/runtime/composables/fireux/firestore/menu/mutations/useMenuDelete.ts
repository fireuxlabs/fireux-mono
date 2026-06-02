import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { menuPath } from '../utils/paths'

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuDelete(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  async function deleteMenu(kitchenId: string, menuId: string) {
    const collectionPath = menuPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId,
      appId,
    })
    const id = clean(menuId)

    if (!collectionPath || !id) {
      throw new Error('[useMenuDelete] menuId is required')
    }

    await deleteDocument(collectionPath, id)
  }

  return { deleteMenu }
}
