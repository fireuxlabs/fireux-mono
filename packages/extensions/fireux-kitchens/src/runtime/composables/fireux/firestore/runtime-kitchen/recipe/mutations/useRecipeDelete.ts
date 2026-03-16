import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { computed, unref, type Ref } from 'vue'
import { useRuntimeKitchenSelection } from '../../../../app/kitchen-runtime/state'

const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'

const trim = (value: unknown) => String(value || '').trim()

export function useRecipeDelete(options: { kitchenCollectionPath?: string | Ref<string | null | undefined> } = {}) {
  const { deleteDocument } = useFirestoreDelete()
  const { runtimeKitchenId } = useRuntimeKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || DEFAULT_KITCHEN_COLLECTION_PATH).trim()
  )

  const deleteRecipe = async (
    recipeId: string,
    overrides: { kitchenId?: string } = {}
  ) => {
    const resolvedRecipeId = trim(recipeId)
    if (!resolvedRecipeId) throw new Error('Recipe id is required')

    const kitchenId = trim(overrides.kitchenId || runtimeKitchenId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    await deleteDocument(`${kitchenCollectionPath.value}/${kitchenId}/recipes`, resolvedRecipeId)
  }

  return { deleteRecipe }
}