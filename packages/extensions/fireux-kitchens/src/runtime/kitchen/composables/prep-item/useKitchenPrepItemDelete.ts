import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { computed, unref, type Ref } from 'vue'
import { KitchenPrepItemStorage } from '../../utils/prep-item.ts'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'
import { resolveKitchenScopeCollectionPath } from '../../utils/kitchen-collection-path'

const trim = (value: unknown) => String(value ?? '').trim()

export function useKitchenPrepItemDelete(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { deleteDocument } = useFirestoreDelete({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()
  const kitchenCollectionPath = computed(
    () =>
      trim(unref(options.kitchenCollectionPath)) ||
      resolveKitchenScopeCollectionPath(appId)
  )

  const deletePrepItem = async (
    prepItemId: string,
    overrides: { kitchenId?: string } = {}
  ) => {
    requireWritableData()
    const resolvedPrepItemId = trim(prepItemId)
    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!resolvedPrepItemId) throw new Error('Prep Item id is required')
    if (!kitchenId) throw new Error('Kitchen id is required')
    await deleteDocument(
      `${kitchenCollectionPath.value}/${kitchenId}/${KitchenPrepItemStorage.collection}`,
      resolvedPrepItemId
    )
  }

  return { deletePrepItem }
}
