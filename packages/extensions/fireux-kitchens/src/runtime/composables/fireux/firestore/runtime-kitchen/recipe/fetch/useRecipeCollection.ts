import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import { normalizeRecipe, type Recipe } from '../../../../../../models/recipe.model'
import { useRuntimeKitchenSelection } from '../../../../app/kitchen-runtime/state'

const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'

const resolveRecipesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/recipes`

type UseRecipeCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useRecipeCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseRecipeCollectionOptions = {}
) {
  const { runtimeKitchenId } = useRuntimeKitchenSelection()
  const { firestoreFetchCollection } = useFirestoreRead()

  const resolvedKitchenId = computed(() =>
    String(unref(kitchenId) || runtimeKitchenId.value || '').trim()
  )
  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || DEFAULT_KITCHEN_COLLECTION_PATH).trim()
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveRecipesPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )

  const collectionRef = shallowRef(null) as ShallowRef<Ref<Record<string, unknown>[] | undefined> | null>

  watch(
    collectionPath,
    (nextPath) => {
      collectionRef.value = nextPath ? firestoreFetchCollection<Record<string, unknown>>(nextPath) : null
    },
    { immediate: true }
  )

  const recipes = computed<Recipe[]>(() =>
    (collectionRef.value?.value ?? []).map((entry) => normalizeRecipe(entry))
  )

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    recipes,
    count: computed(() => recipes.value.length),
  }
}