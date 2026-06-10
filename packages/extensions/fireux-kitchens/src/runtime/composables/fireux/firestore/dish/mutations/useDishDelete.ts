import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { computed, unref, type Ref } from 'vue'
import { DishStorage } from '../../../../../models/dish.model'
import { resolveKitchenConsoleCollectionPath } from '../../../console/kitchen/Operations/Collections/useKitchenChildCollection'
import { useKitchenSelection } from '../../../console/kitchen/useKitchenSelection'

const trim = (value: unknown) => String(value || '').trim()

export function useDishDelete(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || '').trim() ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const deleteDish = async (
    dishId: string,
    overrides: { kitchenId?: string } = {}
  ) => {
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
