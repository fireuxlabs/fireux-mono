// Concurrent edit — 2026-07-22 01:09 CEST — Dish media ownership: reject raw image URL patches outside the canonical upload boundary.
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { computed, unref, type Ref } from 'vue'
import {
  DishStorage,
  type Dish,
  type DishUpdateInput,
} from '../../utils/dish.ts'
import { resolveKitchenScopeCollectionPath } from '../../utils/kitchen-collection-path'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'

import { dishCategories } from '../../models/dish.model'

const trim = (value: unknown) => String(value || '').trim()
const optional = (value: unknown) => trim(value) || undefined

export function useDishUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()

  const kitchenCollectionPath = computed(
    () =>
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
    if ('category' in patch) {
      if (!dishCategories.some((category) => category.value === patch.category))
        throw new Error('Choose a valid dish category.')
      next.category = patch.category
    }
    if ('spec' in patch) {
      const spec = patch.spec
      if (
        !spec ||
        !Number.isFinite(Number(spec.portion)) ||
        Number(spec.portion) <= 0
      )
        throw new Error('Enter a positive portion count.')
      for (const row of [...spec.ingredients, ...spec.prep_items]) {
        const id = 'ingredient_id' in row ? row.ingredient_id : row.prep_item_id
        if (
          !id ||
          id.includes('/') ||
          !Number.isFinite(Number(row.quantity)) ||
          Number(row.quantity) <= 0 ||
          !row.unit
        )
          throw new Error(
            'Every component needs an item, positive quantity and unit.'
          )
      }
      if (spec.recipe_ids.some((id) => !id || id.includes('/')))
        throw new Error('Choose valid recipes.')
      next.spec = spec
    }
    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${DishStorage.collection}`
    await updateDocument<Dish>(collectionPath, resolvedDishId, next)
  }

  return { updateDish }
}
