import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { computed, unref, type Ref } from 'vue'
import { DishStorage } from '../../../../utils/dish.ts'
import { resolveKitchenScopeCollectionPath } from '../../utils/paths/useKitchenChildCollection'
import { useKitchenWorkspaceSelection } from '../../../workspace/core/useKitchenWorkspaceSelection'

const trim = (value: unknown) => String(value || '').trim()

export function useDishDelete(
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
      String(unref(options.kitchenCollectionPath) || '').trim() ||
      resolveKitchenScopeCollectionPath(appId)
  )

  const deleteDish = async (
    dishId: string,
    overrides: { kitchenId?: string } = {}
  ) => {
    requireWritableData()
    const resolvedDishId = trim(dishId)
    if (!resolvedDishId) throw new Error('Dish id is required')

    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    await deleteDocument(
      `${kitchenCollectionPath.value}/${kitchenId}/${DishStorage.collection}`,
      resolvedDishId
    )
  }

  return { deleteDish }
}
