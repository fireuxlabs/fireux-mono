import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import type {
    Ingredient,
    KitchenIngredient,
    KitchenIngredientResolved,
} from '../../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/ingredients`

type UseKitchenIngredientFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useKitchenIngredientFetch(
  kitchenId: Ref<string> | string,
  options: UseKitchenIngredientFetchOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()

  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )

  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || DEFAULT_KITCHEN_COLLECTION_PATH).trim()
  )

  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveKitchenCollectionPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )

  const kitchenCollectionRef = shallowRef(null) as ShallowRef<
    Ref<KitchenIngredient[] | undefined> | null
  >

  watch(
    collectionPath,
    (nextPath) => {
      kitchenCollectionRef.value = nextPath
        ? firestoreFetchCollection<KitchenIngredient>(nextPath)
        : null
    },
    { immediate: true }
  )

  const globalIngredients = firestoreFetchCollection<Ingredient>(GLOBAL_COLLECTION_PATH)

  const ingredientById = computed(() => {
    const map = new Map<string, Ingredient>()
    for (const ingredient of globalIngredients.value ?? []) {
      const id = String(ingredient.id || '').trim()
      if (!id) continue
      map.set(id, ingredient)
    }
    return map
  })

  const ingredients = computed<KitchenIngredientResolved[]>(() => {
    const kitchenItems = kitchenCollectionRef.value?.value ?? []

    return kitchenItems.map((entry) => {
      const linkId = String(entry.id || '').trim()
      const global = ingredientById.value.get(linkId)

      return {
        ...(global ?? {}),
        ...entry,
        id: linkId,
      }
    })
  })

  const count = computed(() => ingredients.value.length)

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    ingredients,
    count,
  }
}
