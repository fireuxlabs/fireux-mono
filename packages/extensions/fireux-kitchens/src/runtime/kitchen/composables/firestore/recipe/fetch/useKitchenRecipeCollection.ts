import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import {
  RecipeStorage,
  normalizeRecipe,
  type Recipe,
} from '../../../../utils/recipe.ts'
import { resolveKitchenChildCollectionBasePath } from '../../utils/paths/useKitchenChildCollection'

const resolveRecipesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/${RecipeStorage.collection}`

type UseKitchenRecipeCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenRecipeCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseKitchenRecipeCollectionOptions = {}
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
  const collectionRef =
    firestoreFetchCollection<Record<string, unknown>>(collectionPath)

  const recipes = computed<Recipe[]>(() =>
    (collectionRef.value ?? []).map((entry) => normalizeRecipe(entry))
  )
  const count = computed(() => recipes.value.length)
  const pending = computed(() => collectionRef.pending.value)
  const error = computed(() => collectionRef.error.value)
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count,
    pending,
    error,
  })

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    recipes,
    count,
    pending,
    error,
    outcome,
  }
}
