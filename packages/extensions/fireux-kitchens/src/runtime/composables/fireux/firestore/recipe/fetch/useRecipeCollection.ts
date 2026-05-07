import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import { normalizeRecipe, type Recipe } from '../../../../../models/recipe.model'
import { resolveKitchenChildCollectionBasePath } from '../../../app/kitchen-console/shared'

const resolveRecipesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/recipes`

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
      collectionName: 'recipes',
      appId,
    })
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveRecipesPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )
  const databaseIdKey = computed(() => String(unref(options.databaseId) || '').trim())

  const collectionRef = shallowRef(null) as ShallowRef<Ref<Record<string, unknown>[] | undefined> | null>

  watch(
    [collectionPath, databaseIdKey],
    ([nextPath]) => {
      collectionRef.value = nextPath ? firestoreFetchCollection<Record<string, unknown>>(nextPath) : null
    },
    { immediate: true }
  )

  const recipes = computed<Recipe[]>(() =>
    (collectionRef.value?.value ?? []).map((entry) => normalizeRecipe(entry))
  )
  const pending = computed(
    () => Boolean(collectionPath.value) && collectionRef.value?.value === undefined
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
