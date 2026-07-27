import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { computed, unref, type Ref } from 'vue'
import { DishStorage } from '../../../../../models/kitchen/dish.model'
import { resolveKitchenScopeCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'
import { useKitchenConsoleSelection } from '../../../console/kitchen/core/useKitchenConsoleSelection'

const trim = (value: unknown) => String(value || '').trim()

export function useDishDelete(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenConsoleSelection()

  const kitchenCollectionPath = computed(() =>
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
