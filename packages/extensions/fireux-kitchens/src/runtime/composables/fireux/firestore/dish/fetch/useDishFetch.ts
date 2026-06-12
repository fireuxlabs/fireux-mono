import { doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, unref, type Ref } from 'vue'
import { DishStorage, normalizeDish, type Dish } from '../../../../../models/dish.model'
import { resolveKitchenScopeCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'
import { useKitchenConsoleSelection } from '../../../console/kitchen/core/useKitchenConsoleSelection'

const resolveDishesPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/${DishStorage.collection}`

type UseDishFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  kitchenId?: string | Ref<string | null | undefined>
}

export function useDishFetch(
  dishId: string | Ref<string | null | undefined>,
  options: UseDishFetchOptions = {}
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenConsoleSelection()

  const resolvedDishId = computed(() => String(unref(dishId) || '').trim())
  const resolvedKitchenId = computed(() =>
    String(unref(options.kitchenId) || selectedId.value || '').trim()
  )
  const kitchenCollectionPath = computed(() =>
    String(unref(options.kitchenCollectionPath) || '').trim() ||
    resolveKitchenScopeCollectionPath(appId)
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? resolveDishesPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )

  const dishRef = computed(() => {
    if (!collectionPath.value || !resolvedDishId.value) return null
    return doc(db, collectionPath.value, resolvedDishId.value)
  })

  const { data, pending, error } = useDocument(dishRef, {
    ssrKey: computed(() =>
      dishRef.value ? `${collectionPath.value}-${resolvedDishId.value}` : undefined
    ),
    transform: (docSnap: any) => {
      if (!docSnap?.exists?.()) return undefined
      return normalizeDish({ id: docSnap.id, ...(docSnap.data() ?? {}) })
    },
  } as any)

  return {
    kitchenId: resolvedKitchenId,
    collectionPath,
    dish: data as Ref<Dish | undefined>,
    pending,
    error,
  }
}
