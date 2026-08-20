// Concurrent edit — 2026-07-22 01:09 CEST — Dish media ownership: reject raw image URL patches outside the canonical upload boundary.
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { computed, unref, type Ref } from 'vue'
import {
  DishStorage,
  type Dish,
  type DishUpdateInput,
} from '../../../../models/dish.model.ts'
import { resolveKitchenScopeCollectionPath } from '../../utils/paths/useKitchenChildCollection'
import { useKitchenWorkspaceSelection } from '../../../workspace/core/useKitchenWorkspaceSelection'

const trim = (value: unknown) => String(value || '').trim()
const optional = (value: unknown) => trim(value) || undefined

export function useDishUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()

  const kitchenCollectionPath = computed(() =>
    trim(unref(options.kitchenCollectionPath)) ||
    resolveKitchenScopeCollectionPath(appId)
  )

  const updateDish = async (
    dishId: string,
    patch: Partial<DishUpdateInput> & Record<string, unknown>,
    overrides: { kitchenId?: string } = {}
  ) => {
    requireWritableData()
    const resolvedDishId = trim(dishId)
    if (!resolvedDishId) throw new Error('Dish id is required')

    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')
    if ('image' in patch || 'image_url' in patch) {
      throw new Error('Use the Dish image upload to update Dish media.')
    }

    const next: Partial<Dish> = {}

    if ('name' in patch) next.name = trim(patch.name)
    if ('slug' in patch) next.slug = optional(patch.slug) || ''
    if ('description' in patch) next.description = trim(patch.description)
    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${DishStorage.collection}`
    await updateDocument<Dish>(collectionPath, resolvedDishId, next)
  }

  return { updateDish }
}
