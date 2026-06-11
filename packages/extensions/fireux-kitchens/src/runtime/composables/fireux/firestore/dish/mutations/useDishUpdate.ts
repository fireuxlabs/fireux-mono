import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, unref, type Ref } from 'vue'
import {
  DishStorage,
  type Dish,
  type DishUpdateInput,
} from '../../../../../models/dish.model'
import { resolveKitchenScopeCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'
import { useKitchenConsoleTargets } from '../../../console/kitchen/core/useKitchenConsoleTargets'

const trim = (value: unknown) => String(value || '').trim()
const optional = (value: unknown) => trim(value) || undefined

export function useDishUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenConsoleTargets()

  const kitchenCollectionPath = computed(() =>
    trim(unref(options.kitchenCollectionPath)) ||
    resolveKitchenScopeCollectionPath(appId)
  )

  const updateDish = async (
    dishId: string,
    patch: Partial<DishUpdateInput> & Record<string, unknown>,
    overrides: { kitchenId?: string } = {}
  ) => {
    const resolvedDishId = trim(dishId)
    if (!resolvedDishId) throw new Error('Dish id is required')

    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const next: Partial<Dish> = {}

    if ('name' in patch) next.name = trim(patch.name)
    if ('slug' in patch) next.slug = optional(patch.slug) || ''
    if ('description' in patch) next.description = trim(patch.description)

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${DishStorage.collection}`
    await updateDocument<Dish>(collectionPath, resolvedDishId, next)
  }

  return { updateDish }
}
