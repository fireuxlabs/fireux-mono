import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { attachDevCollectionMeta } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useCollection,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { collection, query as fsq, type Query, type QueryDocumentSnapshot } from 'firebase/firestore'
import type { Ref } from 'vue'
import { computed, ref, unref } from 'vue'
import { resolveKitchenChildCollectionBasePath } from '../../../../app/kitchen-console/shared'
import type {
    Ingredient,
    KitchenIngredient,
} from '../../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'
const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/ingredients`

type UseKitchenIngredientFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

type KitchenIngredientRecord = KitchenIngredient &
  Partial<Ingredient> & {
    ingredient_id: string
  }

export function useKitchenIngredientFetch(
  kitchenId: Ref<string> | string,
  options: UseKitchenIngredientFetchOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()

  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )

  const kitchenCollectionPath = computed(() =>
    resolveKitchenChildCollectionBasePath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      collectionName: 'ingredients',
      appId,
    })
  )

  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveKitchenCollectionPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )
  const resolveDb = useFirestoreResolver(options.databaseId)

  const kitchenQuery = computed<Query<KitchenIngredient> | null>(() => {
    const path = collectionPath.value
    if (!path) return null
    return fsq(collection(resolveDb(), path)) as Query<KitchenIngredient>
  })
  const kitchenItems = import.meta.server
    ? ref(undefined) as Ref<KitchenIngredient[] | undefined>
    : useCollection<KitchenIngredient>(kitchenQuery, {
        ssrKey: computed(() => collectionPath.value || 'kitchen-ingredients-empty'),
        transform: (docSnap: QueryDocumentSnapshot<KitchenIngredient>) => {
          const value = {
            ...(docSnap.data() as KitchenIngredient),
            id: docSnap.id,
          } as KitchenIngredient & Record<string, unknown>
          return collectionPath.value
            ? attachDevCollectionMeta(value, collectionPath.value, docSnap.id) as KitchenIngredient
            : value as KitchenIngredient
        },
      } as any) as Ref<KitchenIngredient[] | undefined>

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

  const ingredients = computed<KitchenIngredientRecord[]>(() => {
    const kitchenEntries = kitchenItems.value ?? []

    return kitchenEntries.map((entry) => {
      const linkId = String((entry as any).ingredient_id || entry.id || '').trim()
      const global = ingredientById.value.get(linkId)
      const entryImage = String((entry as any).image_url || '').trim()
      const globalImage = String((global as any)?.image_url || '').trim()
      const entryName = String((entry as any).name || '').trim()
      const globalName = String((global as any)?.name || '').trim()

      return {
        ...(global ?? {}),
        ...entry,
        id: String(entry.id || linkId).trim() || linkId,
        ingredient_id: linkId,
        image_url: entryImage || globalImage,
        name: entryName || globalName,
      }
    })
  })

  const count = computed(() => ingredients.value.length)
  const pending = computed(() => {
    if (!resolvedKitchenId.value) return false

    return (
      kitchenItems.value === undefined ||
      globalIngredients.value === undefined
    )
  })
  const { byId: ingredient } = useCollectionById(ingredients)

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    ingredients,
    ingredient,
    count,
    pending,
  }
}
