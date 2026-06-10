import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { RecipeStorage, normalizeRecipe, type Recipe } from '../../../../../models/recipe.model'
import { resolveKitchenChildCollectionBasePath } from '../../kitchen/utils/paths/useKitchenChildCollection'

const resolveRecipesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/${RecipeStorage.collection}`

type UseRecipeCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useRecipeCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseRecipeCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()

  const resolvedKitchenId = computed(() =>
    String(unref(kitchenId) || '').trim()
  )
  const kitchenCollectionPath = computed(() =>
    resolveKitchenChildCollectionBasePath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      collectionName: RecipeStorage.collection,
      appId,
    })
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveRecipesPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )
  const collectionRef = firestoreFetchCollection<Record<string, unknown>>(
    collectionPath
  )

  const recipes = computed<Recipe[]>(() =>
    (collectionRef.value ?? []).map((entry) => normalizeRecipe(entry))
  )
  const pending = computed(
    () => Boolean(collectionPath.value) && collectionRef.value === undefined
  )

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    recipes,
    count: computed(() => recipes.value.length),
    pending,
  }
}
